# System Patterns

## Overall Architecture
Three-tier architecture: React.js single-page frontend, Python Flask REST API backend, and Firebase datastore (with local JSON fallback). Groq API is used for AI generations.

## Technology Stack
- **Frontend**: React.js, Axios, React Markdown, Chart.js
- **Backend**: Python, Flask
- **AI Provider**: Groq API (Llama 3.3 70B Versatile)
- **Primary Database**: Firebase Firestore
- **File Storage**: Firebase Storage
- **Fallback Storage**: Local JSON file storage
- **Authentication**: Firebase Authentication (email/password, token-based session)

## Frontend Stack
React.js with Axios for HTTP requests, React Markdown for rendering markdown summaries, and Chart.js for analytics visualization. Uses standard React folder structure (components, pages, services, context, hooks, utils).

## Backend Stack
Python Flask REST API server. Owns business logic, file processing, AI integration, and response handling. Routes are organized by feature (auth, material, summary, flashcard, quiz, schedule, analytics, appointment).

## Database
Firebase Firestore for structured data (users, materials, summaries, flashcard_decks, quizzes, quiz_results, schedules, appointments). Local JSON fallback when Firebase credentials are not provided.

## Authentication
Firebase Authentication (email/password). Issues ID tokens (JWT) stored in-memory on the frontend and passed as Bearer tokens to the backend. Fallback mode uses a local JSON-based user store with bcrypt and signed JWTs.

## Storage
Firebase Storage for storing uploaded study materials (PDF, DOCX, TXT). Local disk fallback when Firebase is not configured.

## AI Provider
Groq API - Llama 3.3 70B Versatile model. Used for summarization, flashcards, quiz generation and grading, weak-topic analysis, and schedule generation. Structured prompts and JSON schema-validated responses.

## Folder Structure
- `frontend/`: React frontend (src/ components, pages, services, context, hooks, utils).
- `backend/`: Flask backend (app.py, routes/, services/, models/, utils/, config.py, data/).
- `.context/`: Project memory and documentation context.

## Coding Standards
- Clean Architecture
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Modular Design
- Separation of Concerns
- Feature-Based Organization
- Strong Typing (where applicable)
- Self-Documenting Code
- Meaningful Naming
- No Dead Code
- No Duplicate Components
- Production Quality Code
- Readable Code

## Component Standards
Reusable components, well-defined props, separate styling, logic encapsulation. No ad-hoc utilities where global design systems apply.

## Folder Standards
Scalable folder structure. Frontend organized by pages, components, services, context, hooks, utils. Backend organized by routes, services, models, utils, data.

## Security Standards
- All traffic over HTTPS.
- Passwords never stored in plain text (Firebase Auth or bcrypt).
- API keys (Groq, Firebase) managed via environment variables and never exposed to the frontend.
- Uploaded material and generated content scoped strictly to owning user via backend authorization.

## Performance Standards
- Summary and flashcard generation within 8s.
- Quiz generation (10 questions) within 15s.
- Dashboard/analytics views load within 2s.
- Graceful degradation for AI failures.

## Accessibility Standards
- Keyboard navigability for core flows.
- Sufficient color contrast.
- Clear loading, empty, and error states.
- Screen-reader friendly semantic HTML (where possible).

## Responsive Design Standards
- 100% viewport width and height.
- Never use narrow centered layouts; use available width intelligently.
- Support: Small Phones, Large Phones, Tablets, Laptops, Desktop, Ultrawide, 2K, 4K.
- No horizontal scrolling.
- Responsive sidebar, navbar, cards, forms, tables, charts, dialogs, typography.
- Fluid grid layouts, flexible spacing, touch-friendly controls.

## API Standards
- Common base path (e.g., `/api/v1`).
- JSON requests and responses.
- Protected endpoints require `Authorization: Bearer <token>`.
- Standard error responses: `{ "error": { "code": string, "message": string } }`.
- Clear status codes.

## Error Handling Standards
- Graceful degradation on Groq API timeouts (manual retry options).
- Structured fallback for Firebase missing credentials.
- Input validation (files, emails, passwords) done at both frontend and backend.

## Logging Standards
- Server-side logging for API errors, Groq interactions, and authentication failures.

## Environment Variable Standards
- Frontend and backend have respective `.env.template` files.
- Secrets never committed to the repository.
- Support for Firebase and Groq API keys configurations.
