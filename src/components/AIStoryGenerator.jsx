import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const API_KEY = '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 ';

export default function AIStoryGenerator({ onClose, onCreated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: 'You are a senior product manager. Generate a user story from this idea: ' + prompt + '. Respond ONLY with valid JSON, no markdown, no backticks, no explanation: { "title": "As a user I want...", "description": "...", "acceptanceCriteria": ["criterion 1", "criterion 2"], "priority": "High", "points": 3, "reach": 500, "impact": 2, "confidence": 80, "effort": 2 }'
          }]
        })
      });
      const data = await response.json();
      if (data.error) { setError('API Error: ' + data.error.message); setLoading(false); return; }
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch(e) {
      setError('Failed: ' + e.message);
    }
    setLoading(false);
  };

  const saveToBacklog = async () => {
    if (!result) return;
    setSaving(true);
    const rice = Math.round((result.reach * result.impact * (result.confidence/100)) / result.effort);
    await addDoc(collection(db, 'stories'), {
      ...result, status: 'backlog', assignee: '', rice,
      createdAt: Date.now(), aiGenerated: true
    });
    setSaving(false);
    onCreated && onCreated();
    onClose();
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' style={{ maxWidth:600 }} onClick={e=>e.stopPropagation()}>
        <div className='modal-header'>
          <div className='modal-title'>
            ✨ AI Story Generator
            <span className='badge badge-purple' style={{ fontSize:10, marginLeft:8 }}>Claude</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:20 }}>x</button>
        </div>
        <div className='form-group'>
          <label>Describe your feature idea</label>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder='e.g. I want users to reset their password via email' style={{ minHeight:90 }}/>
        </div>
        <button className='btn btn-primary' onClick={generate} disabled={loading} style={{ width:'100%', justifyContent:'center', marginBottom:20 }}>
          {loading ? '✨ Generating...' : '✨ Generate User Story'}
        </button>
        {error && (
          <div style={{ color:'var(--red)', fontSize:13, marginBottom:16, padding:'10px 14px', background:'rgba(248,81,73,0.1)', borderRadius:6 }}>
            {error}
          </div>
        )}
        {result && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:16, marginBottom:16 }}>
            <div style={{ fontWeight:600, marginBottom:10, color:'var(--green)' }}>Story Generated!</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>TITLE</div>
              <div style={{ fontWeight:600 }}>{result.title}</div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>DESCRIPTION</div>
              <div style={{ fontSize:13, color:'var(--muted)' }}>{result.description}</div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6 }}>ACCEPTANCE CRITERIA</div>
              {(result.acceptanceCriteria||[]).map((c,i) => (
                <div key={i} style={{ fontSize:13, marginBottom:4 }}>✓ {c}</div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {[['Priority',result.priority],['Points',result.points+'pt'],['RICE',Math.round((result.reach*result.impact*(result.confidence/100))/result.effort)],['Confidence',result.confidence+'%']].map(([l,v])=>(
                <div key={l} style={{ textAlign:'center', background:'var(--surface)', borderRadius:6, padding:'8px 4px' }}>
                  <div style={{ fontWeight:700, color:'var(--blue)', fontSize:15 }}>{v}</div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='modal-footer'>
          <button className='btn btn-secondary' onClick={onClose}>Cancel</button>
          {result && (
            <button className='btn btn-primary' onClick={saveToBacklog} disabled={saving}>
              {saving ? 'Saving...' : 'Save to Backlog'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
