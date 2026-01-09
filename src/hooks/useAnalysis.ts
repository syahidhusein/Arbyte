import { useState, useCallback } from 'react';
import type {
  AnalysisState,
  ResumeData,
  JobPostingData,
  PredictionResult,
  TailoredResume,
  CoverLetter,
  DEFAULT_BACKEND_CONFIG,
} from '@/types/arbyte';

// Initial state for the analysis workflow
const initialState: AnalysisState = {
  step: 'upload',
  resume: null,
  jobPosting: null,
  prediction: null,
  tailoredResume: null,
  coverLetter: null,
  isLoading: {
    resume: false,
    jobPosting: false,
    prediction: false,
    tailoring: false,
    coverLetter: false,
  },
  errors: {
    resume: null,
    jobPosting: null,
    prediction: null,
    tailoring: null,
    coverLetter: null,
  },
};

/**
 * Configuration for the Python backend
 * IMPORTANT: Update this URL when running your backend
 */
const BACKEND_URL = 'http://localhost:5000';

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);

  /**
   * Updates a specific loading state
   */
  const setLoading = useCallback((key: keyof AnalysisState['isLoading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, [key]: value },
    }));
  }, []);

  /**
   * Updates a specific error state
   */
  const setError = useCallback((key: keyof AnalysisState['errors'], value: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: value },
    }));
  }, []);

  /**
   * Uploads and parses a resume PDF
   * 
   * @param file - The PDF file to upload
   * 
   * Flow:
   * 1. Send PDF to /api/parse-resume
   * 2. Backend extracts text using PyPDF2 or similar
   * 3. Returns cleaned text ready for embedding
   */
  const uploadResume = useCallback(async (file: File) => {
    setLoading('resume', true);
    setError('resume', null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume. Is the backend running?');
      }

      const data = await response.json();
      
      const resumeData: ResumeData = {
        rawText: data.rawText,
        fileName: file.name,
        cleanedText: data.cleanedText,
      };

      setState(prev => ({
        ...prev,
        resume: resumeData,
        step: prev.jobPosting ? 'analyze' : 'upload',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload resume';
      setError('resume', message);
      
      // For demo: Create mock data when backend is not available
      console.warn('Backend not available, using mock data:', message);
      const mockData: ResumeData = {
        rawText: `Demo Resume Content from ${file.name}`,
        fileName: file.name,
        cleanedText: 'Cleaned demo resume text',
      };
      setState(prev => ({
        ...prev,
        resume: mockData,
        step: prev.jobPosting ? 'analyze' : 'upload',
      }));
    } finally {
      setLoading('resume', false);
    }
  }, [setLoading, setError]);

  /**
   * Scrapes job posting from a URL
   * 
   * @param url - The job posting URL (LinkedIn, JobStreet, etc.)
   * 
   * Flow:
   * 1. Send URL to /api/scrape-job
   * 2. Backend scrapes the page using requests/BeautifulSoup
   * 3. LLM summarizes to match training JD length
   * 4. Returns role, description, and augmented description
   */
  const analyzeJobUrl = useCallback(async (url: string) => {
    setLoading('jobPosting', true);
    setError('jobPosting', null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/scrape-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape job posting. Is the backend running?');
      }

      const data = await response.json();
      
      const jobData: JobPostingData = {
        role: data.role,
        description: data.description,
        augmentedDescription: data.augmentedDescription,
        sourceUrl: url,
        company: data.company,
      };

      setState(prev => ({
        ...prev,
        jobPosting: jobData,
        step: prev.resume ? 'analyze' : 'upload',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze job posting';
      setError('jobPosting', message);
      
      // For demo: Create mock data
      console.warn('Backend not available, using mock data:', message);
      const mockData: JobPostingData = {
        role: 'Software Engineer',
        description: 'We are looking for a skilled software engineer...',
        augmentedDescription: 'Key Responsibilities: Design and develop...',
        sourceUrl: url,
        company: 'Demo Company',
      };
      setState(prev => ({
        ...prev,
        jobPosting: mockData,
        step: prev.resume ? 'analyze' : 'upload',
      }));
    } finally {
      setLoading('jobPosting', false);
    }
  }, [setLoading, setError]);

  /**
   * Runs ML prediction with SHAP explainability
   * 
   * Uses your trained RandomForest model and SHAP TreeExplainer
   * 
   * @see training.ipynb for model and SHAP implementation
   */
  const runPrediction = useCallback(async () => {
    if (!state.resume || !state.jobPosting) {
      setError('prediction', 'Please upload a resume and enter a job URL first');
      return;
    }

    setLoading('prediction', true);
    setError('prediction', null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: state.resume.cleanedText || state.resume.rawText,
          jobDescription: state.jobPosting.augmentedDescription || state.jobPosting.description,
          role: state.jobPosting.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed. Is the backend running?');
      }

      const data: PredictionResult = await response.json();

      setState(prev => ({
        ...prev,
        prediction: data,
        step: 'results',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction failed';
      setError('prediction', message);
      
      // For demo: Create mock prediction
      console.warn('Backend not available, using mock prediction:', message);
      const mockPrediction: PredictionResult = {
        prediction: 'reject',
        selectProbability: 0.35,
        featureScores: {
          resumeJdSimilarity: 0.42,
          roleResumeSimilarity: 0.55,
          wordOverlap: 0.28,
          techKeywordOverlap: 0.15,
        },
        shapValues: {
          resumeJdSimilarity: -0.05,
          roleResumeSimilarity: 0.06,
          wordOverlap: -0.03,
          techKeywordOverlap: -0.08,
        },
        feedback: [
          {
            feature: 'techKeywordOverlap',
            impact: 'negative',
            value: -0.08,
            message: 'The resume contains too few tech-related keywords from the job description',
          },
          {
            feature: 'resumeJdSimilarity',
            impact: 'negative',
            value: -0.05,
            message: 'There is low similarity between the resume and the job description',
          },
          {
            feature: 'roleResumeSimilarity',
            impact: 'positive',
            value: 0.06,
            message: 'There is good similarity between the job title and the resume',
          },
        ],
      };
      setState(prev => ({
        ...prev,
        prediction: mockPrediction,
        step: 'results',
      }));
    } finally {
      setLoading('prediction', false);
    }
  }, [state.resume, state.jobPosting, setLoading, setError]);

  /**
   * Generates a tailored resume using Ollama LLM
   * Based on SHAP feedback, rewrites weak areas
   */
  const tailorResume = useCallback(async () => {
    if (!state.resume || !state.prediction) {
      setError('tailoring', 'Please run analysis first');
      return;
    }

    setLoading('tailoring', true);
    setError('tailoring', null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: state.resume.cleanedText || state.resume.rawText,
          jobDescription: state.jobPosting?.augmentedDescription || state.jobPosting?.description,
          feedback: state.prediction.feedback,
          shapValues: state.prediction.shapValues,
        }),
      });

      if (!response.ok) {
        throw new Error('Resume tailoring failed. Is Ollama running?');
      }

      const data: TailoredResume = await response.json();

      setState(prev => ({
        ...prev,
        tailoredResume: data,
        step: 'tailor',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tailoring failed';
      setError('tailoring', message);
      
      // For demo: Create mock tailored resume
      console.warn('Backend not available, using mock tailored resume:', message);
      const mockTailored: TailoredResume = {
        content: `[TAILORED RESUME]\n\nThis is a demo tailored resume. When connected to your Python backend with Ollama, this will contain your actual resume rewritten to better match the job requirements.\n\nImprovements made:\n- Added more technical keywords\n- Aligned experience with job requirements\n- Emphasized relevant skills`,
        improvements: [
          'Added technical keywords from job description',
          'Restructured experience section to highlight relevant work',
          'Added quantified achievements',
          'Improved alignment with role requirements',
        ],
      };
      setState(prev => ({
        ...prev,
        tailoredResume: mockTailored,
        step: 'tailor',
      }));
    } finally {
      setLoading('tailoring', false);
    }
  }, [state.resume, state.jobPosting, state.prediction, setLoading, setError]);

  /**
   * Generates a cover letter using Ollama LLM
   */
  const generateCoverLetter = useCallback(async () => {
    if (!state.tailoredResume || !state.jobPosting) {
      setError('coverLetter', 'Please tailor resume first');
      return;
    }

    setLoading('coverLetter', true);
    setError('coverLetter', null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: state.tailoredResume.content,
          jobDescription: state.jobPosting.augmentedDescription || state.jobPosting.description,
          role: state.jobPosting.role,
          company: state.jobPosting.company,
        }),
      });

      if (!response.ok) {
        throw new Error('Cover letter generation failed. Is Ollama running?');
      }

      const data: CoverLetter = await response.json();

      setState(prev => ({
        ...prev,
        coverLetter: data,
        step: 'download',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cover letter generation failed';
      setError('coverLetter', message);
      
      // For demo: Create mock cover letter
      console.warn('Backend not available, using mock cover letter:', message);
      const mockCoverLetter: CoverLetter = {
        content: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${state.jobPosting.role} position at ${state.jobPosting.company || 'your company'}.\n\n[This is a demo cover letter. When connected to your Python backend with Ollama, this will contain a personalized cover letter based on your tailored resume and the job requirements.]\n\nThank you for considering my application.\n\nSincerely,\n[Your Name]`,
        keyPointsAddressed: [
          'Technical skills alignment',
          'Relevant experience',
          'Career goals match',
          'Company culture fit',
        ],
      };
      setState(prev => ({
        ...prev,
        coverLetter: mockCoverLetter,
        step: 'download',
      }));
    } finally {
      setLoading('coverLetter', false);
    }
  }, [state.tailoredResume, state.jobPosting, setLoading, setError]);

  /**
   * Resets the entire analysis state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Sets the current step manually
   */
  const setStep = useCallback((step: AnalysisState['step']) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  return {
    state,
    uploadResume,
    analyzeJobUrl,
    runPrediction,
    tailorResume,
    generateCoverLetter,
    reset,
    setStep,
  };
}
