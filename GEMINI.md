# GEMINI Project Context: mesilcha-next

## Project Overview

This is a Next.js web application called "매실차" (Maesil-cha). It functions as a habit-tracking application for a group of students and teachers. The project's tagline is "매일의 실천이 만드는 차이" (The difference made by daily practice).

Users can log in via their Google account, set a habit, and track their progress. Teachers can approve student posts, which increments the student's completion count.

**Key Technologies:**
*   **Framework:** Next.js
*   **Language:** TypeScript
*   **UI Library:** React, shadcn/ui
*   **Styling:** Tailwind CSS with `lucide-react` for icons.
*   **Backend & Database:** Firebase (Firestore for the database and Firebase Authentication for user management).

**Architecture:**
*   The application is a client-rendered Next.js app (`"use client"`).
*   Firebase serves as the backend. User data and progress are stored in a single `users` collection in Firestore.
*   Authentication is handled by Firebase Authentication with Google as the provider.
*   Core business logic is abstracted into functions within the `src/app/lib/` directory.

## Authentication Flow

1.  **Unauthenticated User:** Any user attempting to access the main page (`/`) without being logged in is automatically redirected to the `/login` page.
2.  **Login:** On the `/login` page, the user can sign in with their Google account.
3.  **Redirection:** Upon successful authentication, the user is always redirected to the main page (`/`).
4.  **Profile Check:** The main page checks if a user document exists in the `users` collection corresponding to the authenticated user's UID.
5.  **New User Onboarding:** If no user document is found, the user is redirected to the `/habit-input` page to set their initial habit.
6.  **Profile Creation:** After submitting their habit, a new document is created in the `users` collection, and the user is redirected back to the main page to begin using the app.

## Data Structure (Firestore)

The data is organized into two main collections:

### 1. `users`
Stores essential user data, including profile information and progress.

*   **Document ID:** `user.uid` (From Firebase Authentication)
*   **Fields:**
    *   `name`: (string) The user's Google display name.
    *   `email`: (string) The user's email.
    *   `role`: (string) User's role, defaults to `"student"`.
    *   `habit`: (string) The habit the student is tracking.
    *   `completedCount`: (number) The number of times the habit has been completed (incremented by teacher approval).
    *   `joinedAt`: (string) ISO 8601 timestamp of when the user joined.

### 2. `posts`
Stores student-submitted posts for habit completion.

*   **Document ID:** (auto-generated)
*   **Fields:**
    *   `authorId`: (string) The `uid` of the user who created the post.
    *   `title`: (string) Post title.
    *   `content`: (string) Post content.
    *   `createdAt`: (string) ISO 8601 timestamp.
    *   `approved`: (boolean) `true` if a teacher has approved the post.

#### 2.1. `posts/{postId}/comments` (Sub-collection)
Stores comments on a specific post.

*   **Document ID:** (auto-generated)
*   **Fields:**
    *   `authorId`: (string) The `uid` of the comment author.
    *   `content`: (string) The comment text.
    *   `createdAt`: (string) ISO 8601 timestamp.

## Building and Running

*   **Install dependencies:** `npm install`
*   **Run the development server:** `npm run dev`
*   **Create a production build:** `npm run build`
*   **Run the production server:** `npm run start`

## Future Development (To-Do List)

1.  **Refactor `users` Collection:** Further simplify the `users` collection by removing potentially unnecessary fields (`goalCount`, `lastCompletedDate`, `streakDays`). - **Completed (User confirmed)**
2.  **Implement Full Board Features:**
    *   Create a UI for submitting new posts. - **Completed**
    *   Implement commenting functionality on posts. - **Completed**
    *   Create a dedicated page to view all posts. - **Completed**
3.  **Statistics Page:** Create a leaderboard page to display statistics on goal completion counts for all members. - **Completed**
4.  **Project Intro Page:** Create a static page to introduce the project, potentially rendering content from a Markdown file. - **Completed**

## User Preferences

*   Please communicate in Korean.
*   Do not run `npm run dev`. The user will handle this.
*   Do not perform `git add` or `git commit` automatically. The user will manage git operations.