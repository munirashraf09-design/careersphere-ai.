import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Compass, Bot, ClipboardCheck, BookOpen, Home, Send, Trash2, RefreshCw, Search, Sparkles } from 'lucide-react';

const STARTERS = ['What career options can I choose after 12th?', 'Give me a roadmap to become an AI engineer.', 'Which skills are required for a software developer internship?', 'How can I find scholarships in India?', 'Help me choose a career based on my interests.'];

// [category, question, options, correct index]
const QS = [
 ['Logical','If A > B and B > C, then:',['C > A','A > C','A = C','Cannot say'],1],
 ['Logical','All roses are flowers. Some flowers fade. Which is most certain?',['All roses fade','Some roses may fade','No rose fades','All flowers are roses'],1],
 ['Logical','Which does not belong: Square, Triangle, Circle, Cube?',['Square','Triangle','Circle','Cube'],3],
 ['Numerical','What is 15% of 240?',['30','36','42','48'],1],
 ['Numerical','A train runs at 60 km/h for 2.5 hours. Distance?',['120 km','150 km','160 km','180 km'],1],
 ['Numerical','Split 64 in the ratio 3:5. The larger part is:',['24','32','40','44'],2],
 ['Verbal','Synonym of "abundant":',['Scarce','Plentiful','Tiny','Costly'],1],
 ['Verbal','Antonym of "expand":',['Grow','Stretch','Shrink','Spread'],2],
 ['Verbal','Correct spelling:',['Accomodate','Acommodate','Accommodate','Acomodate'],2],
 ['Pattern','2, 4, 8, 16, ?',['24','30','32','36'],2],
 ['Pattern','1, 4, 9, 16, ?',['20','24','25','36'],2],
 ['Pattern','A, C, E, G, ?',['H','I','J','K'],1],
 ['Analytical','Ravi is left of Sita, Sita is left of Tara. Who is in the middle of the three?',['Ravi','Sita','Tara','Cannot say'],1],
 ['Analytical','A Rs.500 item has a 20% discount. You pay:',['Rs.380','Rs.400','Rs.420','Rs.450'],1],
 ['Analytical','6 workers finish a job in 10 days. Days for 12 workers?',['5','6','15','20'],0],
];
const TIPS = { Logical: 'Practise syllogisms and logic puzzles.', Numerical: 'Revise percentages, ratios and speed-distance problems.', Verbal: 'Read daily and build vocabulary.', Pattern: 'Practise number and letter series.', Analytical: 'Solve word problems step by step.' };
export const score = (answers) => {
  const by = {};
  QS.forEach((q, i) => { by[q[0]] ??= { right: 0, total: 0 }; by[q[0]].total++; if (answers[i] === q[3]) by[q[0]].right++; });
  return { by, total: Object.values(by).reduce((a, c) => a + c.right, 0) };
};

function Chat({ seed, clearSeed }) {
  const [msgs, setMsgs] = useState([]); const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  const send = async (text, base = msgs) => {
    if (!text.trim() || busy) return;
    const next = [...base, { role: 'user', text: text.trim() }];
    setMsgs(next); setInput(''); setErr(''); setBusy(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/careers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Request failed.');
      setMsgs([...next, { role: 'model', text: d.reply }]);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  useEffect(() => { if (seed) { send(seed, []); clearSeed(); } }, [seed]);
  const retry = () => { const last = msgs[msgs.length - 1]; if (last?.role === 'user') send(last.text, msgs.slice(0, -1)); };
  return (<div className="card">
    <h2><Bot size={20} /> AI Career Assistant (Gemini)</h2>
    <div className="warn">AI answers may be inaccurate — verify important details on official websites. Suggestions are guidance, not guaranteed outcomes.</div>
    <div className="chat" aria-live="polite">
      {!msgs.length && <div className="row">{STARTERS.map(s => <button key={s} onClick={() => send(s)}><Sparkles size={14} />{s}</button>)}</div>}
      {msgs.map((m, i) => <div key={i} className={'msg ' + (m.role === 'user' ? 'user' : '')}>{m.role === 'user' ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}</div>)}
      {busy && <div className="msg dots"><span>●</span><span>●</span><span>●</span></div>}
      <div ref={end} />
    </div>
    {err && <p className="err" role="alert">{err} <button onClick={retry}><RefreshCw size={14} />Retry</button></p>}
    <div className="row" style={{ marginTop: 12 }}>
      <div style={{ flex: 1, minWidth: 200 }}><input aria-label="Message" maxLength={2000} value={input} placeholder="Ask about careers, courses, scholarships…" onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} /></div>
      <button className="primary" disabled={busy || !input.trim()} onClick={() => send(input)}><Send size={16} />Send</button>
      <button onClick={() => { setMsgs([]); setErr(''); }}><Trash2 size={16} />Clear</button>
    </div></div>);
}

function Aptitude() {
  const [i, setI] = useState(0); const [a, setA] = useState({}); const [done, setDone] = useState(false);
  if (done) { const { by, total } = score(a); return (<div className="card"><h2>Your result: {total} / {QS.length}</h2>
    <p className="muted">This is a basic career-exploration tool, not a scientifically validated psychometric test.</p>
    {Object.entries(by).map(([k, v]) => <div key={k} style={{ margin: '12px 0' }}><b>{k}</b> {v.right}/{v.total}{v.right / v.total < 0.6 && <span className="muted"> — {TIPS[k]}</span>}<div className="bar"><i style={{ width: (v.right / v.total) * 100 + '%' }} /></div></div>)}
    <button className="primary" onClick={() => { setA({}); setI(0); setDone(false); }}>Retake</button></div>); }
  const q = QS[i];
  return (<div className="card"><p className="muted">Question {i + 1} of {QS.length} · {q[0]}</p><div className="bar"><i style={{ width: ((i + 1) / QS.length) * 100 + '%' }} /></div>
    <h3>{q[1]}</h3><div className="grid">{q[2].map((o, j) => <button key={j} className={a[i] === j ? 'on' : ''} onClick={() => setA({ ...a, [i]: j })}>{o}</button>)}</div>
    <div className="row" style={{ marginTop: 20 }}><button disabled={!i} onClick={() => setI(i - 1)}>Previous</button>
      {i < QS.length - 1 ? <button className="primary" onClick={() => setI(i + 1)}>Next</button> : <button className="primary" onClick={() => setDone(true)}>Submit</button>}
      <span className="muted">{Object.keys(a).length} answered</span></div></div>);
}

function Careers({ ask }) {
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [open, setOpen] = useState(null);
  useEffect(() => { fetch(`${import.meta.env.VITE_API_URL}/api/careers`).then(r => r.json()).then(d => setData(d.data)).catch(() => setErr('Could not load careers. Is the server running?')); }, []);
  if (err) return <p className="err">{err}</p>; if (!data) return <div className="card">Loading careers…</div>;
  const cats = ['All', ...new Set(data.map(c => c.category))];
  const list = data.filter(c => (cat === 'All' || c.category === cat) && (c.title + c.skills.join(' ') + c.description).toLowerCase().includes(q.toLowerCase()));
  return (<div><div className="warn">Sample career records for demonstration — replace with verified data.</div>
    <div className="row"><div style={{ flex: 1, minWidth: 200 }}><input aria-label="Search careers" placeholder="Search title or skill…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <select aria-label="Category" style={{ width: 180 }} value={cat} onChange={e => setCat(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="grid" style={{ marginTop: 20 }}>{!list.length && <p className="muted">No careers match your search.</p>}
      {list.map(c => <div className="card" key={c.id}><h3>{c.title}</h3><p className="muted">{c.description}</p>{c.skills.map(s => <span className="tag" key={s}>{s}</span>)}
        {open === c.id && <div><p><b>Education:</b> {c.level}</p><p><b>Roadmap:</b></p><ol>{c.roadmap.map(r => <li key={r}>{r}</li>)}</ol><p><b>Roles:</b> {c.roles.join(', ')}</p><p><b>Certifications:</b> {c.certs.join(', ')}</p><p><b>Industries:</b> {c.industries.join(', ')}</p></div>}
        <div className="row" style={{ marginTop: 12 }}><button onClick={() => setOpen(open === c.id ? null : c.id)}>{open === c.id ? 'Hide' : 'Details'}</button>
          <button className="primary" onClick={() => ask('Give me personalized guidance and a beginner roadmap for a career as ' + c.title + '.')}><Bot size={14} />Ask AI</button></div></div>)}</div></div>);
}

function Courses() {
  const [d, setD] = useState(null);
  useEffect(() => { fetch(`${import.meta.env.VITE_API_URL}/api/courses`).then(r => r.json()).then(r => setD(r.data)).catch(() => setD([])); }, []);
  if (!d) return <div className="card">Loading…</div>;
  return <div className="grid">{d.map(c => <div className="card" key={c.id}><h3>{c.title}</h3><p className="muted">{c.provider} · {c.level} · {c.duration}</p><span className="tag">{c.free ? 'Free' : 'Paid'}</span><p><a href={c.url} target="_blank" rel="noreferrer">Official link</a></p></div>)}</div>;
}

export default function App() {
  const [tab, setTab] = useState('home'); const [seed, setSeed] = useState('');
  const ask = (t) => { setSeed(t); setTab('chat'); };
  const T = [['home', Home, 'Home'], ['careers', Compass, 'Careers'], ['courses', BookOpen, 'Courses'], ['test', ClipboardCheck, 'Aptitude'], ['chat', Bot, 'AI Assistant']];
  return (<><nav><b><Compass color="#526DFF" />CareerSphere AI</b>{T.map(([k, I, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><I size={16} />{l}</button>)}</nav>
    <main>
      {tab === 'home' && <div className="card" style={{ textAlign: 'center', padding: 48 }}><h1>Your Future Starts With the Right Guidance</h1>
        <p className="muted">Discover careers, take a basic aptitude test, explore courses and get AI-powered guidance.</p>
        <div className="row" style={{ justifyContent: 'center' }}><button className="primary" onClick={() => setTab('careers')}>Explore Careers</button><button onClick={() => setTab('chat')}>Ask AI Assistant</button></div></div>}
      {tab === 'careers' && <Careers ask={ask} />}
      {tab === 'courses' && <Courses />}
      {tab === 'test' && <Aptitude />}
      <div style={{ display: tab === 'chat' ? 'block' : 'none' }}><Chat seed={seed} clearSeed={() => setSeed('')} /></div>
    </main></>);
}
