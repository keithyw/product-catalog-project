import inspect
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.tools import BaseTool, FunctionTool
from google.genai import types
from typing import Any, Dict, List
from .session_manager import AgentSessionManager

class RunnerService:
    def __init__(self, agent: Agent, app_name: str, user_id: str, manager: AgentSessionManager, tools: List[BaseTool]):
        self._agent = agent
        self._app_name = app_name
        self._manager = manager
        self._user_id = user_id
        self._runner = Runner(
            agent=agent,
            app_name=app_name,
            session_service=manager.session_service,
        )
        self._tools_map: Dict[str, BaseTool] = {
            tool.name: tool for tool in tools
        }
        self._function_tools_map: Dict[str, FunctionTool] = {
            tool.name: tool for tool in tools if isinstance(tool, FunctionTool)
        }

    @property
    def runner(self):
        return self._runner

    async def _execute_tool_function(self, function_call: types.FunctionCall) -> Dict:
        tool_name = function_call.name
        if tool_name not in self._tools_map:
            raise NotImplementedError(f"FunctionTool '{tool_name}' not registered with this runner.")
        function_tool: FunctionTool = self._tools_map[tool_name]
        func_to_call = function_tool.func
        sig = inspect.signature(func_to_call)
        input_param = next(iter(sig.parameters.values()), None)
        result_model: Any = None
        if input_param and hasattr(input_param.annotation, 'model_validate'):
            InputSchema = input_param.annotation
            input_data_dict = function_call.args.get(input_param.name, function_call.args)
            input_model = InputSchema.model_validate(input_data_dict)
            result_model = await func_to_call(input_model)
        else:
            result_model = await func_to_call(**function_call.args)
        if hasattr(result_model, 'model_dump'):
            return result_model.model_dump()
        elif isinstance(result_model, dict):
            return result_model
        else:
            return { 'result': result_model }

    async def run(self, message: types.Content) -> str | None:
        if not self._manager.session_id:
            raise ValueError("Session id not set and/or AgentSessionManager has not started via start_session()")
        res = None
        message_to_send = message
        try:
            async for e in self._runner.run_async(
                user_id=self._user_id,
                session_id=self._manager.session_id,
                new_message=message_to_send
            ):
                message_to_send = None
                if e.is_final_response() and e.content and e.content.parts:
                    res = e.content.parts[0].text
                    break
                elif e.content and e.content.parts and e.content.parts[0].function_call:
                    function_call = e.content.parts[0].function_call
                    tool_name = function_call.name
                    if tool_name in self._function_tools_map:
                        tool_result = await self._execute_tool_function(function_call)
                        function_response_part = types.Part(
                            function_response=types.FunctionResponse(
                                name=tool_name,
                                response=tool_result, 
                                id=function_call.id
                            )
                        )
                        message_to_send = types.Content(role='tool', parts=[function_response_part])
                        break
                    elif tool_name in self._tools_map:                    
                        pass
                    elif tool_name == 'set_model_response':
                        pass
                    else:
                        raise NotImplementedError(f"Tool '{tool_name}' requested but not registered with this runner.")
                elif e.content and e.content.parts and e.content.parts[0].text:
                    continue
                else:
                    continue
        except Exception as e:
            print(f"async run failed: {e}")
        if message_to_send and message_to_send != message:
            return await self.run(message_to_send)
        return res

            
    