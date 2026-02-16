import fs from 'node:fs/promises';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

async function loadData(file) {
  const text = await fs.readFile(file, 'utf8');
  const jsonText = text
    .replace(/^\s*export default\s*/, '')
    .replace(/;\s*$/, '');
  return JSON.parse(jsonText);
}

const idioms = await loadData('static/data/idioms.js');
const life = await loadData('static/data/life_fixed.js');

const rows = [
  ...idioms.map((x) => ({ word_id: x.word_id, word: x.word, category: 'idiom' })),
  ...life.map((x) => ({ word_id: x.word_id, word: x.word, category: 'life' }))
];

const batchSize = 500;

for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/word_bank?on_conflict=word_id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(batch)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

console.log(`Imported ${rows.length} words.`);
