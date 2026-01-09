import { Briefcase, FileText, Sparkles, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResumeUpload } from '@/components/ResumeUpload';
import { JobUrlInput } from '@/components/JobUrlInput';
import { FeatureScoresDisplay } from '@/components/FeatureScoresDisplay';
import { PredictionResultDisplay } from '@/components/PredictionResultDisplay';
import { TailoredOutput } from '@/components/TailoredOutput';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function Index() {
  // Central state management for the entire workflow
  const {
    state,
    uploadResume,
    analyzeJobUrl,
    runPrediction,
    tailorResume,
    generateCoverLetter,
    reset,
  } = useAnalysis();

  // Check if we can run analysis
  const canRunAnalysis = state.resume && state.jobPosting && !state.prediction;
  const hasAnalysis = state.prediction !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">Arbyte</span>
          </div>
          
          {/* Reset button */}
          {(state.resume || state.jobPosting) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8 px-4">
        {/* Hero Section - Only show when starting */}
        {!state.resume && !state.jobPosting && (
          <div className="mb-12 text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-primary">AI-Powered</span> Resume Tailoring
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your resume, paste a job URL, and let our ML model analyze the match.
              Get tailored suggestions based on SHAP explainability.
            </p>
            
            {/* Backend status notice */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-warning/50 bg-warning/10 px-4 py-2 text-sm text-warning">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                <span className="relative inline-flex rounded-2 h-2 w-2 rounded-full bg-warning"></span>
              </span>
              Requires Python backend running on localhost:5000
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Step 1: Resume Upload */}
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Your Resume
                    </CardTitle>
                    <CardDescription>
                      Upload a PDF resume for text extraction
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResumeUpload
                  onUpload={uploadResume}
                  isLoading={state.isLoading.resume}
                  resume={state.resume}
                  error={state.errors.resume}
                />
              </CardContent>
            </Card>

            {/* Step 2: Job URL Input */}
            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Enter Job Posting URL
                    </CardTitle>
                    <CardDescription>
                      Paste a LinkedIn, JobStreet, or other job posting URL
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <JobUrlInput
                  onSubmit={analyzeJobUrl}
                  isLoading={state.isLoading.jobPosting}
                  jobPosting={state.jobPosting}
                  error={state.errors.jobPosting}
                />
              </CardContent>
            </Card>

            {/* Analyze Button */}
            {canRunAnalysis && (
              <Button
                onClick={runPrediction}
                disabled={state.isLoading.prediction}
                size="lg"
                className="w-full h-14 text-lg gradient-primary text-primary-foreground animate-fade-in-up"
              >
                {state.isLoading.prediction ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Match & Get Recommendations
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Right Column - Results Section */}
          <div className="space-y-6">
            {/* Show placeholder when no analysis yet */}
            {!hasAnalysis && (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Upload your resume and enter a job URL to see the analysis results
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Feature Scores with SHAP */}
            {state.prediction && (
              <FeatureScoresDisplay
                scores={state.prediction.featureScores}
                shapValues={state.prediction.shapValues}
                feedback={state.prediction.feedback}
              />
            )}

            {/* Prediction Result */}
            {state.prediction && (
              <PredictionResultDisplay
                prediction={state.prediction}
                onTailor={tailorResume}
                isLoading={state.isLoading.tailoring}
              />
            )}

            {/* Tailored Output */}
            {state.tailoredResume && (
              <TailoredOutput
                tailoredResume={state.tailoredResume}
                coverLetter={state.coverLetter}
                onGenerateCoverLetter={generateCoverLetter}
                isLoadingCoverLetter={state.isLoading.coverLetter}
              />
            )}
          </div>
        </div>

        {/* Footer with backend info */}
        <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Built with React + TypeScript | Backend: Python + Flask + Ollama
          </p>
          <p>
            ML Pipeline: Feature Engineering → RandomForest → SHAP Explainability → LLM Tailoring
          </p>
        </footer>
      </main>
    </div>
  );
}
