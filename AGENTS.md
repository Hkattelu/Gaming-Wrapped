# Gaming Wrapped Agent Guide

This document provides instructions and learnings for working with the Gaming Wrapped codebase.

## Setup Instructions

1.  **Environment Variables**:
    *   Copy `.env.example` to `.env`.
    *   Populate the `.env` file with the required API keys.
        *   `GEMINI_API_KEY`: Required for AI generation.
        *   `HOST_URL`: The URL where the app is running (e.g., `http://localhost:9002`).
        *   `TWITCH_CLIENT_ID` & `TWITCH_CLIENT_SECRET`: Required for fetching game data from IGDB.
        *   `STEAM_API_KEY`: Required for fetching Steam data.
    *   For local development/exploration, dummy values can be used to start the server, but features relying on these APIs will fail or behave unexpectedly.

2.  **Installation**:
    *   Run `npm install` to install dependencies.

3.  **Running the Application**:
    *   Run `npm run dev` to start the development server.
    *   The server runs on port **9002** by default (configured in `package.json` scripts).
    *   Access the app at `http://localhost:9002`.

4.  **Running Tests**:
    *   Run `npm test` to run the test suite.
    *   *Note*: Some tests (`RecommendationsCardComponent`) were observed to fail with "Element type is invalid" errors. This might be due to issues with component imports in the test environment.

## Learnings & Context

*   **Framework**: Next.js App Router with TypeScript.
*   **Styling**: Tailwind CSS with Shadcn UI components.
*   **Theme**: Handled by `next-themes`. Light mode colors in `:root`, dark mode in `.dark` class in `globals.css`.
*   **AI**: Uses Genkit with Gemini (`@genkit-ai/googleai`).
*   **Database**: Firebase ( Firestore is likely used given `firebase` dependency and `dev:emulators` script).
*   **Long-running Processes**: When starting the dev server in a non-interactive shell, remember to run it in the background (e.g., `npm run dev > dev_server.log 2>&1 &`) to avoid blocking.
*   **Port**: The dev server is explicitly configured to use port 9002 (`-p 9002`).

## Troubleshooting

*   If the app fails to start, check the `.env` file exists.
*   "Element type is invalid" in tests usually points to a default vs named export mismatch or circular dependency.
