<div align="center">
  <img src="https://img.shields.io/badge/Status-POC_v0.1-blueviolet" alt="Status Badge">
  <img src="https://img.shields.io/badge/Language-Python-blue" alt="Language Badge">
  <img src="https://img.shields.io/badge/Frontend-Streamlit-red" alt="Frontend Badge">
  <img src="https://img.shields.io/badge/ML-XGBoost/SBERT-orange" alt="ML Badge">
</div>

# 🛰️ Arbyte: The Autonomous Job Application Assistant

**Arbyte** is an intelligent web application designed to eliminate job application fatigue. Stop sending generic resumes into the black hole. Arbyte uses advanced **Semantic Feature Engineering** and **Generative AI** to instantly tailor your resume and cover letter to specific job descriptions, predicting your match score before you even hit 'Apply'.

> A well-crafted application is 50% technical skill and 50% strategic communication. We handle the strategy.

---

### 🌟 Features at a Glance

* **🔍 AI Match Predictor:** Uses a trained ML model to analyze the semantic overlap between your resume and a job description, providing a probability score of securing an interview.
* **✍️ LLM Tailoring:** Automatically rewrites your resume summary, highlights, and generates a custom cover letter to align with the job posting’s most relevant keywords and requirements.
* **📊 Application Tracker:** Stores all your application history, statuses, and the final match scores.
* **💾 Downloadable Artifacts:** Output tailored documents as clean, downloadable PDF files.

---

### 📂 Project Structure

This repository contains both the Proof of Concept (PoC) and the foundation for the production system.

- `poc/`: Contains the **Streamlit** prototype.
- `src/`: Contains the production source code (Backend & Frontend).
- `notebooks/`: Data science experiments and model training.
- `docs/`: Detailed plans and guides.

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for more details.

---

### 🚀 Quickstart Guide (PoC)

Follow these steps to run the Proof of Concept application locally:

#### 1. **Install Dependencies**:
```bash
pip install streamlit pandas
```

#### 2. **Launch the App**:
```bash
streamlit run poc/app.py
```

#### 3. **Explore**:
- Select a sample resume from the sidebar.
- Paste a job URL (or use the mock data provided).
- Click "Analyze Job Compatibility" to see the mock prediction.
- Generate tailored resumes and cover letters.

---

### 🤝 Contributing
We welcome contributions! Please check the issues tracker for tasks and feel free to submit pull requests.

### 📝 Licensing
This project is licensed under the MIT License - see the LICENSE file for details.
