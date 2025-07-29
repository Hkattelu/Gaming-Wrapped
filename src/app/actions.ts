'use server';

import { calculateStats, parseCsv } from "@/lib/csv";
import type { WrappedData } from "@/types";

export async function generateWrappedData(csvText: string): Promise<WrappedData> {
  try {
    const games = parseCsv(csvText);
    if (games.length === 0) {
      throw new Error("No valid game data found in the CSV. Please check the file format.");
    }

    const basicStats = calculateStats(games);

    const response = await fetch('http://localhost:9002/api/generate', {
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

    const { id, wrapped } = await response.json();

    return {
      basicStats,
      aiResponse: wrapped,
      id,
    };
  } catch (error) {
    console.error("Error generating wrapped data:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate your Rewind. ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating your Rewind.");
  }
}
