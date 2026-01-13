import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { FeatureScores, ShapValues, FeatureFeedback } from '@/types/arbyte';

interface FeatureScoresDisplayProps {
  /** Raw feature scores (0-1 range) */
  scores: FeatureScores;
  /** SHAP values explaining feature impact */
  shapValues: ShapValues;
  /** Human-readable feedback */
  feedback: FeatureFeedback[];
}

/**
 * Feature configuration for display
 * Maps internal names to user-friendly labels
 */
const FEATURE_CONFIG = {
  resumeJdSimilarity: {
    label: 'Resume-JD Similarity',
    description: 'How well your resume matches the job description overall',
    key: 'Resume_JD_Sim' as const,
  },
  roleResumeSimilarity: {
    label: 'Role-Resume Match',
    description: 'How aligned your resume is with the job title/role',
    key: 'Role_Resume_Sim' as const,
  },
  wordOverlap: {
    label: 'Vocabulary Overlap',
    description: 'Common words between your resume and job description',
    key: 'Word_Overlap' as const,
  },
  techKeywordOverlap: {
    label: 'Technical Keywords',
    description: 'Technical skills and keywords from the JD in your resume',
    key: 'Tech_Keyword_Overlap' as const,
  },
};

export function FeatureScoresDisplay({
  scores,
  shapValues,
  feedback,
}: FeatureScoresDisplayProps) {
  /**
   * Determines the impact indicator based on SHAP value
   */
  const getImpactIndicator = (shapValue: number) => {
    if (shapValue > 0.01) {
      return {
        icon: TrendingUp,
        color: 'text-success',
        label: 'Helps',
      };
    } else if (shapValue < -0.01) {
      return {
        icon: TrendingDown,
        color: 'text-destructive',
        label: 'Hurts',
      };
    }
    return {
      icon: Minus,
      color: 'text-muted-foreground',
      label: 'Neutral',
    };
  };

  /**
   * Gets color for progress bar based on score
   */
  const getScoreColor = (score: number) => {
    if (score >= 0.6) return 'bg-success';
    if (score <= 0.4) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Feature Analysis
          <span className="text-xs font-normal text-muted-foreground">
            (SHAP Explainability)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(FEATURE_CONFIG).map(([key, config]) => {
          const score = scores[config.key];
          const shapValue = shapValues[config.key];
          const impact = getImpactIndicator(shapValue);
          const Icon = impact.icon;
          
          // Find feedback for this feature
          const featureFeedback = feedback.find(f => f.feature === config.key);

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    <div className={`flex items-center gap-1 text-xs ${impact.color}`}>
                      <Icon className="h-3 w-3" />
                      <span>{impact.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-semibold">
                    {(score * 100).toFixed(0)}%
                  </span>
                  <p className={`text-xs ${shapValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                    SHAP: {shapValue >= 0 ? '+' : ''}{shapValue.toFixed(3)}
                  </p>
                </div>
              </div>
              
              {/* Progress bar with dynamic color */}
              <div className="relative">
                <Progress 
                  value={score * 100} 
                  className="h-2"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getScoreColor(score)}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>

              {/* Feature-specific feedback */}
              {featureFeedback && (
                <p className={`text-xs px-2 py-1 rounded ${
                  featureFeedback.impact === 'positive' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {featureFeedback.message}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
