/*
 * Quadra Quest — confere os lances (node tools/validar-lances.js)
 * Verifica ligações, respostas, alvos, quem está com a bola, coordenadas e o tamanho das frases.
 */
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'lances.js'));
const L = window.QuadraQuestLances, ENDS = window.QuadraQuestEnds;
const ACTIONS = ['pass', 'advance', 'shoot', 'defend', 'mark', 'cover', 'return', 'position', 'kickin', 'corner', 'freeKick', 'wall', 'control', 'throw', 'press'];
const WITH_BALL = ['pass', 'shoot', 'kickin', 'corner', 'freeKick', 'throw'];
const ROLE_ID = { 'Goleiro': 'h-gk', 'Fixo': 'h-fixo', 'Ala': 'h-ala1', 'Pivô': 'h-pivo' };
const KEYS = ['gk', 'fixo', 'ala1', 'ala2', 'pivo'];
const PLAYERS = [...KEYS.map(k => 'h-' + k), ...KEYS.map(k => 'a-' + k)];
const MAX_WORDS = 7;
const errors = [], warns = [];
let paths = 0, nodes = 0;

for (const [role, lances] of Object.entries(L)) {
  if (!ROLE_ID[role]) errors.push(`posição desconhecida: ${role}`);
  for (const l of lances) {
    const where = id => `${role}/${l.id}/${id}`;
    if (!l.nodes[l.start]) errors.push(`${role}/${l.id}: start "${l.start}" não existe`);
    for (const [id, n] of Object.entries(l.nodes)) {
      nodes++;
      const w = where(id);
      if (!n.options || n.options.length !== 3) errors.push(`${w}: precisa de 3 opções`);
      n.options.forEach(o => { if (!ACTIONS.includes(o)) errors.push(`${w}: ação "${o}" não existe`); });
      if (!n.options.includes(n.answer)) errors.push(`${w}: a resposta "${n.answer}" não está nas opções`);
      if (!n.with && !n.ball) errors.push(`${w}: falta "with" ou "ball"`);
      if (n.with && !PLAYERS.includes(n.with)) errors.push(`${w}: with "${n.with}" inválido`);
      const me = (n.home || {})[ROLE_ID[role].slice(2)], loose = !n.with && n.ball && me && Math.hypot(me.x - n.ball.x, me.y - n.ball.y) < 90;
      if (WITH_BALL.includes(n.answer) && n.with !== ROLE_ID[role] && !loose) errors.push(`${w}: resposta "${n.answer}" mas a bola não está com a criança`);
      if (n.target === 'space' ? !n.cue : !(n.target === 'goal' || PLAYERS.includes(n.target))) errors.push(`${w}: alvo "${n.target}" inválido`);
      for (const team of ['home', 'away']) for (const [k, v] of Object.entries(n[team] || {})) {
        if (!KEYS.includes(k)) errors.push(`${w}: jogador "${k}" desconhecido`);
        if (v.x < 50 || v.x > 950 || v.y < 48 || v.y > 552) errors.push(`${w}: ${team}.${k} fora da quadra (${v.x},${v.y})`);
      }
      for (const b of [n.ok, n.fail]) {
        if (typeof b === 'string') { if (!l.nodes[b]) errors.push(`${w}: próxima "${b}" não existe`); }
        else if (!b || !ENDS[b.end]) errors.push(`${w}: fim inválido ${JSON.stringify(b)}`);
      }
      for (const f of ['line', 'easy', 'medium', 'hard', 'lesson', 'oops']) {
        if (!n[f]) { errors.push(`${w}: falta o texto "${f}"`); continue; }
        (n[f].match(/[^.!?]+[.!?]*/g) || []).forEach(sentence => {
          const words = sentence.trim().split(/\s+/).length;
          if (words > MAX_WORDS) warns.push(`${w}.${f}: frase com ${words} palavras: "${sentence.trim()}"`);
        });
      }
    }
    // percorre todos os caminhos: sem voltas e com 1 a 5 decisões
    const walk = (id, seen) => {
      if (seen.includes(id)) { errors.push(`${role}/${l.id}: o caminho volta para "${id}"`); return; }
      const n = l.nodes[id]; if (!n) return;
      for (const b of [n.ok, n.fail]) {
        if (typeof b === 'string') walk(b, [...seen, id]);
        else { paths++; if (seen.length + 1 > 5) warns.push(`${role}/${l.id}: caminho com ${seen.length + 1} decisões`); }
      }
    };
    walk(l.start, []);
    const reach = new Set(), stack = [l.start];
    while (stack.length) { const id = stack.pop(); if (reach.has(id) || !l.nodes[id]) continue; reach.add(id); const n = l.nodes[id]; [n.ok, n.fail].forEach(b => typeof b === 'string' && stack.push(b)); }
    Object.keys(l.nodes).filter(id => !reach.has(id)).forEach(id => warns.push(`${where(id)}: nunca é alcançado`));
  }
}
console.log(`${Object.keys(L).length} posições, ${Object.values(L).flat().length} lances, ${nodes} decisões, ${paths} caminhos`);
warns.forEach(x => console.log('aviso:', x));
errors.forEach(x => console.log('ERRO:', x));
process.exit(errors.length ? 1 : 0);
