import { CheckCircle2, XCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PredictionResult } from '@/types/arbyte';

interface PredictionResultDisplayProps {
  /** The prediction result from the ML model */
  prediction: PredictionResult;
  /** Callback to trigger resume tailoring */
  onTailor: () => void;
  /** Loading state for tailoring */
  isLoading: boolean;
}

export function PredictionResultDisplay({
  prediction,
  onTailor,
  isLoading,
}: PredictionResultDisplayProps) {
  const isSelected = prediction.prediction === 'select';
  const probability = prediction.selectProbability * 100;

  return (
    <Card 
      className={`animate-scale-in ${
        isSelected 
          ? 'border-success/50 bg-gradient-to-br from-success/5 to-success/10' 
          : 'border-warning/50 bg-gradient-to-br from-warning/5 to-warning/10'
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Prediction Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main prediction display */}
        <div className="flex items-center gap-4">
          <div 
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isSelected ? 'bg-success/20' : 'bg-warning/20'
            }`}
          >
            {isSelected ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <AlertCircle className="h-8 w-8 text-warning" />
            )}
          </div>
          <div>
            <p className={`text-2xl font-bold ${isSelected ? 'text-success' : 'text-warning'}`}>
              {isSelected ? 'Likely to be Selected' : 'May Need Improvements'}
            </p>
            <p className="text-sm text-muted-foreground">
              Selection probability: <span className="font-mono font-semibold">{probability.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Probability meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Reject</span>
            <span>Select</span>
          </div>
          <div className="relative h-4 rounded-full bg-gradient-to-r from-destructive/30 via-warning/30 to-success/30">
            <div
              className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-lg transition-all"
              style={{ left: `calc(${probability}% - 12px)` }}
            />
          </div>
        </div>

        {/* Action area */}
        <div className="rounded-lg bg-background/50 p-4">
          {isSelected ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Your resume is well-aligned with this job! You can still optimize it further.
              </p>
              <Button
                onClick={onTailor}
                disabled={isLoading}
                className="gradient-accent text-accent-foreground"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Further with AI
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Our AI can tailor your resume to better match this job posting based on the analysis above.
              </p>
              <Button
                onClick={onTailor}
                disabled={isLoading}
                className="gradient-primary text-primary-foreground"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Tailor My Resume with AI
              </Button>
            </div>
          )}
        </div>

        {/* SHAP explanation note */}
        <p className="text-xs text-center text-muted-foreground">
          Powered by SHAP (SHapley Additive exPlanations) for transparent, explainable AI predictions
        </p>
      </CardContent>
    </Card>
  );
}
