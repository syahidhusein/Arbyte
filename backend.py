from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
import requests
from typing import Dict, List, Tuple, Optional
import numpy as np
import shap
from sklearn.preprocessing import StandardScaler
from sentence_transformers import SentenceTransformer
import pickle as pkl
import joblib
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup
import traceback
import pandas as pd

try:
    with open("data/tech_keywords.pkl", 'rb') as file:
        tech_keywords = pkl.load(file)
except FileNotFoundError:
    # Fallback to default tech keywords if file not found
    tech_keywords = {
        'python', 'java', 'javascript', 'typescript', 'react', 'vue', 'angular',
        'node', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp', 'docker',
        'kubernetes', 'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'linux',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
        'numpy', 'scikit-learn', 'data science', 'ai', 'ml', 'nlp', 'computer vision',
        'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
        'ci/cd', 'testing', 'automation', 'security', 'cloud', 'data engineering'
    }

# ====================
# CONFIGURATION
# ====================

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Ollama configuration - UPDATE THIS TO YOUR PREFERRED MODEL
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"  # Change to your preferred model

# Embedding model placeholder - UPDATE WITH YOUR CHOICE
# Options: sentence-transformers, nomic-embed-text via Ollama, etc.
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"  # Will be initialized on first use

# ML Model placeholder - Load your trained model here
ML_MODEL = "src/models/RandomForestClassifier.pkl"
SCALER = "src/models/StandardScaler.pkl"


# ====================
# HELPER FUNCTIONS
# ====================

def clean_text(text: str) -> str:
    """
    Cleans the input text by:
    1. Removing markdown symbols (**)
    2. Removing excessive whitespace
    3. Normalizing newlines
    """
    # Remove markdown bold/italic markers
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'\*', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text


def get_embedding(text: str) -> List[float]:
    """
    Generates embeddings for the given text.
    """
    # Mock embedding for testing purposes
    # import hashlib
    # hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
    # np.random.seed(hash_val % (2**32))
    # return np.random.randn(384).tolist()  # 384 dims like MiniLM
    model = SentenceTransformer(EMBEDDING_MODEL)
    return model.encode(text).tolist()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Computes cosine similarity between two vectors.
    
    This is used for:
    - Resume vs Job Description embedding similarities
    - Role vs Resume embedding similarities
    """
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))


def compute_word_overlap(text1: str, text2: str) -> float:
    """
    Computes Jaccard similarity (Word Overlap) of word sets.
    """
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
    
    intersection = words1 & words2
    union = words1 | words2
    
    return len(intersection) / len(union)


def compute_tech_keyword_overlap(resume: str, jd: str) -> float:
    """
    Computes overlap of technical keywords.
    """
    resume_lower = resume.lower()
    jd_lower = jd.lower()
    
    # Find tech keywords in JD
    jd_tech = {kw for kw in tech_keywords if kw in jd_lower}
    
    if not jd_tech:
        return 0.0
    
    # Find overlap with resume
    resume_tech = {kw for kw in jd_tech if kw in resume_lower}
    
    return len(resume_tech) / len(jd_tech)


def compute_features(resume_text: str, jd_text: str, role: str) -> Dict[str, float]:
    """
    Computes all four features used by the ML model:
    1. Resume_JD_Sim: Cosine similarity of resume and JD embeddings
    2. Role_Resume_Sim: Cosine similarity of role and resume embeddings
    3. Word_Overlap: Jaccard similarity of word sets
    4. Tech_Keyword_Overlap: Technical keyword overlap ratio
    """
    # Get embeddings
    resume_emb = get_embedding(resume_text)
    jd_emb = get_embedding(jd_text)
    role_emb = get_embedding(role)
    
    # Compute features
    resume_jd_sim = cosine_similarity(resume_emb, jd_emb)
    role_resume_sim = cosine_similarity(role_emb, resume_emb)
    word_overlap = compute_word_overlap(resume_text, jd_text)
    tech_overlap = compute_tech_keyword_overlap(resume_text, jd_text)
    
    return {
        'Resume_JD_Sim': resume_jd_sim,
        'Role_Resume_Sim': role_resume_sim,
        'Word_Overlap': word_overlap,
        'Tech_Keyword_Overlap': tech_overlap,
    }


def predict_with_shap(features: Dict[str, float]) -> Tuple[str, float, Dict[str, float]]:
    """
    Runs prediction and computes SHAP values.
    """
    model = joblib.load(ML_MODEL)
    scaler = joblib.load(SCALER)
    # feature_array = np.array([[
    #     features['Resume_JD_Sim'],
    #     features['Role_Resume_Sim'],
    #     features['Word_Overlap'],
    #     features['Tech_Keyword_Overlap']
    # ]])
    feature_df = pd.DataFrame([{
        'Resume_JD_Sim': features['Resume_JD_Sim'],
        'Role_Resume_Sim': features['Role_Resume_Sim'],
        'Word_Overlap': features['Word_Overlap'],
        'Tech_Keyword_Overlap': features['Tech_Keyword_Overlap']
    }])
    
    scaled_features = scaler.transform(feature_df)
    scaled_features_df = pd.DataFrame(scaled_features, columns=feature_df.columns)
    prediction = int(model.predict(scaled_features_df)[0])
    probability = float(model.predict_proba(scaled_features_df)[0][1])
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(scaled_features_df)[:,:,1][0]
    
    # Mock values for testing purposes
    # avg_score = (
    #     features['Resume_JD_Sim'] + 
    #     features['Role_Resume_Sim'] + 
    #     features['Word_Overlap'] + 
    #     features['Tech_Keyword_Overlap']
    # ) / 4
    
    # probability = min(1.0, max(0.0, avg_score + np.random.uniform(-0.1, 0.1)))
    # prediction = 'select' if probability > 0.5 else 'reject'
    
    # Mock SHAP values (replace with actual SHAP computation)
    # shap_values = {
    #     'Resume_JD_Sim': features['Resume_JD_Sim'] - 0.5,
    #     'Role_Resume_Sim': features['Role_Resume_Sim'] - 0.5,
    #     'Word_Overlap': features['Word_Overlap'] - 0.3,
    #     'Tech_Keyword_Overlap': features['Tech_Keyword_Overlap'] - 0.2,
    # }
    
    # Normalize SHAP values by absolute sum
    abs_sum = np.sum(np.abs(shap_values))
    shap_values = shap_values / abs_sum if abs_sum != 0 else shap_values
    shap_dict = { 'Resume_JD_Sim': float(shap_values[0]),
                    'Role_Resume_Sim': float(shap_values[1]),
                    'Word_Overlap': float(shap_values[2]),
                    'Tech_Keyword_Overlap': float(shap_values[3]) }

    return prediction, probability, shap_dict


def generate_feedback(shap_values: Dict[str, float]) -> List[Dict]:
    """
    Converts SHAP values to human-readable feedback.
    
    This implements the llm_feedback function from training.ipynb.
    
    @param shap_values: SHAP values for each feature
    @return: List of feedback dicts
    """
    negative_feedbacks = {
        'Resume_JD_Sim': 'There is low similarity between the resume and the job description',
        'Role_Resume_Sim': 'There is low similarity between the job title (role) and the resume',
        'Word_Overlap': 'The vocabulary of the resume is too dissimilar to the job description',
        'Tech_Keyword_Overlap': 'The resume contains too few tech-related keywords from the job description',
    }
    
    positive_feedbacks = {
        'Resume_JD_Sim': 'There is high similarity between the resume and the job description',
        'Role_Resume_Sim': 'There is good similarity between the job title (role) and the resume',
        'Word_Overlap': 'The vocabulary of the resume aligns well with the job description',
        'Tech_Keyword_Overlap': 'The resume contains adequate tech-related keywords from the job description',
    }
    
    feedback = []
    
    # Sort by absolute SHAP value (most impactful first)
    sorted_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
    
    for feature, value in sorted_features:
        impact = 'positive' if value > 0 else 'negative'
        message = positive_feedbacks[feature] if value > 0 else negative_feedbacks[feature]
        
        feedback.append({
            'feature': feature,
            'impact': impact,
            'value': value,
            'message': message,
        })
    
    return feedback


def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """
    Calls the local Ollama API for LLM inference.
    Make sure Ollama is running: ollama serve
    And the model is pulled: ollama pull llama3.2
    """
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False,
            },
            timeout=120,  # LLM can take a while
        )
        
        if response.status_code == 200:
            return response.json().get('response', '')
        else:
            return f"Error: Ollama returned status {response.status_code}"
            
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to Ollama. Make sure it's running (ollama serve)."
    except Exception as e:
        return f"Error: {str(e)}"


# ====================
# API ENDPOINTS
# ====================

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    """
    Endpoint: Parse uploaded PDF resume
    Accepts a PDF file and extracts text content.
    Request: multipart/form-data with 'file' field
    Response: { rawText: string, cleanedText: string }
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Please upload a PDF file'}), 400
    
    try:
        # Try PyPDF2 first
        try:
            reader = PdfReader(file)
            text_parts = []
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            
            raw_text = '\n'.join(text_parts)
            
        except ImportError:
            # Fallback: return placeholder
            raw_text = f"[PDF text extraction requires PyPDF2. Install with: pip install pypdf2]\n\nFilename: {file.filename}"
        
        cleaned_text = clean_text(raw_text)
        
        return jsonify({
            'rawText': raw_text,
            'cleanedText': cleaned_text,
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/scrape-job', methods=['POST'])
def scrape_job():
    """
    Endpoint: Scrape job posting from URL
    Scrapes the job URL and uses LLM to summarize/augment the JD
    to match training data format (as noted in preprocessing.ipynb).
    Request: { url: string }
    Response: { role: string, description: string, augmentedDescription: string, company: string }
    """
    data = request.get_json()
    url = data.get('url', '')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    try:
        # Try to scrape the URL
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to extract title and description (generic extraction)
            title_tag = soup.find('h1', class_='top-card-layout__title')
            role = title_tag.get_text(strip=True) if title_tag else 'Role not found'
            
            # Try to get main content
            main_content = soup.find('div', class_='show-more-less-html__markup')
            description = main_content.get_text(separator='\n', strip=True) if main_content else 'Job description not found'
            
            # Try to find company name
            company_tag = soup.find('a', {'data-tracking-control-name': 'public_jobs_topcard-org-name'})
            company = company_tag.get_text(strip=True) if company_tag else "Company not found"
                
        except ImportError:
            role = "Role Unidentified"
            description = "Job description scraping requires BeautifulSoup. Install with: pip install beautifulsoup4"
            company = "Company Unidentified"
            
        except Exception as scrape_error:
            # Fallback to placeholder
            role = "Role Unidentified"
            description = f"Could not scrape URL: {str(scrape_error)}"
            company = "Company Unidentified"

        # Augment/summarize the JD using LLM (as per preprocessing.ipynb solution)
        augment_prompt = f"""
        Given this job posting, extract and restructure the key responsibilities and requirements in the format below.
        Output should be in English.

        Job Title: {role}
        Job Description: {description}

        Format the output as:
        Key Responsibilities:
        - [list main duties]

        Required Skills:
        - [list required skills]

        Qualifications:
        - [list qualifications]
        """

        augmented = call_ollama(
            augment_prompt,
            "You are a job description writer. Extract and write key information concisely."
        )
        
        if augmented.startswith('Error:'):
            augmented = description[:500]  # Fallback to truncated original
        
        return jsonify({
            'role': role,
            'description': description,
            'augmentedDescription': augmented,
            'company': company,
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint: Run ML prediction with SHAP explainability
    Computes features, runs prediction, and generates SHAP-based feedback.
    Request: { resumeText: string, jobDescription: string, role: string }
    Response: { prediction: string, selectProbability: float, featureScores: {...}, shapValues: {...}, feedback: [...] }
    """
    data = request.get_json()
    resume_text = data.get('resumeText', '')
    job_description = data.get('jobDescription', '')
    role = data.get('role', '')
    
    if not resume_text or not job_description:
        return jsonify({'error': 'Missing resume or job description'}), 400
    
    try:
        # Step 1: Compute features (from preprocessing.ipynb)
        features = compute_features(resume_text, job_description, role)
        
        # Step 2: Run prediction with SHAP (from training.ipynb)
        prediction, probability, shap_values = predict_with_shap(features)
        
        # Step 3: Generate human-readable feedback
        feedback = generate_feedback(shap_values)
        
        return jsonify({
            'prediction': prediction,
            'selectProbability': probability,
            'featureScores': features,
            'shapValues': shap_values,
            'feedback': feedback,
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/tailor-resume', methods=['POST'])
def tailor_resume():
    """
    Endpoint: Tailor resume using Ollama LLM
    
    Uses SHAP feedback to guide the LLM in improving the resume.
   Feature-specific instructions are generated based on SHAP values:
    - Resume_JD_Sim: Modify phrasing to be more semantically similar to JD
    - Role_Resume_Sim: Explicitly include role keywords
    - Word_Overlap: Include more exact words from the JD
    - Tech_Keyword_Overlap: Include more tech keywords from the tech_keywords list 
    
    Request: { resumeText: string, jobDescription: string, feedback: [...], shapValues: {...}, role: string }
    Response: { content: string, improvements: [...] }
    """
    data = request.get_json()
    
    resume_text = data.get('resumeText', '')
    job_description = data.get('jobDescription', '')
    feedback = data.get('feedback', [])
    shap_values = data.get('shapValues', {})
    role = data.get('role', '')
    
    if not resume_text:
        return jsonify({'error': 'Missing resume text'}), 400
    
    try:
        # Build feature-specific improvement instructions based on SHAP values
        improvements_needed = []
        specific_instructions = []
        
        # Check Resume_JD_Sim - negative impact means low semantic similarity
        if shap_values.get('Resume_JD_Sim', 0) < 0:
            improvements_needed.append("Low semantic similarity between resume and job description")
            specific_instructions.append(
                "CRITICAL: Modify the resume's phrasing and wording to be more semantically similar to the job description. "
                "Use similar terminology, sentence structures, and contextual language that mirrors how the JD describes responsibilities and requirements."
            )
        
        # Check Role_Resume_Sim - negative impact means role keywords missing
        if shap_values.get('Role_Resume_Sim', 0) < 0:
            improvements_needed.append(f"Missing role-specific keywords for '{role}'")
            # Extract key words from role
            role_words = role.lower().replace('-', ' ').replace('/', ' ').split()
            specific_instructions.append(
                f"CRITICAL: Explicitly include the job role '{role}' or related terms in the resume. "
                f"Make sure to incorporate words like: {', '.join(role_words)}. "
                f"For example, if the role is 'Data Scientist', include phrases like 'data science', 'data-driven', 'scientific analysis', etc."
            )
        
        # Check Word_Overlap - negative impact means not enough exact word matches
        if shap_values.get('Word_Overlap', 0) < 0:
            # Calculate words in JD that aren't in resume
            resume_words = set(resume_text.lower().split())
            jd_words = set(job_description.lower().split())
            missing_words = jd_words - resume_words
            # Filter to meaningful words (longer than 3 chars, not common words)
            common_words = {'the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'from', 'your', 'they', 'been', 'were', 'being', 'their', 'would', 'about', 'there', 'which'}
            meaningful_missing = [w for w in missing_words if len(w) > 3 and w not in common_words][:20]
            
            improvements_needed.append("Low word overlap with job description")
            specific_instructions.append(
                f"CRITICAL: Include more exact words from the job description that are currently missing in the resume. "
                f"Key words to incorporate: {', '.join(meaningful_missing) if meaningful_missing else 'relevant keywords from the JD'}. "
                f"These words appear in the job description but not in the resume - find natural ways to include them."
            )
        
        # Check Tech_Keyword_Overlap - negative impact means missing tech keywords
        if shap_values.get('Tech_Keyword_Overlap', 0) < 0:
            # Find tech keywords in JD that are missing from resume
            resume_lower = resume_text.lower()
            jd_lower = job_description.lower()
            jd_tech_keywords = [kw for kw in tech_keywords if kw.lower() in jd_lower]
            missing_tech = [kw for kw in jd_tech_keywords if kw.lower() not in resume_lower]
            
            improvements_needed.append("Missing technical keywords from job description")
            specific_instructions.append(
                f"CRITICAL: Include more technical keywords from the job description. "
                f"Missing tech keywords that appear in the JD: {', '.join(missing_tech[:15]) if missing_tech else 'technical terms from the tech_keywords list'}. "
                f"Add these technical skills and tools where relevant to your experience."
            )
        
        # Build the prompt with feature-specific instructions
        prompt = f"""You are a professional resume writer. Rewrite the following resume to better match the job description.

        ORIGINAL RESUME:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        JOB ROLE: {role}

        AREAS THAT NEED IMPROVEMENT (based on AI/SHAP analysis):
        {chr(10).join('- ' + imp for imp in improvements_needed) if improvements_needed else '- Generally optimize for better keyword matching'}

        SPECIFIC INSTRUCTIONS FOR IMPROVEMENT:
        {chr(10).join(specific_instructions) if specific_instructions else '- Optimize the resume for ATS compatibility and keyword matching'}

        GENERAL GUIDELINES:
        1. Keep the same general structure and format
        2. Maintain truthfulness - only rephrase and enhance, don't fabricate experience
        3. Quantify achievements where possible
        4. Maintain a professional tone
        5. Ensure all changes align with the candidate's actual background

        OUTPUT the improved resume only, no explanations or commentary."""

        tailored_content = call_ollama(
            prompt,
            "You are an expert resume writer who creates ATS-optimized resumes. Output only the resume content, no meta-commentary. Focus on the specific improvement areas mentioned."
        )
        
        if tailored_content.startswith('Error:'):
            return jsonify({'error': tailored_content}), 500
        
        # Build improvements list based on what was addressed
        improvements = []
        if shap_values.get('Resume_JD_Sim', 0) < 0:
            improvements.append("Enhanced semantic similarity with job description phrasing")
        if shap_values.get('Role_Resume_Sim', 0) < 0:
            improvements.append(f"Added role-specific keywords for '{role}'")
        if shap_values.get('Word_Overlap', 0) < 0:
            improvements.append("Incorporated more exact words from job description")
        if shap_values.get('Tech_Keyword_Overlap', 0) < 0:
            improvements.append("Added missing technical keywords")
        
        if not improvements:
            improvements = [
                "Optimized for ATS compatibility",
                "Aligned experience with job requirements",
            ]
        
        return jsonify({
            'content': tailored_content,
            'improvements': improvements,
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    """
    Endpoint: Generate cover letter using Ollama LLM
    Creates a personalized cover letter based on the tailored resume.
    Uses SHAP feedback to emphasize areas that need highlighting.
    Request: { resumeText: string, jobDescription: string, role: string, company: string, shapValues: {...} }
    Response: { content: string, keyPointsAddressed: [...] }
    """
    data = request.get_json()
    resume_text = data.get('resumeText', '')
    job_description = data.get('jobDescription', '')
    role = data.get('role', 'the position')
    company = data.get('company', 'your company')
    shap_values = data.get('shapValues', {})
    
    if not resume_text:
        return jsonify({'error': 'Missing resume text'}), 400
    
    try:
        # Build feature-specific instructions based on SHAP values
        emphasis_areas = []
        specific_instructions = []
        key_points = []
        
        # Check Resume_JD_Sim - negative impact means low semantic similarity
        if shap_values.get('Resume_JD_Sim', 0) < 0:
            emphasis_areas.append("Semantic alignment with job description")
            specific_instructions.append(
                "IMPORTANT: Use phrasing and terminology that closely mirrors the job description. "
                "Echo the language and concepts used in the job posting to demonstrate understanding."
            )
            key_points.append("Aligned language with job description terminology")
        
        # Check Role_Resume_Sim - negative impact means role not emphasized
        if shap_values.get('Role_Resume_Sim', 0) < 0:
            emphasis_areas.append("Role-specific focus")
            specific_instructions.append(
                f"CRITICAL: Explicitly mention the role '{role}' and use related terminology throughout. "
                f"For example, if applying for '{role}', incorporate terms like '{role.lower()}' and related job function words. "
                "Make it clear this letter is specifically tailored for this exact position."
            )
            key_points.append(f"Emphasized {role} role-specific experience")
        
        # Check Word_Overlap - negative impact means vocabulary mismatch
        if shap_values.get('Word_Overlap', 0) < 0:
            # Calculate words in JD that could be highlighted
            resume_words = set(resume_text.lower().split())
            jd_words = set(job_description.lower().split())
            missing_words = jd_words - resume_words
            common_words = {'the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'from', 'your', 'they', 'been', 'were', 'being', 'their', 'would', 'about', 'there', 'which'}
            meaningful_words = [w for w in missing_words if len(w) > 3 and w not in common_words][:15]
            
            emphasis_areas.append("Vocabulary alignment")
            specific_instructions.append(
                f"IMPORTANT: Incorporate key words from the job description that may be missing. "
                f"Words to consider including: {', '.join(meaningful_words) if meaningful_words else 'relevant keywords from the JD'}. "
                "Use these terms naturally when describing your experience and interest."
            )
            key_points.append("Incorporated key terminology from job posting")
        
        # Check Tech_Keyword_Overlap - negative impact means missing tech keywords
        if shap_values.get('Tech_Keyword_Overlap', 0) < 0:
            resume_lower = resume_text.lower()
            jd_lower = job_description.lower()
            jd_tech_keywords = [kw for kw in tech_keywords if kw.lower() in jd_lower]
            missing_tech = [kw for kw in jd_tech_keywords if kw.lower() not in resume_lower]
            
            emphasis_areas.append("Technical skills emphasis")
            specific_instructions.append(
                f"CRITICAL: Highlight technical skills that match the job requirements. "
                f"Key technical terms to emphasize: {', '.join(missing_tech[:10]) if missing_tech else 'technical skills from the job description'}. "
                "Demonstrate hands-on experience with these technologies."
            )
            key_points.append("Highlighted relevant technical skills")
        
        # Default key points if no SHAP-based improvements
        if not key_points:
            key_points = [
                "Technical skills alignment",
                "Relevant experience",
                "Career goals match",
                "Cultural fit indicators",
            ]
        
        # Build the prompt with feature-specific instructions
        prompt = f"""Write a professional cover letter for the following job application.

        POSITION: {role}
        COMPANY: {company if company else 'the company'}

        JOB REQUIREMENTS:
        {job_description}

        CANDIDATE'S QUALIFICATIONS (from resume):
        {resume_text}

        {f"AREAS TO EMPHASIZE (based on AI/SHAP analysis):" if emphasis_areas else ""}
        {chr(10).join('- ' + area for area in emphasis_areas) if emphasis_areas else ''}

        {f"SPECIFIC INSTRUCTIONS FOR THIS COVER LETTER:" if specific_instructions else ""}
        {chr(10).join(specific_instructions) if specific_instructions else ''}

        GENERAL GUIDELINES:
        1. Write a compelling opening that shows enthusiasm for the role
        2. Highlight 2-3 specific experiences that match job requirements
        3. Show understanding of the company/role
        4. End with a clear call to action
        5. Keep it to 3-4 paragraphs
        6. Be professional but personable
        7. Mirror the language and terminology from the job description

        OUTPUT the cover letter only, no explanations or commentary."""

        cover_letter = call_ollama(
            prompt,
            "You are an expert cover letter writer. Create compelling, personalized cover letters that highlight relevant experience and use terminology aligned with the job description."
        )
        
        if cover_letter.startswith('Error:'):
            return jsonify({'error': cover_letter}), 500
        
        return jsonify({
            'content': cover_letter,
            'keyPointsAddressed': key_points,
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'model': OLLAMA_MODEL})


# ====================
# MAIN
# ====================

if __name__ == '__main__':
    print("=" * 50)
    print("ARBYTE Backend Server")
    print("=" * 50)
    print(f"Ollama Model: {OLLAMA_MODEL}")
    print(f"Ollama URL: {OLLAMA_BASE_URL}")
    print("=" * 50)
    print("\nStarting server on http://localhost:5000")
    print("Make sure Ollama is running: ollama serve")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
