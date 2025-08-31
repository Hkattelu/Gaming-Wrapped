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
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:3000`.

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
