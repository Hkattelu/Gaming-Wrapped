"use server";

import { generateGamingWrapped } from "@/ai/flows/generate-gaming-wrapped";
import { calculateStats, parseCsv } from "@/lib/csv";
import type { WrappedData } from "@/types";

export async function generateWrappedData(csvText: string): Promise<WrappedData> {
  try {
    const games = parseCsv(csvText);
    if (games.length === 0) {
      throw new Error("No valid game data found in the CSV. Please check the file format.");
    }

    const basicStats = calculateStats(games);

    const aiResponse = await generateGamingWrapped({ csvData: csvText });
    
    return {
      basicStats,
      aiResponse,
    };
  } catch (error) {
    console.error("Error generating wrapped data:", error);
    // Re-throw with a more user-friendly message
    if (error instanceof Error) {
        throw new Error(`Failed to generate your Rewind. ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating your Rewind.");
  }
}
