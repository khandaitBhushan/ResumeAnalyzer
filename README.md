

---

## 📄 Resume Analyzer & ATS Checker — Frontend

This is the **Frontend UI** for the Resume Analyzer & ATS Checker** application.
Built using **HTML, CSS, JavaScript**, and connected to a **Spring Boot backend deployed on Render**.

The tool allows users to upload their resume and get:

* ✅ Resume Quality & Suggestions
* ✅ ATS Score & Keyword Match
* ✅ Skill & Keyword Comparison

---

## Live At : <a href = "https://khandaitbhushan.github.io/ResumeAnalyzer/">Visit</a>
<h3>Visit : https://khandaitbhushan.github.io/ResumeAnalyzer/</h3>
---

## 🚀 Backend API (Spring Boot — Render)

| Feature         | Endpoint                                                             |
| --------------- | -------------------------------------------------------------------- |
| Resume Analysis | `https://resumeanalyzeratschecker.onrender.com/api/resume/analyzer`  |
| ATS Checker     | `https://resumeanalyzeratschecker.onrender.com/api/resume/ats-check` |

These URLs are used in `script.js` for API calls.

---

## 🔧 Updating Backend URL in UI

If your backend URL changes (e.g., redeploy on Render/Vercel/AWS):

Find and update these lines in JavaScript:

```js
const ANALYZE_URL = "https://resumeanalyzeratschecker.onrender.com/api/resume/analyzer";
const ATS_URL = "https://resumeanalyzeratschecker.onrender.com/api/resume/ats-check";
```

Replace with your new URLs.

---

## 🔑 How to Change the API Key (Backend)

> API key is **NOT** inside frontend — only in backend for security.

If your OpenAI key expires or you want to change it, follow this:

### ✅ Steps to Update API Key on Render

1. Go to Render Dashboard
2. Select your backend service
3. Go to **Environment Variables**
4. Replace value of:

   ```
   OPENAI_API_KEY
   ```
5. Click **Save & Redeploy**
6. If needed, you can **Undeploy** and **Redeploy** from the same GitHub repo

📌 No frontend code change required.
📌 Never hard-code the API key in UI.

---

## 🛠 Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Frontend   | HTML, CSS, JavaScript   |
| Backend    | Spring Boot + Spring AI |
| AI Model   | OpenAI API              |
| Deployment | Render                  |

---

## 🏃 Run UI Locally

```bash
1. Clone repository
2. Open index.html in browser
3. Upload your resume & test
```

Backend must be running online/local.

---

## 🌐 Live Backend

```
https://resumeanalyzeratschecker.onrender.com
```

If server sleeps, open above link to wake it.

---

## 🔒 Security Notes

* ❌ No API key in frontend
* ✅ Key safely stored in Render environment variables
* ✅ Secure AI request handling

---

## 📧 Contact

Developer: **Bhushan Khandait**

If you like this project, ⭐ star the repo!

---


