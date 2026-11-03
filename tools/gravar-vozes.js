/*
 * Quadra Quest — grava a narração do técnico com uma voz neural (Microsoft Edge TTS).
 * Uso (na pasta do projeto, com o pacote msedge-tts instalado em algum node_modules):
 *   node tools/gravar-vozes.js [--voz pt-BR-ThalitaMultilingualNeural] [--so-listar]
 * Gera voice/*.mp3 e voice/clips.js (mapa frase → arquivo). Frases já gravadas são puladas,
 * então dá para rodar de novo depois de mudar textos em lances.js ou index.html.
 * A internet só é usada aqui, na gravação; o jogo toca os arquivos offline.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'voice');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VOICE = arg('--voz', 'pt-BR-ThalitaMultilingualNeural');
const PROSODY = { rate: '-6%', pitch: '+3%' };

// mesmas regras do speak() do jogo: o texto é falado frase por frase
const norm = t => t.replace(/\s+/g, ' ').trim();
const sentences = t => (t.match(/[^.!?]+[.!?]*/g) || [t]).map(norm).filter(Boolean);
const hash = s => { let h = 0x811c9dc5; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

global.window = {};
require(path.join(ROOT, 'lances.js'));
const lances = window.QuadraQuestLances, ends = window.QuadraQuestEnds;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const roles = eval('(' + html.match(/const roles=(\{[^}]*\})/)[1] + ')');

const texts = new Set();
const add = t => sentences(t).forEach(s => texts.add(s));
// falas fixas do index.html (textos entre aspas simples dentro de speak/autoAdvance)
for (const m of html.matchAll(/(?:speak|autoAdvance)\('([^']+)'\)/g)) add(m[1]);
['Agora você vê como o jogador!', 'Agora você vê todos na quadra!', 'Aí sim!', 'Opa!', 'O tempo acabou!', 'Novo lance!', 'Mandou bem!',
 'Mais tempo e eu vou te ajudar!', 'Um pouquinho mais rápido!', 'Agora é pra pensar rápido!', 'Desafio de craque! Você consegue!',
 'Fácil!', 'Médio!', 'Difícil!', 'Craque!', 'Agora escolha o desafio.'].forEach(add);
for (const [role, text] of Object.entries(roles)) { add(`${role}! ${text}`); add(`Legal! Você é ${role}.`); }
for (const e of Object.values(ends)) add(e.text);
for (const list of Object.values(lances)) for (const l of list) for (const n of Object.values(l.nodes))
  [n.line, n.easy, n.medium, n.hard, n.lesson, n.oops].filter(Boolean).forEach(add);
for (let n = 1; n <= 30; n++) add(`Nível ${n} concluído!`);
for (let h = 0; h <= 6; h++) for (let a = 0; a <= 6; a++) add(`Placar: ${h} a ${a}.`);

const all = [...texts].sort();
console.log(all.length + ' frases');
if (process.argv.includes('--so-listar')) { console.log(all.join('\n')); process.exit(0); }

(async () => {
  const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
  fs.mkdirSync(OUT, { recursive: true });
  const clips = {};
  let tts = null, done = 0, made = 0;
  const connect = async () => { tts = new MsEdgeTTS(); await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3); };
  const synth = text => new Promise((resolve, reject) => {
    const { audioStream } = tts.toStream(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), PROSODY);
    const chunks = []; const timer = setTimeout(() => reject(new Error('timeout')), 20000);
    audioStream.on('data', c => chunks.push(c));
    audioStream.on('close', () => { clearTimeout(timer); resolve(Buffer.concat(chunks)); });
    audioStream.on('error', e => { clearTimeout(timer); reject(e); });
  });
  for (const text of all) {
    const file = hash(VOICE + '|' + text) + '.mp3', full = path.join(OUT, file);
    if (!fs.existsSync(full)) {
      for (let attempt = 1; ; attempt++) {
        try { if (!tts) await connect(); const buf = await synth(text); if (buf.length < 800) throw new Error('áudio vazio'); fs.writeFileSync(full, buf); made++; break; }
        catch (e) { tts = null; if (attempt >= 4) { console.error('FALHOU:', text, e.message); break; } await new Promise(r => setTimeout(r, 1500 * attempt)); }
      }
    }
    if (fs.existsSync(full)) clips[text] = 'voice/' + file;
    if (++done % 25 === 0) console.log(done + '/' + all.length);
  }
  const header = `/* Gerado por tools/gravar-vozes.js — voz ${VOICE}. Não edite à mão. */\n`;
  fs.writeFileSync(path.join(OUT, 'clips.js'), header + 'window.QQVoiceClips=' + JSON.stringify(clips, null, 0) + ';\n');
  // remove gravações que não são mais usadas
  const keep = new Set(Object.values(clips).map(f => path.basename(f)));
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.mp3') && !keep.has(f)) fs.unlinkSync(path.join(OUT, f));
  console.log(`pronto: ${Object.keys(clips).length}/${all.length} frases (${made} novas)`);
  process.exit(0);
})();
