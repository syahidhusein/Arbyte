<div align="center">
  <img src="https://img.shields.io/badge/Status-POC_v0.1-blueviolet" alt="Status Badge">
  <img src="https://img.shields.io/badge/Language-Python-blue" alt="Language Badge">
  <img src="https://img.shields.io/badge/Frontend-Streamlit-red" alt="Frontend Badge">
  <img src="https://img.shields.io/badge/ML-XGBoost/SBERT-orange" alt="ML Badge">
</div>

# 👩🏻‍💻 Arbyte: The Autonomous Job Application Assistant

**CareerPilot AI** is an intelligent web application designed to eliminate job application fatigue. Stop sending generic resumes into the black hole. Arbyte uses advanced **Semantic Feature Engineering** and **Generative AI** to instantly tailor your resume and cover letter to specific job descriptions, predicting your match score before you even hit 'Apply'.

> A well-crafted application is 50% technical skill and 50% strategic communication. We handle the strategy.

---

### 🌟 Features at a Glance

* **🔍 AI Match Predictor:** Uses a trained **[PLACEHOLDER]** model to analyze the semantic overlap between your resume and a job description, providing a probability score of securing an interview.
* **✍️ LLM Tailoring:** Automatically rewrites your resume summary, highlights, and generates a custom cover letter to align with the job posting’s most relevant keywords and requirements.
* **📊 Application Tracker:** Stores all your application history, statuses, and the final match scores in a lightweight **SQLite** database.
* **💾 Downloadable Artifacts:** Output tailored documents as clean, downloadable PDF files.

---

### 🛠️ Scope and Limitations (MVP)

| Feature | Current Scope | Future Vision (V1.0) |
| :--- | :--- | :--- |
| **Domain** | Strictly focused on **Tech, IT, and Software Engineering** roles. | Expand model training to include Finance, Engineering (O&G), and Healthcare. |

---

### 🚀 Quickstart Guide

Follow these steps to run the application locally:

#### 1. **Launch the App**: Run the Streamlit application from your terminal.
```bash
streamlit run app.py
```
#### 2. **Input Resume Data**: Locate the Resume Text Input Area in the sidebar. For the PoC, a sample resume text is pre-loaded to expedite testing. In the final version, you will upload your resume PDF here.
#### 3. **Analyze Job Posting**: Paste the target Job Posting URL (e.g., LinkedIn, Indeed) into the main input field. Click "Scrape Job Data" to fetch the description text.
#### 4. **Get ML-Predicted Match Score**: Click the "Analyze" button. The AI Match Predictor will display your probability score of securing an interview based on an ML model trained on successful and failed resume data.
#### 5. **Tailore and Generate**: Click the "Generate Tailored Application" button to trigger the LLM agent. The system will output the newly tailored resume text and a cover letter based on the match analysis. Use the download link to save your application documents.

### 🤝 Contributing
We welcome contributions! Please check the issues tracker for tasks and feel free to submit pull requests.
### 📝 Licensing
This project is licensed under the MIT License - see the LICENSE file for details.
