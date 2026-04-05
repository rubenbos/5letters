import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { makeTable, makePuzzle, chunk } from './utils/puzzle';
import PuzzlePDF from './pdf/PuzzlePDF';

const SANS = "'IBM Plex Sans', sans-serif";

// ── helpers ────────────────────────────────────────────────────────────────

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGroups(words) {
  let num = 1;
  return chunk(words.map(w => w.toUpperCase()), 4).map(groupWords => {
    const t = makeTable();
    return { table: t, puzzles: groupWords.map(w => makePuzzle(w, num++, t)) };
  });
}

/** Returns an error string, or null if valid */
function wordError(raw) {
  const w = raw.trim().toUpperCase();
  if (!w) return null; // empty lines silently ignored
  if (!/^[A-Z]+$/.test(w)) return 'alleen letters A–Z';
  if (w.length < 5) return `${w.length} letters — moet er 5 zijn`;
  if (w.length > 5) return `${w.length} letters — moet er 5 zijn`;
  if (new Set(w).size < 5) return 'bevat een dubbele letter';
  return null;
}

// ── shared button styles ────────────────────────────────────────────────────

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 26px',
        background: disabled ? '#d0d0d0' : '#111',
        color: disabled ? '#999' : '#fff',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14,
        fontFamily: SANS,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </button>
  );
}

// ── main ───────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode]           = useState('random');   // 'random' | 'custom'
  const [count, setCount]         = useState(8);          // 4 / 8 / 12 / 16
  const [customInput, setCustomInput] = useState('');
  const [groups, setGroups]       = useState(null);       // null = not yet generated
  const [wordBank, setWordBank]   = useState([]);
  const [bankErr, setBankErr]     = useState('');

  // Load word bank from public/words.txt on mount
  useEffect(() => {
    fetch('/words.txt')
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => {
        const words = text
          .split('\n')
          .map(w => w.trim().toUpperCase())
          .filter(w => w.length === 5 && /^[A-Z]+$/.test(w) && new Set(w).size === 5);
        setWordBank(words);
      })
      .catch(() => setBankErr('Woordenlijst kon niet geladen worden.'));
  }, []);

  // ── custom mode: live validation ─────────────────────────────────────────
  const customLines = customInput.split('\n');
  const customRows  = customLines.map(line => ({
    raw:   line,
    word:  line.trim().toUpperCase(),
    error: wordError(line),
    blank: !line.trim(),
  }));
  const validWords  = customRows.filter(r => !r.blank && !r.error).map(r => r.word);
  const hasErrors   = customRows.some(r => !r.blank && r.error);

  // ── generate ──────────────────────────────────────────────────────────────
  function generateRandom() {
    if (wordBank.length < count) return;
    setGroups(buildGroups(shuffled(wordBank).slice(0, count)));
    window.sa_event?.('generate_random', { words: count });
  }

  function generateCustom() {
    if (validWords.length === 0 || hasErrors) return;
    setGroups(buildGroups(validWords));
    window.sa_event?.('generate_custom', { words: validWords.length });
  }

  // Reset PDF when mode or inputs change
  function switchMode(m) { setMode(m); setGroups(null); }
  function changeCount(n) { setCount(n); setGroups(null); }

  const canGenerate = mode === 'random'
    ? wordBank.length >= count
    : validWords.length > 0 && !hasErrors;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: SANS }}>

      {/* ── photo (max 1200px, full bleed top) ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <picture>
          <source media="(max-width: 768px)" srcSet="/foto_mobile.jpg" />
          <img
            src="/foto.jpg"
            alt="5letters puzzelblad op een tafel"
            style={{ width: '100%', display: 'block' }}
          />
        </picture>
      </div>

      {/* ── content column (max 600px) ── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px 48px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 44, fontWeight: 600, letterSpacing: '-1px', lineHeight: 1 }}>
            5letters
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: '#888', fontStyle: 'italic', lineHeight: 1 }}>
            een papieren versie van het bekende woordspel
          </p>
        </div>
        <p style={{ margin: '0 0 48px', fontSize: 15, lineHeight: 1.8, color: '#222' }}>
          Offline woordpuzzels om uit te printen. Leuk voor in de klas, of om thuis
          zonder telefoon te kunnen puzzelen. Maak een downloadbare PDF met onze
          voorgeselecteerde woordenlijst of kies zelf welke woorden. Je kan de letters
          controleren met de codetabel.
        </p>

        {/* ── mode tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #eee', marginBottom: 28 }}>
          {[
            { key: 'random', label: 'Willekeurige woorden' },
            { key: 'custom', label: 'Eigen woordenlijst'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              style={{
                padding: '9px 18px',
                background: 'none',
                border: 'none',
                borderBottom: mode === key ? '2px solid #111' : '2px solid transparent',
                marginBottom: -1.5,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: SANS,
                fontWeight: mode === key ? 600 : 400,
                color: mode === key ? '#111' : '#aaa',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── random mode ── */}
        {mode === 'random' && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>
              Hoeveel woorden wil je in de PDF?
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {[4, 8, 12, 16].map(n => (
                <button
                  key={n}
                  onClick={() => changeCount(n)}
                  style={{
                    width: 52,
                    height: 44,
                    background: count === n ? '#111' : '#fff',
                    color:      count === n ? '#fff' : '#333',
                    border:     `1.5px solid ${count === n ? '#111' : '#ddd'}`,
                    cursor: 'pointer',
                    fontSize: 15,
                    fontFamily: SANS,
                    fontWeight: count === n ? 600 : 400,
                    transition: 'all 0.1s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {bankErr && <p style={{ color: '#c00', fontSize: 13, margin: '0 0 16px' }}>{bankErr}</p>}
          </div>
        )}

        {/* ── custom mode ── */}
        {mode === 'custom' && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#888', lineHeight: 1.6 }}>
              Zet elk woord op een nieuwe regel.
              Elk woord moet precies <strong>5 letters</strong> zijn en mag <strong>geen dubbele letters</strong> bevatten.
            </p>
            <textarea
              value={customInput}
              onChange={e => { setCustomInput(e.target.value); setGroups(null); }}
              rows={6}
              placeholder={'TAFEL\nBROEK\nGROEN\nVLIEG'}
              spellCheck={false}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: 14,
                border: '1.5px solid #ddd',
                padding: '10px 12px',
                background: '#fafafa',
                resize: 'vertical',
                lineHeight: 1.9,
                color: '#000',
                outline: 'none',
                boxSizing: 'border-box',
                borderRadius: 0,
              }}
            />

            {/* Per-word validation feedback */}
            {customRows.some(r => !r.blank) && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {customRows.filter(r => !r.blank).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5 }}>
                    <span style={{ color: r.error ? '#c00' : '#3a9' }}>{r.error ? '✗' : '✓'}</span>
                    <span style={{ color: '#333', minWidth: 70 }}>{r.word || r.raw.trim()}</span>
                    {r.error && <span style={{ color: '#c00' }}>{r.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── generate + download row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <PrimaryBtn
            onClick={mode === 'random' ? generateRandom : generateCustom}
            disabled={!canGenerate}
          >
            Genereer
          </PrimaryBtn>

          {groups && (
            <PDFDownloadLink
              document={<PuzzlePDF groups={groups} />}
              fileName="5letters-puzzels.pdf"
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  onClick={() => !loading && window.sa_event?.('download_pdf', { mode, words: mode === 'random' ? count : validWords.length })}
                  style={{
                    padding: '10px 28px',
                    background: loading ? '#bbb' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    fontSize: 14,
                    fontFamily: SANS,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}
                >
                  {loading ? 'PDF laden…' : '↓  Download PDF'}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>

      </div>{/* /content column */}

      {/* ── footer ── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', marginTop: 0 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '18px 24px 36px' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#ccc', fontFamily: SANS, lineHeight: 1.5 }}>
            <a href="https://potlood.app" style={{ color: '#bbb', textDecoration: 'none', fontWeight: 600 }}>potlood.app</a>
            {' · '}
            Offline, ad-free, kids-friendly stuff, by{' '}
            <a href="https://strook.blog" style={{ color: '#ccc', textDecorationColor: '#ddd' }}>
              Ruben Bos
            </a>.
          </p>
        </div>
      </footer>

    </div>
  );
}
