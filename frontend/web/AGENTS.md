# Project Conventions for AI Agents

## File Structure

- frontend/web - This is the root directory for the frontend/web project
- public - This is the public directory for the frontend/web project
- src - This is the source directory for the frontend/web project
  - app - This is the app directory for the frontend/web project. It uses the Next.js 4
    app directory structure.
  - components - This is the components directory for the frontend/web project
    - auth - Authorization/Permissions related components
    - layout - Layout components
    - ui - Reusable UI components
      - form - inputs, buttons, dropdowns and relevant errors components to these
      - modals - common modal components
      - tables - stylized table components
      - wizard-steps - currently AI related steps
    - users - User related components (note: probably need to move these into the user app)
  - lib - This is the lib directory for the frontend/web project
    - auth
    - clients - Custom axios client
    - constants - error messages, urls, permissions, styles where we want to be consistent
    - hooks - custom hooks
    - services - API services connecting to the python backend; generally simple CRUD api layer
    - utils - miscellaneous functions that don't fall into any other category
  - schemas - Zod 4 schemas for data validation
  - stores - Zustand stores for state management
  - stories - Support functions for storybook
  - types - TypeScript types

## Styling & Tooling

This projet utilizes the following major libraries/frameworks/tools:

- typescript
- Next.js (v15.\*)
- Zod 4
- React Hook Form
- Zustand
- headlessui/react
- heroicons/react
- storybook
- axios
- jest
- tailwindcss
- eslint
- prettier

## Testing Conventions under the frontend/web/src/lib directory

- All tests MUST be written using the **`jest`** framework for .ts files
- Typescript files should be in the same directory as the file being tested
- The test file should be named like the file being tested with the suffix .test.ts (e.g. auth.ts should have a corresponding auth.test.ts)
- Directories that should have tests under lib are:
  - hooks
  - services
  - utils
- Use mock objects for external dependencies (e.g., axios calls, database calls, external APIs)
- Tests should be against logical branches and include exceptions that are thrown to ensure coverage.
- Tests should be updated when the code being tested is updated.

## Storybook Conventions

- Each component in the components directory should have a corresponding story in the stories directory
- The stories should be named like the component with the suffix .stories.tsx (e.g. auth.ts should have a corresponding auth.stories.tsx)
- The stories should be updated when the component is updated.
