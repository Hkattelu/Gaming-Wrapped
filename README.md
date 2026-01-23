# Gaming Wrapped

Gaming Wrapped is a personalized year-in-review for your gaming habits. Upload your game data (e.g., from services like PlayTracker or custom CSVs), and our AI will generate a unique, shareable slideshow summarizing your gaming year, highlighting key stats, top games, platform preferences, and more.

## Features

- **Personalized AI-Generated Summaries**: Get a unique narrative of your gaming year.
- **Key Stats & Visualizations**: See your total games played, top-rated games, platform distribution, genre breakdown, and score distribution.
- **Shareable Slideshows**: Easily share your Gaming Wrapped with friends via a unique URL.
- **Secure API Handling**: Your Gemini API key is securely handled on the backend.

## Development Quickstart

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm (comes with Node.js)
- A Gemini API Key
- Twitch Developer App (Client ID and Client Secret for IGDB)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gaming-wrapped.git
    cd gaming-wrapped
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project (see `.env.example`) and add the following:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    HOST_URL=http://localhost:3000
    TWITCH_CLIENT_ID=your_twitch_client_id
    TWITCH_CLIENT_SECRET=your_twitch_client_secret

    # Prevents GRPC related crashes in local development
    FIRESTORE_PREFER_REST=true
    ```

4.  **Run the development server:**
    ```bash
    npm run dev # Start up nextJS FE
    npm run dev:emulators # Start up the fake firebase backends
    ```

The application will be accessible at `http://localhost:3000`.


## Troubleshooting

### If ports are still in use:


```bash
# Windows - Kill process on a specific port
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# Linux
kill $(lsof -t -i:9002)
```



### Hydration Mismatch
If you see a hydration error related to the `<html>` tag (often caused by `next-themes`), ensure the `<html>` tag in `src/app/layout.tsx` has the `suppressHydrationWarning` attribute.

### If emulator still crashes:
1. **Force Host Binding**: In `firebase.json`, ensure emulators are explicitly bound to `127.0.0.1` to avoid Windows localhost resolution timeouts:
   ```json
   "emulators": {
     "firestore": { "port": 8080, "host": "127.0.0.1" },
     "ui": { "port": 4000, "host": "127.0.0.1" }
   }
   ```
2. **Selective Startup**: Use the updated emulator script which only starts critical services: `npm run dev:emulators` (runs `firebase emulators:start --only firestore,ui`).
3. Delete `firestore-debug.log`
4. Clear emulator cache: `firebase emulators:export ./emulator-data` then restart
5. Check Windows Firewall isn't blocking ports
6. Make sure no other services are using ports 4000, 5001, 8080, or 9002

### Viewing the Demo Wrapped

To view a pre-populated demo wrapped without uploading any data or generating a new wrapped:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/wrapped?demo=true`

This will render a hardcoded mock wrapped that you can use for UI development and testing.

### Using Mock Data During AI Generation

If you want to skip the AI generation step during development and use mock data instead, set the following environment variable:

```bash
USE_MOCK_WRAPPED_OUTPUT=true
```

This will cause the `generateGamingWrapped` function to return mock data instead of calling the AI flow, useful when iterating on the upload/processing pipeline without consuming API credits.

### Vibe Kanban

This project uses the VibeKanban WebCompanion, which allows you to render the local web UI
directly in the vibe kanban UI, which is very useful for vibe coding. You can read more
about it [here](https://www.vibekanban.com/docs/core-features/testing-your-application#next-js).

## Project Structure

- `src/app/`: Next.js pages and API routes.
- `src/ai/`: Genkit AI flows and configurations.
- `src/components/`: React components, including UI elements and custom cards.
- `src/lib/`: Utility functions (e.g., CSV parsing, database operations).
- `src/types/`: TypeScript type definitions.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
