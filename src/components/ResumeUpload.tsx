import { useState, useCallback } from 'react';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ResumeData } from '@/types/arbyte';

interface ResumeUploadProps {
  /** Callback when a file is uploaded */
  onUpload: (file: File) => void;
  /** Loading state during upload */
  isLoading: boolean;
  /** Current resume data if uploaded */
  resume: ResumeData | null;
  /** Error message if upload failed */
  error?: string | null;
}

export function ResumeUpload({ onUpload, isLoading, resume, error }: ResumeUploadProps) {
  // Track drag state for visual feedback
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles file drop event
   * Validates that the file is a PDF before uploading
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        // Validate file type
        if (file.type === 'application/pdf') {
          onUpload(file);
        } else {
          alert('Please upload a PDF file');
        }
      }
    },
    [onUpload]
  );

  /**
   * Handles file input change event
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          onUpload(file);
        } else {
          alert('Please upload a PDF file');
        }
      }
    },
    [onUpload]
  );

  // If resume is already uploaded, show success state
  if (resume && !isLoading) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{resume.fileName}</p>
              <p className="text-sm text-muted-foreground">
                Resume uploaded successfully
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`upload-zone relative cursor-pointer ${
          isDragging ? 'dragging' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('resume-input')?.click()}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 py-8">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          )}

          <div className="text-center">
            <p className="font-medium text-foreground">
              {isLoading ? 'Processing resume...' : 'Drop your resume here'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? 'Extracting text from PDF' : 'or click to browse (PDF only)'}
            </p>
          </div>

          {!isLoading && (
            <Button variant="outline" size="sm" className="mt-2">
              <FileText className="mr-2 h-4 w-4" />
              Select PDF
            </Button>
          )}
        </div>
      </div>

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
