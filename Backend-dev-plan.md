# 1) Executive Summary
This document outlines the development plan for a FastAPI backend to support a React-based note-taking application. The backend will handle user authentication, note management, and data persistence using MongoDB Atlas.

The plan honors the following constraints:
- **Backend:** FastAPI (Python 3.12), async.
- **Database:** MongoDB Atlas with Motor and Pydantic v2.
- **Deployment:** No Docker.
- **Testing:** Manual testing through the frontend.
- **Version Control:** A single `main` branch on GitHub.
- **API:** Base path `/api/v1`.

The development is broken down into a dynamic number of sprints to cover all frontend features, starting with environment setup and progressing through authentication and feature implementation.

# 2) In-scope & Success Criteria
- **In-scope:**
  - User registration, login, and logout.
  - Create, read, update, and delete (CRUD) operations for notes.
  - A protected area for managing notes, accessible only to authenticated users.
- **Success criteria:**
  - All frontend features are fully supported by the backend.
  - Each sprint's functionality passes manual tests conducted via the user interface.
  - The backend is successfully connected to MongoDB Atlas.
  - Code is pushed to the `main` branch on GitHub after each successful sprint.

# 3) API Design
- **Conventions:**
  - **Base path:** `/api/v1`
  - **Authentication:** JWT-based, with tokens sent in the `Authorization` header.
  - **Error model:**
    ```json
    { "detail": "Error message text" }
    ```
- **Endpoints:**
  - **Health Check**
    - `GET /healthz`: Checks API and database connectivity.
      - **Response (200 OK):** `{ "status": "ok", "db_status": "connected" }`
  - **Authentication**
    - `POST /api/v1/auth/signup`: Registers a new user.
      - **Request:** `{ "email": "user@example.com", "password": "password123" }`
      - **Response (201 Created):** `{ "access_token": "jwt_token", "token_type": "bearer" }`
      - **Validation:** Email must be valid and unique. Password must be strong.
    - `POST /api/v1/auth/login`: Logs in an existing user.
      - **Request:** `{ "email": "user@example.com", "password": "password123" }`
      - **Response (200 OK):** `{ "access_token": "jwt_token", "token_type": "bearer" }`
    - `POST /api/v1/auth/logout`: (Client-side) Invalidate the JWT. This endpoint is not strictly necessary for a stateless JWT implementation but can be included for completeness if server-side token management is added later. For now, the frontend will just delete the token.
    - `GET /api/v1/auth/me`: Retrieves the current authenticated user's profile.
      - **Response (200 OK):** `{ "id": "user_id", "email": "user@example.com" }`
  - **Notes**
    - `GET /api/v1/notes`: Retrieves all notes for the authenticated user.
      - **Response (200 OK):** `[{ "id": "note_id", "title": "Note Title", "content": "Note content...", "lastModifiedDate": "iso_date_string" }]`
    - `POST /api/v1/notes`: Creates a new note.
      - **Request:** `{ "title": "New Note", "content": "This is a new note." }`
      - **Response (201 Created):** `{ "id": "note_id", "title": "New Note", "content": "This is a new note.", "lastModifiedDate": "iso_date_string" }`
    - `PUT /api/v1/notes/{note_id}`: Updates an existing note.
      - **Request:** `{ "title": "Updated Title", "content": "Updated content." }`
      - **Response (200 OK):** `{ "id": "note_id", "title": "Updated Title", "content": "Updated content.", "lastModifiedDate": "iso_date_string" }`
    - `DELETE /api/v1/notes/{note_id}`: Deletes a note.
      - **Response (204 No Content)**

# 4) Data Model (MongoDB Atlas)
- **Collections:**
  - **`users`**
    - `_id`: ObjectId (auto-generated)
    - `email`: String, required, unique
    - `password_hash`: String, required
    - `created_date`: DateTime, required, default: `now`
    - `last_modified_date`: DateTime, required, default: `now`
    - **Example Document:**
      ```json
      {
        "_id": "ObjectId('...')",
        "email": "test@example.com",
        "password_hash": "argon2_hashed_password",
        "created_date": "2025-10-18T10:00:00Z",
        "last_modified_date": "2025-10-18T10:00:00Z"
      }
      ```
  - **`notes`**
    - `_id`: ObjectId (auto-generated)
    - `user_id`: ObjectId, required, reference to `users._id`
    - `title`: String, optional
    - `content`: String, required
    - `created_date`: DateTime, required, default: `now`
    - `last_modified_date`: DateTime, required, default: `now`
    - **Example Document:**
      ```json
      {
        "_id": "ObjectId('...')",
        "user_id": "ObjectId('...')",
        "title": "My First Note",
        "content": "This is the content of my first note.",
        "created_date": "2025-10-18T10:05:00Z",
        "last_modified_date": "2025-10-18T10:05:00Z"
      }
      ```

# 5) Frontend Audit & Feature Map
- **`pages/RegisterPage.tsx`**
  - **Purpose:** New user registration.
  - **Backend:** `POST /api/v1/auth/signup`
- **`pages/LoginPage.tsx`**
  - **Purpose:** Existing user login.
  - **Backend:** `POST /api/v1/auth/login`
- **`pages/NotesPage.tsx`**
  - **Purpose:** Display, search, and delete user's notes.
  - **Backend:** `GET /api/v1/notes`, `DELETE /api/v1/notes/{note_id}`
  - **Auth:** Required.
- **`pages/NoteFormPage.tsx`**
  - **Purpose:** Create a new note or edit an existing one.
  - **Backend:** `POST /api/v1/notes`, `PUT /api/v1/notes/{note_id}`
  - **Auth:** Required.
- **`context/AuthContext.tsx`**
  - **Purpose:** Manages user authentication state.
  - **Backend:** Will interact with all `/api/v1/auth/*` endpoints and store the JWT.

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: `mongodb+srv://qasimkhan_db_user:FnZbmgw0S0RN6L54@cluster0.3ve35gz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET`: A long, random, secret string for signing tokens.
- `JWT_EXPIRES_IN`: `3600` (1 hour in seconds)
- `CORS_ORIGINS`: The frontend URL (e.g., `http://localhost:5173`).

# 9) Testing Strategy (Manual via Frontend)
- **Policy:** All backend features will be validated by interacting with the connected frontend application in a browser. Network requests in DevTools will be monitored to confirm API calls and responses.
- **Post-sprint:** If all manual tests for a sprint pass, the code will be committed and pushed to the `main` branch on GitHub.

# 10) Dynamic Sprint Plan & Backlog (S0…Sn)

- **S0 - Environment Setup & Frontend Connection**
  - **Objectives:**
    - Create a basic FastAPI application skeleton with a `/api/v1` router.
    - Implement a `/healthz` endpoint that checks database connectivity.
    - Configure environment variables for MongoDB connection and CORS.
    - Enable CORS to allow requests from the frontend.
    - Initialize a Git repository and push the initial setup to a new GitHub repository on the `main` branch.
  - **Definition of Done:**
    - The FastAPI server runs locally without errors.
    - The `/healthz` endpoint returns a `200 OK` response indicating a successful database connection.
    - The frontend can successfully make a request to the backend.
    - The initial code is available on GitHub.
  - **Manual Test Checklist (Frontend):**
    1. Start the backend server.
    2. Start the frontend development server.
    3. Open the browser's developer tools to the Network tab.
    4. Verify that the frontend application loads and attempts to connect to the backend, and that the `/healthz` endpoint is called successfully.
  - **User Test Prompt:**
    "Please run both the frontend and backend servers. Open the application in your browser and confirm there are no CORS errors in the console and that the initial data-loading request to the backend succeeds."
  - **Post-sprint:**
    - Commit changes and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives:**
    - Implement user registration, login, and profile retrieval endpoints.
    - Hash user passwords using Argon2 before storing them.
    - Issue JWTs upon successful login or registration.
    - Create a dependency to protect routes that require authentication.
  - **Endpoints:**
    - `POST /api/v1/auth/signup`
    - `POST /api/v1/auth/login`
    - `GET /api/v1/auth/me`
  - **Definition of Done:**
    - A new user can register through the frontend.
    - An existing user can log in and receive a JWT.
    - The frontend can retrieve the logged-in user's details.
    - Unauthorized users are blocked from accessing protected routes.
  - **Manual Test Checklist (Frontend):**
    1. Navigate to the Register page and create a new account.
    2. Verify you are automatically logged in and redirected to the notes page.
    3. Log out.
    4. Navigate to the Login page and log in with the new credentials.
    5. Verify you are redirected to the notes page.
    6. Try to access the notes page while logged out and verify you are redirected to the login page.
  - **User Test Prompt:**
    "Please test the full authentication flow: create an account, log out, log back in, and ensure you can access the protected notes page only when authenticated."
  - **Post-sprint:**
    - Commit the changes and push to `main`.

- **S2 - CRUD Operations for Notes**
  - **Objectives:**
    - Implement all CRUD endpoints for notes (`GET`, `POST`, `PUT`, `DELETE`).
    - Ensure that users can only access and modify their own notes.
    - Connect the notes endpoints to the `NotesContext` in the frontend.
  - **Endpoints:**
    - `GET /api/v1/notes`
    - `POST /api/v1/notes`
    - `PUT /api/v1/notes/{note_id}`
    - `DELETE /api/v1/notes/{note_id}`
  - **Definition of Done:**
    - Authenticated users can create, view, edit, and delete their notes through the frontend.
    - The notes displayed on the `NotesPage` are fetched from the backend.
    - All note-related actions in the UI are persistent.
  - **Manual Test Checklist (Frontend):**
    1. Log in to the application.
    2. Create a new note and verify it appears in the list.
    3. Edit the content of the note and save the changes. Verify the note is updated.
    4. Delete the note and verify it is removed from the list.
    5. Log out and log in as a different user (if possible) to ensure notes are not shared between users.
  - **User Test Prompt:**
    "Please log in and test all note management features. Ensure you can create a new note, see it in your list, edit its content, and finally delete it. All changes should persist after a page refresh."
  - **Post-sprint:**
    - Commit the changes and push to `main`.