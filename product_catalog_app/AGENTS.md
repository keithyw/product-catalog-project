# Project Conventions for Cursor AI Agents

## Python Documentation Rules

### Docstring Style Enforcement

- **Style:** All function and class docstrings MUST be generated using the **Google Docstring Format** (e.g., Args:, Returns:, Raises:).
- **Completeness:** Docstrings must describe all parameters, return values, and any exceptions that might be explicitly raised. **NOTE:** For `__init__` methods, use a brief summary and the `Args:` section (if applicable); the `Returns:` section is usually omitted.
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

## 🧪 Unit Testing and Quality Assurance Rules

- **Testing Framework:** All tests MUST be written using the **`pytest`** framework. Do not use Python's built-in `unittest` module.
- **Test File Location:** All generated test files MUST be placed in the project's **`tests/`** subdirectory (or relative to the file being tested).
- **Test File Naming:** Test files MUST follow the convention: `test_<module_name>.py`.
- **Test Function Naming:** Test functions MUST follow the convention: `test_<function_being_tested>_<scenario>`.
- **Mocking:** Use the standard Python `unittest.mock` library for mocking external dependencies (e.g., database calls, external APIs).
- **Test Scope:** Tests should focus on unit testing: **happy path**, **edge cases**, and **error/exception handling**. Do not write extensive integration or end-to-end tests unless explicitly instructed.
- **Imports:** Ensure all necessary imports (e.g., the code being tested, `pytest` fixtures, or mock objects) are present at the top of the test file.
