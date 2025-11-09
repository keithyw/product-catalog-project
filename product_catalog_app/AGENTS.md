# Project Conventions for Cursor AI Agents

## Python Documentation Rules

### Docstring Style Enforcement

- **Style:** All function and class docstrings MUST be generated using the **Google Docstring Format** (e.g., Args:, Returns:, Raises:).
- **Completeness:** Docstrings must describe all parameters, return values, and any exceptions that might be explicitly raised.
- **Tone:** The tone should be concise, professional, and clear.

### Code Quality & Standards

- **Type Hinting:** Docstrings and generated code (e.g., examples) SHOULD include type information. **The agent MUST NOT modify the type hints on existing function signatures unless it is generating new code.** If type hints are missing from an existing function signature, the agent must still document the types in the docstring's Args/Returns section.
- **Example Usage (Optional but Recommended):** Where appropriate and possible, include a brief `Example:` section showing how the function or class method is called.

### Agent Behavior

- **Non-Modification:** The Agent is strictly forbidden from changing the logic or implementation code of any function or class unless explicitly instructed otherwise in the prompt.
- **Imports:** Do not modify, add, or remove existing import statements unless absolutely required to make a function work (e.g., for an exception type).
