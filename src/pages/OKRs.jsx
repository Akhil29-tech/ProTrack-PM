import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function OKRModal({ onClose, onSave }) {
  const [objective, setObjective] = useState("");
  const [krs, setKrs] = useState([{ title:"", target:100, current:0, unit:"%" }]);
  const addKr = () => setKrs(k=>[...k,{ title:"", target:100, current:0, unit:"%" }]);
  const setKr = (i,k,v) => setKrs(prev => prev.map((kr,idx) => idx===i ? {...kr,[k]:v} : kr));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New Objective</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20 }}>×</button>
        </div>
        <div className="form-group">
          <label>Objective *</label>
          <input value={objective} onChange={e=>setObjective(e.target.value)} placeholder="e.g. Improve user retention by end of Q2"/>
        </div>
        <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Key Results</div>
        {krs.map((kr,i)=>(
          <div key={i} style={{ background:"var(--bg3)", borderRadius:6, padding:12, marginBottom:10 }}>
            <div className="form-group">
              <label>Key Result {i+1}</label>
              <input value={kr.title} onChange={e=>setKr(i,"title",e.target.value)} placeholder="e.g. Increase DAU from 1K to 5K"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              <div className="form-group"><label>Current</label><input type="number" value={kr.current} onChange={e=>setKr(i,"current",+e.target.value)}/></div>
              <div className="form-group"><label>Target</label><input type="number" value={kr.target} onChange={e=>setKr(i,"target",+e.target.value)}/></div>
              <div className="form-group"><label>Unit</label><input value={kr.unit} onChange={e=>setKr(i,"unit",e.target.value)} placeholder="%"/></div>
            </div>
          </div>
        ))}
        <button className="btn btn-secondary btn-sm" onClick={addKr} style={{ marginBottom:10 }}>＋ Add Key Result</button>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(objective) onSave({ objective, krs, createdAt:Date.now() }); }}>Create OKR</button>
        </div>
      </div>
    </div>
  );
}

export default function OKRs() {
  const [okrs, setOkrs] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"okrs"), snap => {
      setOkrs(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  }, []);

  const save = async (form) => {
    await addDoc(collection(db,"okrs"), form);
    setModal(false);
  };

  const del = async (id) => {
    if(window.confirm("Delete this OKR?")) await deleteDoc(doc(db,"okrs",id));
  };

  const updateKr = async (okrId, krs) => {
    await updateDoc(doc(db,"okrs",okrId), { krs });
  };

  const health = (krs) => {
    if(!krs||!krs.length) return 0;
    const avg = krs.reduce((a,kr) => a + Math.min(100, Math.round((kr.current/kr.target)*100)), 0) / krs.length;
    return Math.round(avg);
  };

  const healthColor = (h) => h >= 70 ? "var(--green)" : h >= 40 ? "var(--yellow)" : "var(--red)";

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">OKRs</div>
          <div className="page-subtitle">Objectives & Key Results · {okrs.length} active objectives</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>＋ New Objective</button>
      </div>

      {okrs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">No OKRs yet</div>
          <p>Set your first objective to start tracking team goals</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>setModal(true)}>＋ New Objective</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {okrs.map(okr => {
            const h = health(okr.krs);
            return (
              <div key={okr.id} className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{okr.objective}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:13, color:"var(--muted)" }}>Overall Health:</span>
                      <span style={{ fontWeight:700, color:healthColor(h), fontFamily:"var(--font-mono)" }}>{h}%</span>
                      <div style={{ flex:1, maxWidth:200 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width:`${h}%`, background:healthColor(h) }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>del(okr.id)} className="btn btn-sm btn-danger">Delete</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(okr.krs||[]).map((kr,i) => {
                    const pct = Math.min(100, Math.round((kr.current/kr.target)*100));
                    return (
                      <div key={i} style={{ background:"var(--bg3)", borderRadius:6, padding:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontSize:13, fontWeight:500 }}>{kr.title}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <input type="number" value={kr.current}
                              onChange={e => {
                                const updated = [...okr.krs];
                                updated[i] = {...updated[i], current:+e.target.value};
                                updateKr(okr.id, updated);
                              }}
                              style={{ width:70, padding:"3px 8px", fontSize:12 }}
                            />
                            <span style={{ color:"var(--muted)", fontSize:12 }}>/ {kr.target} {kr.unit}</span>
                            <span style={{ fontWeight:700, color:healthColor(pct), fontFamily:"var(--font-mono)", fontSize:13 }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width:`${pct}%`, background:healthColor(pct) }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && <OKRModal onClose={()=>setModal(false)} onSave={save}/>}
    </div>
  );
}
