# StudyAI - Development Guidelines

## Project Structure
- `frontend/`: React.js application
- `backend/`: Python Flask REST API server
- `.context/`: Project memory and AI context files

## Coding Standards
- **Clean Architecture & SOLID**: Separate concerns. UI presentation, business logic, and data access must be isolated.
- **DRY & KISS**: Do not repeat yourself. Keep logic simple and readable.
- **Modular & Reusable Components**: Avoid duplicate UI code. Create reusable components.
- **Strong Typing**: Use PropTypes or JSDoc in React, and Type Hints in Python where possible.
- **Self-Documenting Code**: Choose meaningful variables and function names. Avoid unnecessary comments. No dead code.

## Folder Structure
- **Frontend**:
  - `src/components/`: Reusable UI components.
  - `src/pages/`: Main views (Login, Dashboard, Upload, etc.).
  - `src/services/`: API calls and Axios instances.
  - `src/context/`: React context (Auth, Session).
  - `src/hooks/`: Custom React hooks.
  - `src/utils/`: Formatters, validators.
- **Backend**:
  - `routes/`: API endpoint definitions.
  - `services/`: Business logic (AI, Firebase, etc.).
  - `models/`: Data schema validation and abstraction.
  - `utils/`: Validators, middleware.
  - `data/`: Local JSON fallback storage.

## UI/UX & Responsive Design Standards
- **Responsiveness**: The application must be fully responsive across Small Phones, Large Phones, Tablets, Laptops, Desktop, Ultrawide, 2K, 4K displays.
- **Layouts**: 100% viewport width and height. Fluid Grid layouts and flexible spacing. Avoid narrow centered layouts. No horizontal scrolling.
- **Components**: Responsive sidebar, navbar, cards, forms, tables, charts, dialogs. Touch-friendly controls and keyboard accessibility.
- **Design System**: Use consistent spacing, modern typography, semantic color system (with high contrast), clear elevation and border radii. Provide clear loading, error, empty, success, hover, and focus states.
- **Aesthetic**: Premium enterprise SaaS product appearance.

## Development Workflow
1. Refer to the `.context` folder (specifically `activeContext.md` and `systemPatterns.md`) before making architectural decisions.
2. Ensure you have the required environment configurations.
3. Write feature-based components in the frontend and corresponding routes/services in the backend.

## Branch Strategy
- `main`: Production-ready stable code.
- `dev`: Active development branch.
- **Feature Branches**: Branch off from `dev` using the format `feature/<feature-name>` (e.g., `feature/auth`, `feature/quiz-engine`).

## Commit Message Convention
Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding missing tests
- `chore:` for updating build tasks, package manager configs, etc.

## Environment Setup
1. Copy `.env.template` to `.env` in both `frontend` and `backend` directories.
2. Fill in the placeholder values with actual keys (Firebase, Groq).
3. The backend can run in a fallback mode without Firebase credentials by utilizing local JSON storage.

## Developer Onboarding
1. Read the PRD and files in the `.context` folder.
2. Familiarize yourself with the UI/UX design standards and architectural patterns outlined above.
3. Understand the Flask API structure and React component hierarchy.
4. Launch both frontend and backend development servers to begin implementation.
