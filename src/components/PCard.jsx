import { chunk } from '../utils/puzzle';

export default function PCard({ p }) {
  return (
    <div style={{ flex: 1, border: '1px solid #ccc', padding: 12, background: '#f5f0e8', minWidth: 0 }}>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{p.num}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        {Array.from({ length: 7 }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: 5 }, (_, c) => (
              <div key={c} style={{ width: 42, height: 32, border: '1px solid #999', background: 'white', borderRadius: 2 }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.9, fontFamily: 'monospace' }}>
        {chunk(p.clues, 13).map((row, i) => (
          <div key={i}>
            {row.map((n, j) => (
              <span key={j}>{j > 0 ? ' ' : ''}{p.ul.has(n) ? <u><b>{n}</b></u> : n}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
