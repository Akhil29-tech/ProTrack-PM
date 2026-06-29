import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AIStoryGenerator from "../components/AIStoryGenerator";

const PRIORITIES = ["High","Medium","Low"];
const STATUSES = ["backlog","todo","inprogress","review","done"];

function riceScore(r,i,c,e) {
  if(!e) return 0;
  return Math.round((r * i * (c/100)) / e);
}

function StoryModal({ story, onClose, onSave }) {
  const [form, setForm] = useState(story || { title:"", description:"", priority:"Medium", status:"backlog", assignee:"", points:3, reach:100, impact:3, confidence:80, effort:2 });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const rice = riceScore(form.reach, form.impact, form.confidence, form.effort);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{story ? "Edit Story" : "New User Story"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:20 }}>x</button>
        </div>
        <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="As a user, I want to..."/></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set("description",e.target.value)}/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e=>set("priority",e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>set("status",e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Points</label><input type="number" value={form.points} onChange={e=>set("points",+e.target.value)} min={1} max={13}/></div>
        </div>
        <div className="form-group"><label>Assignee</label><input value={form.assignee} onChange={e=>set("assignee",e.target.value)}/></div>
        <hr className="divider"/>
        <div style={{ marginBottom:8, fontWeight:600, fontSize:13 }}>RICE Score: <span style={{ color:"var(--blue)" }}>{rice}</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[["reach","Reach",0,10000],["impact","Impact (1-3)",1,3],["confidence","Confidence %",0,100],["effort","Effort",0.5,10]].map(([k,l,mn,mx])=>(
            <div className="form-group" key={k}><label>{l}</label><input type="number" value={form[k]} onChange={e=>set(k,+e.target.value)} min={mn} max={mx} step={k==="effort"?0.5:1}/></div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave({...form, rice})}>{story ? "Update" : "Create Story"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Backlog() {
  const [stories, setStories] = useState([]);
  const [modal, setModal] = useState(null);
  const [aiModal, setAiModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("rice");

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"stories"), snap => {
      setStories(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  }, []);

  const save = async (form) => {
    if (modal === "new") {
      await addDoc(collection(db,"stories"), { ...form, createdAt: Date.now() });
    } else {
      await updateDoc(doc(db,"stories",modal.id), form);
    }
    setModal(null);
  };

  const del = async (id) => {
    if(window.confirm("Delete?")) await deleteDoc(doc(db,"stories",id));
  };

  const filtered = stories
    .filter(s => filter === "all" || s.priority === filter)
    .sort((a,b) => sort === "rice" ? (b.rice||0)-(a.rice||0) : sort === "points" ? b.points-a.points : a.title.localeCompare(b.title));

  const pc = { High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Backlog</div>
          <div className="page-subtitle">{stories.length} stories</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-secondary" onClick={()=>setAiModal(true)}>✨ AI Generate</button>
          <button className="btn btn-primary" onClick={()=>setModal("new")}>+ Add Story</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {["all","High","Medium","Low"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="btn btn-sm" style={{ background:filter===f?"var(--blue2)":"var(--surface)", color:filter===f?"#fff":"var(--muted)", border:"1px solid var(--border)" }}>{f}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"var(--muted)", fontSize:13 }}>Sort:</span>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{ width:"auto" }}>
            <option value="rice">RICE Score</option>
            <option value="points">Story Points</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No stories yet</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
            <button className="btn btn-secondary" onClick={()=>setAiModal(true)}>✨ AI Generate</button>
            <button className="btn btn-primary" onClick={()=>setModal("new")}>+ Add Story</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"var(--bg3)", borderBottom:"1px solid var(--border)" }}>
                {["Title","Priority","Status","Points","RICE","Assignee",""].map(h=>(
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:12, color:"var(--muted)", fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={s.id} style={{ borderBottom:"1px solid var(--border)", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                  <td style={{ padding:"12px 16px", maxWidth:280 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:500 }}>{s.title}</span>
                      {s.aiGenerated && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:20, background:"rgba(137,87,229,0.15)", color:"var(--purple)", border:"1px solid rgba(137,87,229,0.3)" }}>AI</span>}
                    </div>
                    {s.description && <div style={{ fontSize:12, color:"var(--muted)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:260 }}>{s.description}</div>}
                  </td>
                  <td style={{ padding:"12px 16px" }}><span className={"badge " + pc[s.priority]}>{s.priority}</span></td>
                  <td style={{ padding:"12px 16px" }}><span className="tag">{s.status}</span></td>
                  <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono)", color:"var(--blue)" }}>{s.points}pt</td>
                  <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono)", fontWeight:700, color:"var(--purple)" }}>{s.rice||0}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)", fontSize:13 }}>{s.assignee||"-"}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={()=>setModal(s)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={()=>del(s.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {aiModal && <AIStoryGenerator onClose={()=>setAiModal(false)} onCreated={()=>setAiModal(false)}/>}
      {modal && <StoryModal story={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={save}/>}
    </div>
  );
}
