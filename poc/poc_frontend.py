import streamlit as st
import json
import random
import time
import pandas as pd

### Read sample data

poc_data = json.load(open("poc/poc_data.json"))

### Initialize session state (To avoid app resetting on every trigger)    
if 'selected_candidate' not in st.session_state:
    st.session_state['selected_candidate'] = None

if 'app_state' not in st.session_state:
    st.session_state['app_state'] = 0 # 0: Initial, 1: Resume Uploaded, 2: Job URL Submitted, 3: Prediction Made, 4 : Resume Tailored, 5: Cover Letter Generated

### App Header

st.set_page_config(page_title="Arbyte", page_icon="🚀", layout="wide")

st.title("👩🏻‍💻 Arbyte")
st.markdown("#### Eliminate rejection fatigue. Tailor your resume, predict outcomes, and land the job.")

### Split columns

with st.sidebar:
    st.header("Syahid Husein")
    st.markdown("---")
    st.header("📊 Application Tracker")
    
    # Dummy Data for the Tracker
    tracker_data = {
        "Position": ["Data Scientist @ Google", "ML Engineer @ Spotify", "Backend Dev @ Grab"],
        "Date": ["2023-10-01", "2023-10-05", "2023-10-12"],
        "Status": ["❌ Rejected", "✅ Interview", "⏳ Pending"]
    }
    df_tracker = pd.DataFrame(tracker_data)
    
    # Display as a clean table (hide index)
    st.dataframe(df_tracker, hide_index=True, use_container_width=True)
    st.button("Update Application Status", key="update_status")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Your Resume")
    if st.button("📄 Upload Resume", key="upload_resume"):
        with st.spinner("Uploading..."):
            time.sleep(2)
            with st.spinner("Parsing Resume Data..."):
                time.sleep(2)
                st.session_state['selected_candidate'] = random.choice(poc_data)
                st.session_state['app_state'] = 1
                st.success("Resume Uploaded Successfully!")
    if st.session_state['selected_candidate']:
        st.text_area("Resume Content", st.session_state['selected_candidate']["Resume"], height=300)
    else:
        st.info("Please upload your resume to begin.")

with col2:
    st.subheader("Job Applications")
    job_url = st.text_input("Paste Job Position URL (LinkedIn, Indeed, etc.)", placeholder="https://www.linkedin.com/jobs/view/...", key="job_url")
    if job_url and st.session_state["selected_candidate"]:
        if st.session_state['app_state'] < 2:
            with st.spinner("Scraping Job Description..."):
                time.sleep(2)
                st.success("Job Description Scraped Successfully!")
                st.session_state['app_state'] = 2
                st.text_area("Job Description", st.session_state["selected_candidate"]["Job_Description"], height=200)
    elif job_url and not st.session_state["selected_candidate"]:
        st.warning("Please upload your resume first.")

st.divider()
if st.session_state['app_state'] >= 2:
    st.subheader("Application Outcome Prediction")
    if st.button("🚀 Predict Outcome"):
        with st.spinner("Analyzing..."):
            time.sleep(3)
            st.session_state['app_state'] = 3
if st.session_state['app_state'] >= 3:
    st.subheader("Prediction Result")
    st.markdown(f"**Predicted Outcome:** {st.session_state["selected_candidate"]['Decision']}")
    st.markdown(f"**Confidence Score:** : {random.randint(75, 99)}% (placeholder value)")
    st.markdown("### Feedback:")
    st.markdown(f" Here is where your resume could be improved : .........")
    candidate = st.session_state["selected_candidate"]
    if st.session_state['app_state'] == 3:
        st.write("Would you like to implement the feedbacks into your resume?")
        if st.button("🛠️ Tailor Resume"):
            with st.spinner("Updating Resume..."):
                time.sleep(2)
                st.session_state['app_state'] = 4
                st.success("Resume Updated Successfully!")
if st.session_state['app_state'] >= 4:
    st.write("Here is you tailored resume :")
    st.text_area("Your Tailored Resume", height=300, key="tailored_resume_viewer")
    st.button("📄 Download Tailored Resume")
    if st.session_state['app_state'] == 4:
        st.write("Would you like to generate a cover letter for this job?")
        if st.button("📝 Generate Cover Letter"):
            with st.spinner("Generating Cover Letter..."):
                time.sleep(2)
                st.success("Cover Letter Generated Successfully!")
                st.session_state['app_state'] = 5
                st.write("Here is your cover letter :")
                st.text_area("Your Cover Letter", height=300, key="cover_letter_viewer")
                st.button("📄 Download Cover Letter")
