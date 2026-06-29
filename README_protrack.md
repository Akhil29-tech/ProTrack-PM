# 🏢 ProTrack — Full-Stack PM Dashboard

A professional Product Management dashboard built with React and Firebase — inspired by tools like Jira, Linear, and Notion. Built as an MNC-level portfolio project.

🔗 **Live Demo:** [protrack-pm.netlify.app](https://protrack-pm.netlify.app)

---

## 🚀 Features

### 📋 Backlog Manager
- Create and manage user stories with title, description, priority and story points
- **RICE Scoring** (Reach, Impact, Confidence, Effort) — the same prioritisation framework used at Google, Facebook, and Intercom
- Filter by priority (High / Medium / Low) and sort by RICE score

### ⚡ Sprint Board (Kanban)
- Drag & drop cards across **Todo → In Progress → In Review → Done**
- Real-time updates via Firebase — changes sync instantly across all tabs
- Story point counter per column

### 🗺️ Product Roadmap
- Quarterly timeline view (Q1 / Q2 / Q3 / Q4)
- Feature planning with theme tagging and owner assignment
- Status colour coding — Planned / In Progress / Done / Cancelled

### 🎯 OKR Tracker
- Set Objectives with multiple Key Results
- Live progress bars with health scoring (Green / Yellow / Red)
- Update key result progress directly from the dashboard

### 📊 Metrics Dashboard
- Sprint velocity chart (Planned vs Completed)
- Burndown chart for active sprint
- Team performance tracker — stories completed per member

### 👥 Team Management
- Add team members with role, email, and timezone
- Role-based colour coding (PM / Dev / Designer / QA)

### ✨ AI Story Generator *(Claude AI — Coming Soon)*
> This feature is fully built and integrated with Claude AI. Describe any feature idea and Claude will instantly generate a complete user story with title, description, acceptance criteria, priority, story points, and RICE score — all in seconds. **Activates once Claude API credits are loaded.**

---

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Database:** Firebase Firestore (real-time)
- **Charts:** Recharts
- **Drag & Drop:** @hello-pangea/dnd
- **AI Integration:** Claude API (Anthropic) — pending credits
- **Deployment:** Netlify

---

## 📁 Project Structure

```
protrack/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── AIStoryGenerator.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Backlog.jsx
│   │   ├── SprintBoard.jsx
│   │   ├── Roadmap.jsx
│   │   ├── OKRs.jsx
│   │   ├── Metrics.jsx
│   │   └── Team.jsx
│   ├── firebase.js
│   ├── App.jsx
│   └── index.css
├── public/
│   └── index.html
├── netlify.toml
└── package.json
```

---

## 🚀 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Opens at **http://localhost:3000**

---

## 🌐 Deploy to Netlify

```bash
npm run build
```

Drag the `build` folder to [netlify.com](https://netlify.com) drop zone.

---

## 📁 Resume Description

> *Built ProTrack, a full-stack Product Management dashboard featuring Kanban sprint board with drag & drop, RICE scoring, OKR tracker, burndown charts, and Claude AI story generation — using React + Firebase Firestore. Deployed on Netlify.*

---

## 👤 Author

**Akhil Baiju**
- Portfolio: [akhilbaijuportfolio.netlify.app](https://akhilbaijuportfolio.netlify.app)
- GitHub: [github.com/Akhil29-tech](https://github.com/Akhil29-tech)
- LinkedIn: [linkedin.com/in/akhilbaiju2004](https://linkedin.com/in/akhilbaiju2004)
