'use server';

import { parseCsv } from "@/lib/csv";
import type { ManualGame, StoryIdentifier } from "@/types";

export async function generateWrappedData(csvText: string): Promise<StoryIdentifier> {
  try {
    const games = parseCsv(csvText);
    if (games.length === 0) {
      throw new Error("No valid game data found in the CSV. Please check the file format.");
    }

    console.log('first game', games[0]);
    // NextJS does not support relative URLs
    const response = await fetch(`${process.env.HOST_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ games }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate wrapped content');
    }

    // While the data story data is actually here, we just route to the
    const { id } = await response.json();

    return { id };
  } catch (error) {
    console.error("Error generating wrapped data:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate your Rewind. ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating your Rewind.");
  }
}

// Helper to convert ManualGame[] to CSV string
function manualGamesToCsv(games: ManualGame[]): string {
  const header = "Title,Platform,Review Score,Review Notes\n";
  const rows = games.map(game => {
    // Simple CSV encoding: handle commas by quoting
    const title = `"${game.title.replace(/"/g, '""')}"`;
    const platform = `"${game.platform.replace(/"/g, '""')}"`;
    const score = game.score;
    // Construct notes from status, as we don't have a dedicated field for it here
    const notes = `"${game.status}"`;
    return `${title},${platform},${score},${notes}`;
  });
  return header + rows.join('\n');
}

export async function generateWrappedDataFromManual(games: ManualGame[]): Promise<StoryIdentifier> {
  try {
    if (games.length === 0) {
      throw new Error("No games provided. Please add some games to your list.");
    }
    
    const csvText = manualGamesToCsv(games);
    const { id } = await generateWrappedData(csvText);
    
    return { id };
  } catch (error) {
    console.error("Error generating wrapped data from manual input:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate your Rewind. ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating your Rewind.");
  }
}