'use server';

/**
 * @fileOverview Generates a personalized "Gaming Wrapped" narrative from user's gaming data.
 *
 * - generateGamingWrapped - A function that generates the gaming wrapped narrative.
 * - GenerateGamingWrappedInput - The input type for the generateGamingWrapped function.
 * - GenerateGamingWrappedOutput - The return type for the generateGamingWrapped function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGamingWrappedInputSchema = z.object({
  csvData: z
    .string()
    .describe('CSV data containing game title, platform played on, review score, review notes.'),
});
export type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

const GenerateGamingWrappedOutputSchema = z.object({
  narrative: z.string().describe("A narrative story of the user's gaming year, broken into 2-3 short paragraphs. Use markdown for emphasis."),
  keyStats: z.string().describe('Key stats and visuals to display in the slideshow. Use markdown formatting like bullet points or tables for clarity and visual appeal.'),
});
export type GenerateGamingWrappedOutput = z.infer<typeof GenerateGamingWrappedOutputSchema>;

export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<GenerateGamingWrappedOutput> {
  return generateGamingWrappedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGamingWrappedPrompt',
  input: {schema: GenerateGamingWrappedInputSchema},
  output: {schema: GenerateGamingWrappedOutputSchema},
  prompt: `You are a creative storyteller who specializes in generating personalized gaming year summaries.

  Analyze the following gaming data provided in CSV format and create a fun and engaging "Gaming Wrapped".

  CSV Data: {{{csvData}}}

  ## Instructions

  ### Narrative
  - Create a narrative story of the user's gaming year.
  - Break it down into 2-3 short, distinct paragraphs. Use double line breaks to separate them.
  - Use **bold** or *italic* markdown for emphasis on game titles or key phrases.

  ### Key Stats
  - Extract key stats and interesting facts suitable for a slideshow.
  - Present these stats using markdown. Use bullet points for lists and tables for comparisons.
  - Be creative! Find fun patterns in the data. For example: "You were a true completionist, finishing 80% of your games!" or "Your Sunday nights were dedicated to RPGs."
  `,
});

const generateGamingWrappedFlow = ai.defineFlow(
  {
    name: 'generateGamingWrappedFlow',
    inputSchema: GenerateGamingWrappedInputSchema,
    outputSchema: GenerateGamingWrappedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
