import { useState } from 'react';
import { LinkIcon, Loader2, Building2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { JobPostingData } from '@/types/arbyte';

interface JobUrlInputProps {
  /** Callback when URL is submitted */
  onSubmit: (url: string) => void;
  /** Loading state during scraping */
  isLoading: boolean;
  /** Current job posting data if scraped */
  jobPosting: JobPostingData | null;
  /** Error message if scraping failed */
  error?: string | null;
}

export function JobUrlInput({ onSubmit, isLoading, jobPosting, error }: JobUrlInputProps) {
  const [url, setUrl] = useState('');

  /**
   * Validates and submits the URL
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  // If job posting is already scraped, show success state
  if (jobPosting && !isLoading) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/20">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{jobPosting.role}</p>
              {jobPosting.company && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {jobPosting.company}
                </p>
              )}
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {jobPosting.sourceUrl}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Show a preview of the job description */}
          <div className="mt-4 rounded-lg bg-background/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Job Description Preview:</p>
            <p className="text-sm text-foreground line-clamp-3">
              {jobPosting.augmentedDescription || jobPosting.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste job posting URL (LinkedIn)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="pl-10 pr-4 h-12"
          />
        </div>
        
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="w-full gradient-primary text-primary-foreground h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping job posting...
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Analyze Job Posting
            </>
          )}
        </Button>
      </form>

      {/* Supported sites hint */}
      <p className="text-center text-xs text-muted-foreground">
        Currently supports LinkedIn.com only. More sites coming soon!
      </p>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Make sure the Python backend is running on localhost:5000
          </p>
        </div>
      )}
    </div>
  );
}