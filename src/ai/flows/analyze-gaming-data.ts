'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing gaming data and generating insights.
 *
 * It exports:
 * - `analyzeGamingData`: The main function to analyze gaming data.
 * - `AnalyzeGamingDataInput`: The input type for the analyzeGamingData function.
 * - `AnalyzeGamingDataOutput`: The output type for the analyzeGamingData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGamingDataInputSchema = z.object({
  gamingDataCsv: z
    .string()
    .describe('A CSV string containing the user gaming data.'),
});
export type AnalyzeGamingDataInput = z.infer<typeof AnalyzeGamingDataInputSchema>;

const AnalyzeGamingDataOutputSchema = z.object({
  insights: z
    .string()
    .describe(
      'A narrative summary of the users gaming habits and patterns, highlighting interesting stats and visuals.'
    ),
});
export type AnalyzeGamingDataOutput = z.infer<typeof AnalyzeGamingDataOutputSchema>;

export async function analyzeGamingData(
  input: AnalyzeGamingDataInput
): Promise<AnalyzeGamingDataOutput> {
  return analyzeGamingDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeGamingDataPrompt',
  input: {schema: AnalyzeGamingDataInputSchema},
  output: {schema: AnalyzeGamingDataOutputSchema},
  prompt: `You are a gaming data analyst. You are given a CSV file containing a user\'s gaming data. The CSV data contains game titles, the platform played on, the review score, and review notes. Your goal is to analyze the data and generate interesting patterns and insights about the user\'s gaming habits that can be highlighted in a "Gaming Wrapped".

CSV Data: {{{gamingDataCsv}}}

Provide insights in the form of a short narrative summary, highlighting key stats and visuals. Be playful in your tone, as the games themselves should be fun. Feel free to be creative.
`,
});

const analyzeGamingDataFlow = ai.defineFlow(
  {
    name: 'analyzeGamingDataFlow',
    inputSchema: AnalyzeGamingDataInputSchema,
    outputSchema: AnalyzeGamingDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
