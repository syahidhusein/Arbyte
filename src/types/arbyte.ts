/**
 * Represents resume data extracted from uploaded PDF
 * The backend processes the PDF and extracts text
 */
export interface ResumeData {
  /** Raw text extracted from the PDF */
  rawText: string;
  /** Original filename of the uploaded resume */
  fileName: string;
  /** Cleaned/processed text ready for embedding */
  cleanedText?: string;
}

/**
 * Represents scraped job posting data
 * The backend scrapes the URL and extracts relevant information
 */
export interface JobPostingData {
  /** The job title/role (e.g., "Software Engineer") */
  role: string;
  /** Full job description text */
  description: string;
  /** Augmented/processed job description for better matching */
  augmentedDescription?: string;
  /** Original URL of the job posting */
  sourceUrl: string;
  /** Company name if available */
  company?: string;
}

/**
 * Feature scores computed from resume and job description
 * These match the features from your preprocessing.ipynb
 */
export interface FeatureScores {
  /** Cosine similarity between resume embedding and JD embedding */
  resumeJdSimilarity: number;
  /** Cosine similarity between role embedding and resume embedding */
  roleResumeSimilarity: number;
  /** Word overlap ratio between resume and JD */
  wordOverlap: number;
  /** Technical keyword overlap ratio */
  techKeywordOverlap: number;
}

/**
 * SHAP (SHapley Additive exPlanations) values for each feature
 * Positive values push toward "select", negative toward "reject"
 */
export interface ShapValues {
  resumeJdSimilarity: number;
  roleResumeSimilarity: number;
  wordOverlap: number;
  techKeywordOverlap: number;
}

/**
 * Feedback message based on SHAP values
 * Used to guide the LLM on which aspects to improve
 */
export interface FeatureFeedback {
  /** The feature name */
  feature: keyof ShapValues;
  /** Whether this feature helped or hurt the prediction */
  impact: 'positive' | 'negative';
  /** SHAP value for this feature */
  value: number;
  /** Human-readable feedback message */
  message: string;
}

/**
 * ML Model prediction result
 * Contains the prediction and explainability data
 */
export interface PredictionResult {
  /** The predicted outcome: 'select' or 'reject' */
  prediction: 'select' | 'reject';
  /** Probability of being selected (0-1) */
  selectProbability: number;
  /** Computed feature scores (raw values) */
  featureScores: FeatureScores;
  /** SHAP values explaining the prediction */
  shapValues: ShapValues;
  /** Human-readable feedback for each feature */
  feedback: FeatureFeedback[];
}

/**
 * Tailored resume suggestion from the LLM
 * Based on SHAP feedback, the LLM rewrites resume sections
 */
export interface TailoredResume {
  /** The full tailored resume text */
  content: string;
  /** List of changes/improvements made */
  improvements: string[];
  /** Predicted new feature scores after tailoring */
  predictedScores?: FeatureScores;
}

/**
 * Generated cover letter
 */
export interface CoverLetter {
  /** The full cover letter content */
  content: string;
  /** Key points addressed from the job description */
  keyPointsAddressed: string[];
}

/**
 * Overall analysis state for the application
 * Tracks the entire workflow from upload to download
 */
export interface AnalysisState {
  /** Current step in the workflow */
  step: 'upload' | 'analyze' | 'results' | 'tailor' | 'download';
  /** Uploaded resume data */
  resume: ResumeData | null;
  /** Scraped job posting data */
  jobPosting: JobPostingData | null;
  /** ML prediction and SHAP analysis */
  prediction: PredictionResult | null;
  /** LLM-tailored resume */
  tailoredResume: TailoredResume | null;
  /** Generated cover letter */
  coverLetter: CoverLetter | null;
  /** Loading states for async operations */
  isLoading: {
    resume: boolean;
    jobPosting: boolean;
    prediction: boolean;
    tailoring: boolean;
    coverLetter: boolean;
  };
  /** Error messages */
  errors: {
    resume: string | null;
    jobPosting: string | null;
    prediction: string | null;
    tailoring: string | null;
    coverLetter: string | null;
  };
}

/**
 * API Response wrapper for backend communication
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Backend configuration for API endpoints
 * You'll need to run the Python backend locally
 */
export interface BackendConfig {
  /** Base URL of your Python backend (e.g., http://localhost:5000) */
  baseUrl: string;
  /** Endpoints for each API operation */
  endpoints: {
    parseResume: string;
    scrapeJob: string;
    predict: string;
    tailorResume: string;
    generateCoverLetter: string;
  };
}

/**
 * Default backend configuration
 * REMEMBER TO CHANGE FOR PRODUCTION!
 */
export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  baseUrl: 'http://localhost:5000',
  endpoints: {
    parseResume: '/api/parse-resume',
    scrapeJob: '/api/scrape-job',
    predict: '/api/predict',
    tailorResume: '/api/tailor-resume',
    generateCoverLetter: '/api/generate-cover-letter',
  },
};
