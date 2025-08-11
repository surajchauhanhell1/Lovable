'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'url' | 'scrape' | 'generate' | 'run' | 'prompt' | 'apply' | 'preview';

const cardCls =
  'relative rounded-xl border border-zinc-200 bg-white/90 backdrop-blur-sm shadow-sm p-3 overflow-hidden';

const steps: { key: Step; title: string; subtitle: string }[] = [
  { key: 'url', title: 'Paste URL', subtitle: 'We prep the target site' },
  { key: 'scrape', title: 'Scrape', subtitle: 'Extract content fast (cached)' },
  { key: 'generate', title: 'Generate Code', subtitle: 'Clean React + Vite' },
  { key: 'run', title: 'Run', subtitle: 'Dev server boots' },
  { key: 'prompt', title: 'Ask AI to tweak', subtitle: 'Example: hero color' },
  { key: 'apply', title: 'Apply Edit', subtitle: 'Changes patched safely' },
  { key: 'preview', title: 'Preview', subtitle: 'Live and editable' },
];

export default function DemoFlow() {
  const [idx, setIdx] = useState(0);
  const step = steps[idx].key;

  useEffect(() => {
    // Slow the pace a bit so it's readable
    const id = setInterval(() => setIdx((i) => (i + 1) % steps.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl select-none">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-500 justify-center">
        {steps.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 w-8 rounded-full transition-colors ${i === idx ? 'bg-emerald-500' : 'bg-zinc-200'}`}
            aria-label={i === idx ? `${s.title} (active)` : s.title}
          />
        ))}
      </div>

      <motion.div className={cardCls} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[13px] font-semibold text-zinc-800">{steps[idx].title}</div>
            <div className="text-[11px] text-zinc-500">{steps[idx].subtitle}</div>
          </div>
          <span className="inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Now</span>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'url' && (
              <Fade key="url">
                <UrlTyping />
              </Fade>
            )}
            {step === 'scrape' && (
              <Fade key="scrape">
                <ScrapeProgress />
              </Fade>
            )}
            {step === 'generate' && (
              <Fade key="generate">
                <CodeTyping />
              </Fade>
            )}
            {step === 'run' && (
              <Fade key="run">
                <RunLogs />
              </Fade>
            )}
            {step === 'prompt' && (
              <Fade key="prompt">
                <PromptTyping />
              </Fade>
            )}
            {step === 'apply' && (
              <Fade key="apply">
                <CodePatch />
              </Fade>
            )}
            {step === 'preview' && (
              <Fade key="preview">
                <PreviewMini />
              </Fade>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Fade({ children, key: k }: { children: React.ReactNode; key?: string }) {
  return (
    <motion.div
      key={k}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="p-3"
    >
      {children}
    </motion.div>
  );
}

function UrlTyping() {
  const [text, setText] = useState('');
  useEffect(() => {
    const target = 'https://example.com';
    let i = 0;
    setText('');
    const id = setInterval(() => {
      i += 1;
      setText(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div className="relative">
        <input
          readOnly
          value={text}
          placeholder="https://your-site.com"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-mono text-zinc-800 focus:outline-none"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">URL</span>
      </div>
    </div>
  );
}

function ScrapeProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    setP(0);
    const id = setInterval(() => setP((x) => (x >= 100 ? 100 : x + 8)), 110);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-lime-400" style={{ width: `${p}%`, transition: 'width 180ms ease-out' }} />
      </div>
      <div className="mt-2 text-[11px] text-zinc-500">Extracting HTML, metadata, and images…</div>
    </div>
  );
}

function CodeTyping() {
  const code = `export default function Hero() {\n  return (\n    <section className=\"p-8\">\n      <h1 className=\"text-3xl font-bold\">Hello world</h1>\n      <p className=\"text-zinc-500\">Generated by AI</p>\n    </section>\n  );\n}`;
  const [len, setLen] = useState(0);
  useEffect(() => {
    setLen(0);
    const id = setInterval(() => setLen((x) => Math.min(code.length, x + 2)), 18);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-md p-2">
      <pre className="text-[11px] leading-5 whitespace-pre-wrap font-mono">{code.slice(0, len)}</pre>
    </div>
  );
}

function RunLogs() {
  const logs = [
    '[vite] starting dev server…',
    '[vite] compiling…',
    '[plugin] extracting routes…',
    '[vite] ready — http://localhost:5173',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => setI((x) => Math.min(logs.length, x + 1)), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-zinc-950 text-zinc-200 rounded-md p-2">
      <div className="text-[11px] font-mono space-y-1">
        {logs.slice(0, i).map((l, idx) => (
          <div key={idx} className="text-zinc-300">{l}</div>
        ))}
      </div>
    </div>
  );
}

function PromptTyping() {
  const [text, setText] = useState('');
  useEffect(() => {
    const target = 'Change hero background to blue → purple gradient';
    let i = 0;
    setText('');
    const id = setInterval(() => {
      i += 1;
      setText(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-md p-2">
      <div className="text-[11px] text-zinc-500 mb-1">Prompt</div>
      <div className="text-[12px] font-mono text-zinc-800">{text}<span className="inline-block w-2 h-3 bg-emerald-400 ml-1 animate-pulse" /></div>
    </div>
  );
}

function CodePatch() {
  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-md p-2 text-[11px] font-mono leading-5">
      <div className="text-zinc-400 mb-1">Applying edit…</div>
      <pre>
<span style={{color:'#22c55e'}}>{'+  <section className="p-8 bg-gradient-to-r from-blue-500 to-purple-500">'}</span>{'\n'}
<span style={{color:'#ef4444'}}>{'-  <section className="p-8">'}</span>
      </pre>
    </div>
  );
}

function PreviewMini() {
  return (
    <div className="rounded-md border border-zinc-200 overflow-hidden">
      <div className="h-6 bg-zinc-100 border-b border-zinc-200 flex items-center gap-1 px-2">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="ml-2 text-[10px] text-zinc-500 truncate">http://localhost:5173</div>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <div className="h-14 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
        <div className="h-14 rounded bg-zinc-100" />
        <div className="h-14 rounded bg-zinc-100" />
      </div>
    </div>
  );
}


