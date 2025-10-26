// src/ai/flows/generate-light-pollution-report.ts
'use server';

/**
 * @fileOverview Generates a light pollution report based on uploaded images.
 *
 * - generateLightPollutionReport - A function that generates a summary report of light pollution levels.
 * - GenerateLightPollutionReportInput - The input type for the generateLightPollutionReport function.
 * - GenerateLightPollutionReportOutput - The return type for the generateLightPollutionReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLightPollutionReportInputSchema = z.object({
  imageUrls: z.array(z.string().describe('URL of the uploaded images.')).describe('Array of image URLs to analyze for light pollution.'),
  location: z.string().describe('The general location for the light pollution report.'),
});

export type GenerateLightPollutionReportInput = z.infer<typeof GenerateLightPollutionReportInputSchema>;

const GenerateLightPollutionReportOutputSchema = z.object({
  report: z.string().describe('A summary report of the light pollution levels in the specified area.'),
});

export type GenerateLightPollutionReportOutput = z.infer<typeof GenerateLightPollutionReportOutputSchema>;

export async function generateLightPollutionReport(input: GenerateLightPollutionReportInput): Promise<GenerateLightPollutionReportOutput> {
  return generateLightPollutionReportFlow(input);
}

const generateLightPollutionReportPrompt = ai.definePrompt({
  name: 'generateLightPollutionReportPrompt',
  input: {
    schema: GenerateLightPollutionReportInputSchema,
  },
  output: {
    schema: GenerateLightPollutionReportOutputSchema,
  },
  prompt: `You are an expert in analyzing light pollution. Based on the provided image URLs and location, generate a concise report summarizing the light pollution levels.

Location: {{{location}}}
Image URLs: {{#each imageUrls}}{{{this}}} {{/each}}

Report Format: Briefly describe the overall light pollution level, identify the main sources of light pollution, and suggest potential mitigation strategies.
`,
});

const generateLightPollutionReportFlow = ai.defineFlow(
  {
    name: 'generateLightPollutionReportFlow',
    inputSchema: GenerateLightPollutionReportInputSchema,
    outputSchema: GenerateLightPollutionReportOutputSchema,
  },
  async input => {
    const {output} = await generateLightPollutionReportPrompt(input);
    return output!;
  }
);
