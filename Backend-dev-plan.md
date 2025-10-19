# 1) Executive Summary
- This document outlines the development plan for a FastAPI backend to support the "wild-beaver-yawn" note-taking application. The backend will provide user authentication and CRUD functionality for notes, replacing the current frontend's reliance on `localStorage`.
- Constraints honored: The backend will be built with **FastAPI (Python 3.12)** and use **MongoDB Atlas** via the **Motor** driver with **Pydantic v2** models. The development process will not use Docker, will follow a `main`-only Git workflow, and will rely on manual testing through the existing frontend.
- The sprint count is dynamic, designed to cover all features currently stubbed out in the frontend.

# 2) In-scope & Success Criteria
- **In-scope:**
  - User registration, login, and logout.
  - CRUD operations (Create, Read, Update, Delete) for notes.
  - A mechanism for users to only access their own notes.
- **Success criteria:**
  - All frontend features (authentication and note management) are fully powered by the backend.
  - Each sprint's features pass manual tests conducted through the frontend UI.
  - The codebase is successfully pushed to the `main` branch on GitHub after each sprint's validation.

# 3) API Design
- **Conventions:**
  - Base path: `/api/v1`
  - Errors will return a simple JSON object: `{"detail": "Error message"}`.
- **Endpoints:**
  - **Authentication**
    - `POST /api/v1/auth/signup`
      - **Purpose:** Register a new user.
      - **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
      - **Response Body:** `{ "access_token": "...", "token_type": "bearer" }`
      - **Validation:** Email must be valid and unique. Password must be at least 8 characters.
    - `POST /api/v1/auth/login`
      - **Purpose:** Log in an existing user.
      - **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
      - **Response Body:** `{ "access_token": "...", "token_type": "bearer" }`
    - `GET /api/v1/auth/me`
      - **Purpose:** Get the current authenticated user's information.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Response Body:** `{ "id": "...", "email": "user@example.com" }`
  - **Notes**
    - `GET /api/v1/notes`
      - **Purpose:** Get all notes for the authenticated user.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Response Body:** `[{"id": "...", "title": "Note Title", "content": "...", "created_at": "...", "updated_at": "..."}]`
    - `POST /api/v1/notes`
      - **Purpose:** Create a new note.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Request Body:** `{ "title": "New Note", "content": "Note content" }`
      - **Response Body:** `{ "id": "...", "title": "New Note", "content": "...", "created_at": "...", "updated_at": "..." }`
    - `GET /api/v1/notes/{note_id}`
      - **Purpose:** Get a single note by its ID.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Response Body:** `{ "id": "...", "title": "Note Title", "content": "...", "created_at": "...", "updated_at": "..." }`
    - `PUT /api/v1/notes/{note_id}`
      - **Purpose:** Update an existing note.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Request Body:** `{ "title": "Updated Title", "content": "Updated content" }`
      - **Response Body:** `{ "id": "...", "title": "Updated Title", "content": "...", "created_at": "...", "updated_at": "..." }`
    - `DELETE /api/v1/notes/{note_id}`
      - **Purpose:** Delete a note.
      - **Request Header:** `Authorization: Bearer <token>`
      - **Response Body:** `{"detail": "Note deleted successfully"}` (or status 204 No Content)

# 4) Data Model (MongoDB Atlas)
- **Collections:**
  - **users**
    - `_id`: ObjectId (auto-generated)
    - `email`: String (required, unique)
    - `hashed_password`: String (required)
    - `created_at`: DateTime (default: now)
    - **Example Document:**
      ```json
      {
        "_id": "635f8f3b9b5d9b3e3f3e3f3e",
        "email": "test@example.com",
        "hashed_password": "...",
        "created_at": "2025-10-18T10:00:00.000Z"
      }
      ```
  - **notes**
    - `_id`: ObjectId (auto-generated)
    - `owner_id`: ObjectId (required, reference to users collection)
    - `title`: String (optional)
    - `content`: String (required)
    - `created_at`: DateTime (default: now)
    - `updated_at`: DateTime (default: now)
    - **Example Document:**
      ```json
      {
        "_id": "635f9f3b9b5d9b3e3f3e3f3f",
        "owner_id": "635f8f3b9b5d9b3e3f3e3f3e",
        "title": "My First Note",
        "content": "This is the content of my first note.",
        "created_at": "2025-10-18T11:00:00.000Z",
        "updated_at": "2025-10-18T11:00:00.000Z"
      }
      ```

# 5) Frontend Audit & Feature Map
- **`AuthContext.tsx`**
  - **Purpose:** Manages user authentication state (login, register, logout).
  - **Backend Capability:**
    - `login()` -> `POST /api/v1/auth/login`
    - `register()` -> `POST /api/v1/auth/signup`
    - `logout()` -> No backend call needed, just frontend state and token removal.
    - A new function will be needed to fetch the current user on app load, using `GET /api/v1/auth/me`.
- **`NotesContext.tsx`**
  - **Purpose:** Manages CRUD operations for notes.
  - **Backend Capability:**
    - `notes` (list) -> `GET /api/v1/notes`
    - `createNote()` -> `POST /api/v1/notes`
    - `getNoteById()` -> `GET /api/v1/notes/{note_id}`
    - `updateNote()` -> `PUT /api/v1/notes/{note_id}`
    - `deleteNote()` -> `DELETE /api/v1/notes/{note_id}`
- **`ProtectedRoute.tsx`**
  - **Purpose:** Restricts access to pages unless the user is authenticated.
  - **Backend Capability:** Relies on the `user` object from `AuthContext`, which will be populated by the backend.

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: (User-provided Atlas connection string)
- `JWT_SECRET`: (A long, random, secret string)
- `JWT_EXPIRES_IN`: `3600` (1 hour in seconds)
- `CORS_ORIGINS`: (The frontend URL, e.g., `http://localhost:5173`)

# 9) Testing Strategy (Manual via Frontend)
- **Policy:** All backend features will be validated by using the frontend application in a web browser. We will navigate through the UI, submit forms, and observe the results. Browser DevTools (Network tab) can be used to inspect API requests and responses.
- **Post-sprint:** If all manual tests for a sprint pass, the code will be committed and pushed to the `main` branch on GitHub.

# 10) Dynamic Sprint Plan & Backlog (S0…Sn)

- **S0 - Environment Setup & Frontend Connection**
  - **Objectives:**
    - Create a basic FastAPI application skeleton with a `/api/v1` router.
    - Implement a `/healthz` endpoint that checks connectivity to MongoDB Atlas.
    - Set up environment variables for `MONGODB_URI` and `CORS_ORIGINS`.
    - Enable CORS middleware to allow requests from the frontend.
    - Initialize a Git repository, create a `.gitignore` file, and push the initial setup to a new GitHub repository on the `main` branch.
  - **Definition of Done:**
    - The FastAPI server runs locally without errors.
    - The `/api/v1/healthz` endpoint returns a success status and confirms DB connection.
    - The frontend can successfully make a request to the backend's `/healthz` endpoint without CORS errors.
    - The initial project structure is on GitHub.
  - **Manual Test Checklist (Frontend):**
    1.  Start the backend server.
    2.  Start the frontend development server.
    3.  Open the frontend in the browser.
    4.  Use the browser's DevTools to make a `fetch` call to `http://localhost:8000/api/v1/healthz`.
    5.  Confirm a `200 OK` response is received without any CORS errors.
  - **User Test Prompt:**
    - "Please run both the frontend and backend servers. Open your browser's developer console on the frontend page and run this command: `fetch('http://localhost:8000/api/v1/healthz').then(res => console.log(res.status))`. You should see `200` logged in the console."
  - **Post-sprint:**
    - Commit all changes and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives:**
    - Implement the `users` data model and database logic.
    - Create the `POST /api/v1/auth/signup` and `POST /api/v1/auth/login` endpoints.
    - Implement password hashing (e.g., with `passlib`).
    - Implement JWT generation on successful login/signup.
    - Create a `GET /api/v1/auth/me` endpoint to verify a token and return user data.
    - Create a dependency to protect routes that require authentication.
  - **Definition of Done:**
    - A new user can register through the frontend's registration page.
    - An existing user can log in through the frontend's login page.
    - The frontend stores the received JWT in `localStorage`.
    - The user is redirected to the notes page upon successful login.
  - **Manual Test Checklist (Frontend):**
    1.  Navigate to the Register page.
    2.  Create a new user account. Verify a JWT is stored in `localStorage`.
    3.  Log out.
    4.  Navigate to the Login page.
    5.  Log in with the newly created user.
    6.  Verify you are redirected and the user information is displayed.
    7.  Try to log in with incorrect credentials and verify an error message is shown.
  - **User Test Prompt:**
    - "Please test the full authentication flow. Can you successfully create a new account, log out, and then log back in? Also, check if you are prevented from logging in with a wrong password."
  - **Post-sprint:**
    - Commit the changes and push to `main`.

- **S2 - Notes CRUD Functionality**
  - **Objectives:**
    - Implement the `notes` data model and database logic.
    - Create all CRUD endpoints for notes: `GET /notes`, `POST /notes`, `GET /notes/{id}`, `PUT /notes/{id}`, `DELETE /notes/{id}`.
    - Protect all note endpoints, ensuring a user can only access and modify their own notes.
    - Update the frontend `NotesContext.tsx` to use these new API endpoints instead of `localStorage`.
  - **Definition of Done:**
    - A logged-in user can create a new note via the frontend.
    - The user's notes are listed on the notes page, fetched from the backend.
    - The user can view, edit, and delete their own notes.
    - A user cannot access another user's notes.
  - **Manual Test Checklist (Frontend):**
    1.  Log in to the application.
    2.  Create a new note and verify it appears in the list.
    3.  Click on the note to view its full content.
    4.  Edit the note's title and content and save the changes. Verify the list is updated.
    5.  Delete the note and verify it is removed from the list.
    6.  (Optional) Log in as a different user and verify you cannot see the notes of the first user.
  - **User Test Prompt:**
    - "After logging in, please test all the note features. Can you create a note, see it in your list, edit it, and then delete it? Ensure everything works as expected."
  - **Post-sprint:**
    - Commit the changes and push to `main`.