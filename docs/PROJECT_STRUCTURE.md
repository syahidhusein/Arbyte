# Arbyte Project Structure

This document outlines the organization of the Arbyte project. This structure is designed to separate the Proof of Concept (PoC), Data Science research, and Production code.

## Directory Layout

```
arbyte/
├── data/                  # Local data storage (e.g., CSVs, PDFs)
│                          # Add this to .gitignore to avoid committing large datasets.
│
├── docs/                  # Project documentation and guides
│   ├── EXECUTION_PLAN.md  # Step-by-step development plan
│   └── REACT_VS_STREAMLIT.md # Learning guide
│
├── notebooks/             # Jupyter notebooks for experimentation and training
│   └── preprocessing.ipynb
│
├── poc/                   # Proof of Concept application
│   └── app.py             # The Streamlit prototype (formerly poc_app.py)
│
├── src/                   # Production Source Code
│   ├── backend/           # Python Backend (FastAPI/Flask) + ML Inference
│   └── frontend/          # React.js Frontend
│
├── .gitignore
├── README.md
└── requirements.txt
```

## Where to put code?

### 1. Proof of Concept (`poc/`)
-   **Purpose:** Quick prototypes, demos for stakeholders, testing ideas.
-   **Tech:** Streamlit, simple scripts.
-   **Rule:** Code here is "throwaway" or reference. It doesn't need to be perfect.

### 2. Research & Experiments (`notebooks/`)
-   **Purpose:** Data exploration, training ML models, testing vectorizers.
-   **Tech:** Jupyter Notebooks (.ipynb).
-   **Rule:** Keep this separate from production code. Once a model works here, migrate the logic to `src/backend/`.

### 3. Production Backend (`src/backend/`)
-   **Purpose:** The robust API that serves the app.
-   **Tech:** Python, FastAPI (recommended) or Flask.
-   **Components:**
    -   API Routes (Endpoints)
    -   ML Model Loading & Inference
    -   Database Models
    -   Scraping Logic

### 4. Production Frontend (`src/frontend/`)
-   **Purpose:** The user interface.
-   **Tech:** React.js, TypeScript (recommended), Tailwind CSS.
-   **Components:**
    -   React Components
    -   State Management
    -   API Clients

## Next Steps
1.  Run the PoC from the new location: `streamlit run poc/app.py`
2.  Start developing the backend in `src/backend`.
