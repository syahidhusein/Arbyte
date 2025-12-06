# Execution Plan for Arbyte

## 1. Project Validation & Feasibility

**Is the idea possible?**
Yes, absolutely. The workflow you described (Parsing -> Scraping -> Vectorization -> Matching -> Generation) is a standard pattern in modern "GenAI" or NLP applications.

**ML Advice:**
- **Text Length Discrepancy:** You are correct that raw length differences can affect simple vector comparisons. However:
    - **Cosine Similarity:** This measures the *angle* between vectors, not the magnitude. So if the "topic" of the resume aligns with the job description, the score will still be high even if one text is much longer.
    - **Embedding Models:** Modern Transformer-based embeddings (like `all-MiniLM-L6-v2` or OpenAI's embeddings) are very robust to this. They capture semantic meaning.
    - **Mitigation:**
        1. **Asymmetric Search:** Use models trained for asymmetric search (short query vs long document), or treat the job description as the "query".
        2. **Summarization:** Use an LLM to summarize the resume into a "Professional Profile" of similar length to the job description before vectorizing.
        3. **Chunking:** Break the resume into sections (Skills, Experience) and match them separately against the JD requirements.

- **Frontend Choice:**
    - **React.js:** The industry standard. Highly recommended for production, scalability, and custom UI.
    - **Streamlit/Dash:** Excellent for data science prototypes (like this PoC) but can be limiting for a full-featured SaaS product with user accounts, complex state, and custom styling.

## 2. Step-by-Step Execution Plan

### Phase 1: Proof of Concept (Current Task)
**Goal:** Demonstrate value with a mock-up.
1.  **Tech Stack:** Python, Streamlit.
2.  **Data:** Hardcoded sample data (extracted from your notebook).
3.  **Features:**
    - Simulate PDF upload (select from sample).
    - Simulate JD scraping (paste URL, get dummy text).
    - Display Mock "Suitability Score".
    - Display Mock "Tailored Resume" and "Cover Letter".

### Phase 2: Core Backend & ML Development
**Goal:** Build the real logic.
1.  **PDF Parsing:** Use `pypdf` or `pdfminer.six` to extract text from uploaded files.
2.  **Web Scraping:** Use `BeautifulSoup` or `Selenium`/`Playwright` to fetch job descriptions from LinkedIn/JobStreet URLs.
    - *Note:* These sites have anti-scraping. Consider using official APIs or scraping services if scaling.
3.  **Vectorization:**
    - Implement `sentence-transformers` (SBERT) to convert text to vectors.
    - Compute Cosine Similarity.
    - Compute Jaccard Similarity (Token overlap).
4.  **Prediction Model:**
    - Train a classifier (Logistic Regression or Random Forest) using the HuggingFace dataset features (Similarity Score, Keyword Overlap, etc.) to predict `Decision` (Select/Reject).
5.  **Generative AI (Tailoring & Cover Letter):**
    - Integrate an LLM API (OpenAI GPT-4, Anthropic Claude, or local Llama 3).
    - Prompt: "Rewrite this resume to highlight these keywords from the JD..."
    - Prompt: "Write a cover letter for this resume and this job..."

### Phase 3: Robust Frontend (React.js)
**Goal:** Production-grade UI.
1.  **Backend API:** Wrap the Python logic in FastAPI or Flask.
    - `POST /analyze` (input: resume, url) -> returns scores.
    - `POST /generate` (input: resume, job) -> returns tailored text.
2.  **Frontend:** Build React components.
    - File Uploader.
    - Dashboard for application tracking.
    - Rich text editor for the generated cover letter.

### Phase 4: Deployment
1.  **Containerization:** Dockerize the backend and frontend.
2.  **Hosting:** Deploy to AWS/GCP/Azure or simpler platforms like Vercel (Frontend) + Render/Railway (Backend).

## 3. Next Steps
Proceed with the **Phase 1 PoC** code provided below.
