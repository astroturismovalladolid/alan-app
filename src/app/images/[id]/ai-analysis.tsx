'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { analyzeLightPollutionIntensity } from '@/ai/flows/analyze-light-pollution-intensity';
import type { AnalyzeLightPollutionIntensityOutput } from '@/ai/flows/analyze-light-pollution-intensity';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface AiAnalysisProps {
  imageUrl: string;
}

// Function to convert image URL to data URI
async function toDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function AiAnalysis({ imageUrl }: AiAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalyzeLightPollutionIntensityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsLoading(true);
    try {
      const dataUri = await toDataURL(imageUrl);
      const result = await analyzeLightPollutionIntensity({ photoDataUri: dataUri });
      setAnalysis(result);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: 'Could not analyze the image. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const intensityValue = analysis ? parseFloat(analysis.lightPollutionIntensity) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-primary" />
          AI Analysis
        </CardTitle>
        <CardDescription>
          Use AI to assess the light pollution intensity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing image... this may take a moment.</p>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <h4 className="font-semibold">Intensity Score</h4>
                <p className="font-bold text-lg text-primary">{analysis.lightPollutionIntensity} / 10</p>
              </div>
              <Progress value={intensityValue * 10} className="h-3" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Assessment</h4>
              <p className="text-sm text-muted-foreground bg-accent/20 p-3 rounded-md">{analysis.assessment}</p>
            </div>
             <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">Run Again</Button>
          </div>
        ) : (
          <Button onClick={handleAnalysis} className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Analyze Light Pollution
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
