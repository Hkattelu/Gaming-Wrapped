'use server';

import { parseCsv } from "@/lib/csv";
import type { StoryIdentifier } from "@/types";

export async function generateWrappedData(csvText: string): Promise<StoryIdentifier> {
  try {
    const games = parseCsv(csvText);
    if (games.length === 0) {
      throw new Error("No valid game data found in the CSV. Please check the file format.");
    }

    const apiUrl = process.env.HOST_URL
      ? `https://${process.env.HOST_URL}/api/generate`
      : `http://localhost:${process.env.NEXT_PUBLIC_API_PORT || 3000}/api/generate`;

    const response = await fetch(apiUrl, {
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
