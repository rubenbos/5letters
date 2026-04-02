import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { chunk, ABC_STR } from '../utils/puzzle';

// A4 = 595×842pt, padding 20pt → bruikbaar 555×802pt
// Codetabel breedte: 2×(16+5×24+16) + 8spacer + 16padding + 2border ≈ 330pt
// Uitlegvak: 555 - 330 - 8gap = 217pt

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#f5f0e8',
    fontFamily: 'Times-Roman',
    fontSize: 9,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardSpacer: { width: 8 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
    padding: 8,
    backgroundColor: 'white',
  },
  cardNum: {
    textAlign: 'center',
    fontFamily: 'Times-Bold',
    fontSize: 13,
    marginBottom: 6,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cell: {
    width: 42,
    height: 22,
    borderWidth: 0.75,
    borderColor: '#999',
    borderStyle: 'solid',
    backgroundColor: 'white',
    borderRadius: 1,
    marginRight: 3,
  },
  cluesContainer: {
    alignItems: 'center',
  },
  clueRow: {
    fontFamily: 'Courier',
    fontSize: 8,
    lineHeight: 1.7,
    textAlign: 'center',
  },
  clueNormal: {
    fontFamily: 'Courier',
    fontSize: 8,
  },
  clueKeyword: {
    fontFamily: 'Courier-Bold',
    fontSize: 8,
    textDecoration: 'underline',
  },

  // Onderste sectie: codetabel + uitleg naast elkaar
  bottomRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'stretch',
  },
  tableSection: {
    flexShrink: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
    padding: 8,
  },
  tableTitle: {
    textAlign: 'center',
    fontSize: 7,
    color: '#888',
    marginBottom: 3,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableSpacer: { width: 8 },
  tableLetterCell: {
    width: 16,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: '#333',
    color: 'white',
    fontFamily: 'Courier-Bold',
    fontSize: 7,
    textAlign: 'center',
  },
  tableNumCell: {
    width: 24,
    paddingTop: 1,
    paddingBottom: 1,
    textAlign: 'center',
    fontFamily: 'Courier',
    fontSize: 7,
  },

  // Uitlegvak
  explBox: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
    padding: 8,
  },
  explHeading: {
    fontFamily: 'Times-Bold',
    fontSize: 9,
    marginBottom: 5,
  },
  explIntro: {
    fontSize: 7,
    lineHeight: 1.45,
    marginBottom: 6,
  },
  explStep: {
    fontSize: 7,
    lineHeight: 1.5,
    marginBottom: 3,
  },
  explBoldUnderline: {
    fontFamily: 'Courier-Bold',
    fontSize: 7,
    textDecoration: 'underline',
  },
});

function PCardPDF({ p }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardNum}>{p.num}</Text>
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        {Array.from({ length: 7 }, (_, r) => (
          <View key={r} style={styles.gridRow}>
            {Array.from({ length: 5 }, (_, c) => (
              <View key={c} style={styles.cell} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.cluesContainer}>
        {chunk(p.clues, 13).map((row, i) => (
          <Text key={i} style={styles.clueRow}>
            {row.map((n, j) => (
              <Text key={j} style={p.ul.has(n) ? styles.clueKeyword : styles.clueNormal}>
                {j > 0 ? ' ' : ''}{n}
              </Text>
            ))}
          </Text>
        ))}
      </View>
    </View>
  );
}

function CodeTable({ table }) {
  return (
    <View style={styles.tableSection}>
      <Text style={styles.tableTitle}>CODETABEL</Text>
      {Array.from({ length: 13 }, (_, i) => {
        const l1 = ABC_STR[i], l2 = ABC_STR[i + 13];
        const bg = i % 2 === 0 ? '#f5f0e8' : 'white';
        return (
          <View key={i} style={[styles.tableRow, { backgroundColor: bg }]}>
            <Text style={styles.tableLetterCell}>{l1}</Text>
            {table[l1].map((n, j) => <Text key={j} style={styles.tableNumCell}>{n}</Text>)}
            <Text style={styles.tableLetterCell}>{l1}</Text>
            <View style={styles.tableSpacer} />
            <Text style={styles.tableLetterCell}>{l2}</Text>
            {table[l2].map((n, j) => <Text key={j} style={styles.tableNumCell}>{n}</Text>)}
            <Text style={styles.tableLetterCell}>{l2}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ExplanationBox() {
  return (
    <View style={styles.explBox}>
      <Text style={styles.explHeading}>Hoe werkt de puzzel?</Text>
      <Text style={styles.explIntro}>
        Elk woord bestaat uit 5 verschillende letters, letters komen nooit 2x voor in hetzelfde woord. Raad het woord in maximaal 7 beurten.
      </Text>
      <Text style={styles.explStep}>1)  Vul een woord in.</Text>
      <Text style={styles.explStep}>2)  Zoek de letter op in de codetabel.</Text>
      <Text style={styles.explStep}>3)  Als de letter in het 3e vakje stond, kijk je ook in de tabel naar het 3e getal.</Text>
      <Text style={styles.explStep}>4)  Staat het getal onder de puzzel? Dan zit die letter in het woord. Omcirkel hem.</Text>
      <Text style={styles.explStep}>
        {'5)  Is het getal '}
        <Text style={styles.explBoldUnderline}>dikgedrukt en onderstreept</Text>
        {'? Dan staat hij al op de goede plek!'}
      </Text>
    </View>
  );
}

export default function PuzzlePDF({ groups }) {
  return (
    <Document>
      {groups.map((group, gi) => (
        <Page key={gi} size="A4" style={styles.page}>
          {chunk(group.puzzles, 2).map((pair, ri) => (
            <View key={ri} style={styles.cardsRow}>
              <PCardPDF p={pair[0]} />
              {pair[1]
                ? <><View style={styles.cardSpacer} /><PCardPDF p={pair[1]} /></>
                : <><View style={styles.cardSpacer} /><View style={{ flex: 1 }} /></>
              }
            </View>
          ))}
          <View style={styles.bottomRow} wrap={false}>
            <CodeTable table={group.table} />
            <ExplanationBox />
          </View>
        </Page>
      ))}
    </Document>
  );
}
