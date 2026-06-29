import { useState } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Backlog from "./pages/Backlog";
import SprintBoard from "./pages/SprintBoard";
import Roadmap from "./pages/Roadmap";
import OKRs from "./pages/OKRs";
import Metrics from "./pages/Metrics";
import Team from "./pages/Team";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard setPage={setPage}/>,
    backlog:   <Backlog/>,
    sprint:    <SprintBoard/>,
    roadmap:   <Roadmap/>,
    okrs:      <OKRs/>,
    metrics:   <Metrics/>,
    team:      <Team/>,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar page={page} setPage={setPage}/>
      <main style={{ marginLeft:220, flex:1, padding:"28px 32px", minHeight:"100vh", background:"var(--bg)" }}>
        {pages[page]}
      </main>
    </div>
  );
}
