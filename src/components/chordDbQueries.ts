// Sample queries against chord-db (github.com/jekrch/chord-db). The results
// are real rows from its views, copied from the app's exported data.

export interface SqlSample {
  id: string
  title: string
  sql: string
  columns: string[]
  rows: string[][]
}

export const chordDbQueries: SqlSample[] = [
  {
    id: "modes-of-d",
    title: "One key, seven modes",
    sql: `SELECT mode, mode_note_names
FROM mode_view
WHERE key_name = 'D'
  AND mode IN ('Ionian', 'Dorian',
    'Phrygian', 'Lydian', 'Mixolydian',
    'Aeolian', 'Locrian');`,
    columns: ["mode", "mode_note_names"],
    rows: [
      ["Ionian", "D, E, F#, G, A, B, C#"],
      ["Dorian", "D, E, F, G, A, B, C"],
      ["Phrygian", "D, Eb, F, G, A, Bb, C"],
      ["Lydian", "D, E, F#, G#, A, B, C#"],
      ["Mixolydian", "D, E, F#, G, A, B, C"],
      ["Aeolian", "D, E, F, G, A, Bb, C"],
      ["Locrian", "D, Eb, F, G, Ab, Bb, C"],
    ],
  },
  {
    id: "chords-on-g",
    title: "Chords on G that fit C major",
    sql: `SELECT chord_name, chord_note_names
FROM mode_scale_chord_relation_view
WHERE mode = 'Ionian'
  AND key_name = 'C'
  AND chord_note_name = 'G'
  AND mode_chord_note_diff_count = 0;`,
    columns: ["chord_name", "chord_note_names"],
    rows: [
      ["G", "G, B, D"],
      ["G6", "G, B, D, E"],
      ["G5", "G, D"],
      ["G7", "G, B, D, F"],
      ["G7sus4", "G, C, D, F"],
      ["G7/6", "G, B, D, E, F"],
      ["G7 add(4)", "G, B, C, D, F"],
      ["G7sus2", "G, A, D, F"],
      ["G9", "G, B, D, F, A"],
      ["G9sus4", "G, C, D, F, A"],
      ["G11", "G, B, D, F, A, C"],
      ["G13", "G, B, D, F, A, C, E"],
      ["G13#sus4", "G, A, C, D, E, F"],
      ["G6/9", "G, B, D, E, A"],
      ["Gadd(2)", "G, A, B, D"],
      ["Gadd(2) add(4)", "G, A, B, C, D"],
      ["Gadd(4)", "G, B, C, D"],
      ["Gadd(9)", "G, B, D, A"],
      ["Gsus2", "G, A, D"],
      ["Gsus4", "G, C, D"],
      ["Gsus2sus4", "G, A, C, D"],
    ],
  },
  {
    id: "scales-for-g7",
    title: "Which C scales hold a G7?",
    sql: `SELECT mode
FROM mode_scale_chord_relation_view
WHERE key_name = 'C'
  AND chord_name = 'G7'
  AND mode_chord_note_diff_count = 0;`,
    columns: ["mode"],
    rows: [
      ["Ionian"],
      ["Melodic Minor"],
      ["Harmonic Minor"],
      ["Bebop Major"],
      ["Bebop Dominant"],
      ["Bebop Minor"],
    ],
  },
]
