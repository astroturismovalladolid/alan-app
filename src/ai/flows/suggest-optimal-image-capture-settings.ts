'use server';

/**
 * @fileOverview An AI agent that suggests optimal camera settings for capturing light pollution images.
 *
 * - suggestOptimalImageCaptureSettings - A function that suggests optimal camera settings.
 * - SuggestOptimalImageCaptureSettingsInput - The input type for the suggestOptimalImageCaptureSettings function.
 * - SuggestOptimalImageCaptureSettingsOutput - The return type for the suggestOptimalImageCaptureSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {headers} from 'next/headers';
import {checkRateLimit, getClientIp} from '@/lib/rate-limit';

const SuggestOptimalImageCaptureSettingsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a light pollution scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  cameraMake: z.string().optional().describe('The make of the camera used to capture the image.'),
  cameraModel: z.string().optional().describe('The model of the camera used to capture the image.'),
  iso: z.number().optional().describe('The ISO setting used for the image capture.'),
  aperture: z.string().optional().describe('The aperture setting used for the image capture (e.g., f/2.8).'),
  shutterSpeed: z.string().optional().describe('The shutter speed used for the image capture (e.g., 1/200).'),
  locationDescription: z.string().optional().describe('Description of the location where the image was taken')
});

export type SuggestOptimalImageCaptureSettingsInput = z.infer<
  typeof SuggestOptimalImageCaptureSettingsInputSchema
>;

const SuggestOptimalImageCaptureSettingsOutputSchema = z.object({
  suggestedSettings: z.object({
    iso: z.string().describe('The suggested ISO setting for future captures.'),
    aperture: z.string().describe('The suggested aperture setting for future captures.'),
    shutterSpeed: z.string().describe('The suggested shutter speed for future captures.'),
    additionalTips: z.string().describe('Any additional tips for improving image capture for light pollution analysis.'),
  }).describe('Suggested optimal camera settings for future captures.'),
});

export type SuggestOptimalImageCaptureSettingsOutput = z.infer<
  typeof SuggestOptimalImageCaptureSettingsOutputSchema
>;

export async function suggestOptimalImageCaptureSettings(
  input: SuggestOptimalImageCaptureSettingsInput
): Promise<SuggestOptimalImageCaptureSettingsOutput> {
  const ip = getClientIp(await headers());
  if (!checkRateLimit(`ai-suggest:${ip}`, 10)) {
    throw new Error('Too many requests. Please try again in a minute.');
  }
  return suggestOptimalImageCaptureSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalImageCaptureSettingsPrompt',
  input: {schema: SuggestOptimalImageCaptureSettingsInputSchema},
  output: {schema: SuggestOptimalImageCaptureSettingsOutputSchema},
  prompt: `You are an expert photographer specializing in capturing images for light pollution analysis. Analyze the provided image and suggest optimal camera settings for future captures to improve the quality and suitability of the images for light pollution assessment.

  Consider the following information about the current image:
  {% if cameraMake %}Camera Make: {{{cameraMake}}}{% endif %}
  {% if cameraModel %}Camera Model: {{{cameraModel}}}{% endif %}
  {% if iso %}ISO: {{{iso}}}{% endif %}
  {% if aperture %}Aperture: {{{aperture}}}{% endif %}
  {% if shutterSpeed %}Shutter Speed: {{{shutterSpeed}}}{% endif %}
  {% if locationDescription %}Location Description: {{{locationDescription}}}{% endif %}

  Image: {{media url=photoDataUri}}

  Based on the image and provided settings, suggest the following:
  - Optimal ISO setting: A string representing the ideal ISO for future shots.
  - Optimal Aperture setting: A string representing the ideal aperture (e.g., f/2.8) for future shots.
  - Optimal Shutter Speed setting: A string representing the ideal shutter speed (e.g., 1/200) for future shots.
  - Additional Tips: Any other tips or recommendations to improve image capture for light pollution analysis. Consider things like avoiding lens flare, or overexposure from artificial lighting.

  Ensure your suggestions are practical and aimed at capturing the best possible images for light pollution analysis.
  Format your response as a JSON object matching the schema SuggestOptimalImageCaptureSettingsOutputSchema.
`,
});

const suggestOptimalImageCaptureSettingsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalImageCaptureSettingsFlow',
    inputSchema: SuggestOptimalImageCaptureSettingsInputSchema,
    outputSchema: SuggestOptimalImageCaptureSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
