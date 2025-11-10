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

## 🚧 Agent Safety and Constraints

- **File Exclusion:** The Agent **MUST NOT** read, reference, or modify any files or directories listed in the project's `.gitignore` file, including files in `.vscode/` or `my_scratchpad_scripts/`.
- **Commit Messages:** All generated commit messages must follow the Conventional Commits style (e.g., `refactor(docs): add docstrings to user services`).
- **Confirmation:** Before executing any shell command, the Agent must present the command and seek user confirmation.
