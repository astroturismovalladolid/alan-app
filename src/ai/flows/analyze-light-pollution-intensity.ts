'use server';

/**
 * @fileOverview Analyzes the light pollution intensity in an image.
 *
 * - analyzeLightPollutionIntensity - A function that handles the analysis process.
 * - AnalyzeLightPollutionIntensityInput - The input type for the analyzeLightPollutionIntensity function.
 * - AnalyzeLightPollutionIntensityOutput - The return type for the analyzeLightPollutionIntensity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {headers} from 'next/headers';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';

const AnalyzeLightPollutionIntensityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo depicting light pollution, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLightPollutionIntensityInput = z.infer<
  typeof AnalyzeLightPollutionIntensityInputSchema
>;

const AnalyzeLightPollutionIntensityOutputSchema = z.object({
  lightPollutionIntensity: z
    .string()
    .describe(
      'The analyzed intensity of light pollution in the image, on a scale from 1 (low) to 10 (high).'
    ),
  assessment: z
    .string()
    .describe(
      'A detailed assessment of the light pollution present in the image.'
    ),
});
export type AnalyzeLightPollutionIntensityOutput = z.infer<
  typeof AnalyzeLightPollutionIntensityOutputSchema
>;

export async function analyzeLightPollutionIntensity(
  input: AnalyzeLightPollutionIntensityInput
): Promise<AnalyzeLightPollutionIntensityOutput> {
  const ip = getClientIp(await headers());
  if (!checkRateLimit(`ai-analyze:${ip}`, 10)) {
    throw new Error('Too many requests. Please try again in a minute.');
  }
  return analyzeLightPollutionIntensityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLightPollutionIntensityPrompt',
  input: {schema: AnalyzeLightPollutionIntensityInputSchema},
  output: {schema: AnalyzeLightPollutionIntensityOutputSchema},
  prompt: `You are an expert in analyzing light pollution in images. You will receive an image and must analyze the light pollution intensity.

Analyze the following image and provide an intensity score from 1 (low) to 10 (high), along with a detailed assessment of the light pollution present.

Image: {{media url=photoDataUri}}

Respond with the light pollution intensity, and assessment of the light pollution. Be brief.
`,
});

const analyzeLightPollutionIntensityFlow = ai.defineFlow(
  {
    name: 'analyzeLightPollutionIntensityFlow',
    inputSchema: AnalyzeLightPollutionIntensityInputSchema,
    outputSchema: AnalyzeLightPollutionIntensityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
