import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  Copy, 
  Check, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TailoredResume, CoverLetter } from '@/types/arbyte';

interface TailoredOutputProps {
  /** Tailored resume from LLM */
  tailoredResume: TailoredResume | null;
  /** Generated cover letter from LLM */
  coverLetter: CoverLetter | null;
  /** Callback to generate cover letter */
  onGenerateCoverLetter: () => void;
  /** Loading state for cover letter generation */
  isLoadingCoverLetter: boolean;
}

export function TailoredOutput({
  tailoredResume,
  coverLetter,
  onGenerateCoverLetter,
  isLoadingCoverLetter,
}: TailoredOutputProps) {
  const [copied, setCopied] = useState<'resume' | 'cover' | null>(null);
  const [showImprovements, setShowImprovements] = useState(false);

  /**
   * Copies content to clipboard
   */
  const copyToClipboard = async (content: string, type: 'resume' | 'cover') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Downloads content as a text file
   */
  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!tailoredResume) {
    return null;
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Tailored Output
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resume" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tailored Resume
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Cover Letter
            </TabsTrigger>
          </TabsList>

          {/* Tailored Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            {/* Improvements made */}
            {tailoredResume.improvements.length > 0 && (
              <div className="rounded-lg border bg-primary/5 p-4">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setShowImprovements(!showImprovements)}
                >
                  <span className="font-medium text-sm text-primary">
                    {tailoredResume.improvements.length} improvements made
                  </span>
                  {showImprovements ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  )}
                </button>
                {showImprovements && (
                  <ul className="mt-3 space-y-2">
                    {tailoredResume.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Resume content */}
            <div className="relative">
              <div className="max-h-96 overflow-y-auto rounded-lg border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                  {tailoredResume.content}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(tailoredResume.content, 'resume')}
              >
                {copied === 'resume' ? (
                  <Check className="mr-2 h-4 w-4 text-success" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied === 'resume' ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsText(tailoredResume.content, 'tailored_resume.txt')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download as Text
              </Button>
            </div>
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover" className="space-y-4">
            {coverLetter ? (
              <>
                {/* Key points addressed */}
                {coverLetter.keyPointsAddressed.length > 0 && (
                  <div className="rounded-lg border bg-accent/5 p-4">
                    <p className="font-medium text-sm text-accent mb-2">Key Points Addressed:</p>
                    <div className="flex flex-wrap gap-2">
                      {coverLetter.keyPointsAddressed.map((point, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover letter content */}
                <div className="relative">
                  <div className="max-h-96 overflow-y-auto rounded-lg border bg-muted/30 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                      {coverLetter.content}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(coverLetter.content, 'cover')}
                  >
                    {copied === 'cover' ? (
                      <Check className="mr-2 h-4 w-4 text-success" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied === 'cover' ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(coverLetter.content, 'cover_letter.txt')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as Text
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Generate a personalized cover letter based on your tailored resume
                </p>
                <Button
                  onClick={onGenerateCoverLetter}
                  disabled={isLoadingCoverLetter}
                  className="gradient-accent text-accent-foreground"
                >
                  {isLoadingCoverLetter ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
