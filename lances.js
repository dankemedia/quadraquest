/*
 * Quadra Quest — lances encadeados
 * Coordenadas da quadra: 1000 × 600. Seu time ataca para a direita (gol rival em x≈950).
 *
 * Cada posição tem lances. Um lance é uma sequência de decisões ligadas:
 *   start: primeira decisão
 *   nodes: { id: decisão }
 * Cada decisão:
 *   with: quem está com a bola (ex.: 'h-pivo', 'a-fixo')  ou  ball: {x,y} (bola solta/parada)
 *   home / away: jogadores que mudaram de lugar (gk, fixo, ala1, ala2, pivo). Quem não aparece
 *                continua onde estava na decisão anterior — por isso a jogada tem continuidade.
 *   options: 3 ações (veja actionBook no index.html), answer: a ação certa
 *   target: para onde a dica aponta ('h-pivo', 'goal' ou 'space' com cue:{x,y})
 *   line + easy/medium/hard: fala do técnico (dica conforme a dificuldade)
 *   lesson: explicação quando acerta · oops: o que aconteceu quando erra
 *   ok / fail: próxima decisão (id) ou fim do lance {end:'goal'|'keep'|'safe'|'conceded'|'lost'|'saved'}
 * A criança sempre joga na posição que escolheu, com ou sem a bola.
 */
(function(){
const P=(x,y)=>({x,y});

// fim de cada lance: o que o técnico fala e o selo que aparece
window.QuadraQuestEnds={
 goal:{text:'Gol do seu time!',badge:'⚽ GOOOL!',score:'home',good:true},
 keep:{text:'A bola é nossa!',badge:'⭐ BOLA NOSSA!',good:true},
 safe:{text:'Boa defesa!',badge:'🧤 DEFENDEU!',good:true},
 saved:{text:'O goleiro pegou. Foi quase!',badge:'😮 QUASE!',good:false},
 lost:{text:'A bola ficou com o rival.',badge:'🔄 BOLA DO RIVAL',good:false},
 conceded:{text:'Gol do rival. Tudo bem!',badge:'😅 GOL DO RIVAL',score:'away',good:false}
};

window.QuadraQuestLances={
/* ======================= GOLEIRO ======================= */
"Goleiro":[
 {id:'g1',title:'Passe pro fixo',start:'n1',nodes:{
  n1:{title:'Começar o jogo',with:'h-gk',home:{gk:P(100,300),fixo:P(255,265)},away:{pivo:P(470,330),ala1:P(600,180),ala2:P(600,420)},
   options:['pass','advance','defend'],answer:'pass',target:'h-fixo',
   line:'A bola é sua!',easy:'Passe para o fixo!',medium:'Quem está livre?',hard:'Comece o jogo.',
   lesson:'O goleiro também passa a bola.',oops:'O gol ficou vazio.',ok:'n2',fail:'rec'},
  n2:{title:'Voltar pro gol',with:'h-fixo',home:{gk:P(140,330),fixo:P(300,265)},away:{pivo:P(370,290)},
   options:['position','advance','press'],answer:'position',target:'space',cue:P(85,300),
   line:'O fixo pegou a bola.',easy:'Volte para o gol!',medium:'Onde você fica?',hard:'Cuide do gol.',
   lesson:'Sem a bola, fique no gol.',oops:'O gol ficou aberto.',ok:'n3',fail:'rec'},
  n3:{title:'Trocar de lado',with:'h-gk',home:{gk:P(95,300),fixo:P(230,240),ala1:P(430,170),ala2:P(440,460)},away:{pivo:P(240,330),ala1:P(460,205)},
   options:['pass','advance','defend'],answer:'pass',target:'h-ala2',
   line:'A bola voltou para você.',easy:'Passe para o outro lado!',medium:'Qual lado está livre?',hard:'Fuja do rival.',
   lesson:'Troque o lado da bola.',oops:'O rival chegou perto.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Defesa!',with:'a-pivo',home:{gk:P(95,300),fixo:P(260,250)},away:{pivo:P(205,330)},
   options:['defend','advance','pass'],answer:'defend',target:'a-pivo',
   line:'O rival pegou a bola!',easy:'Defenda o gol!',medium:'Pegue a bola!',hard:'Pare o chute.',
   lesson:'Fique na frente da bola.',oops:'O gol ficou aberto.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'g2',title:'Defender e jogar',start:'n1',nodes:{
  n1:{title:'Chute do rival',with:'a-fixo',home:{gk:P(90,300),fixo:P(300,340),ala1:P(470,140),ala2:P(430,450),pivo:P(560,300)},away:{fixo:P(380,300),pivo:P(260,240)},
   options:['defend','advance','position'],answer:'defend',target:'a-fixo',
   line:'O rival vai chutar!',easy:'Defenda!',medium:'Fique firme!',hard:'Pegue o chute.',
   lesson:'Fique atrás da bola.',oops:'A bola passou.',ok:'n2',fail:{end:'conceded'}},
  n2:{title:'Jogar com a mão',with:'h-gk',home:{gk:P(100,300),ala1:P(560,130)},away:{ala1:P(470,250),pivo:P(280,260)},
   options:['throw','advance','defend'],answer:'throw',target:'h-ala1',
   line:'Você pegou a bola!',easy:'Jogue com a mão para o ala!',medium:'Quem está lá na frente?',hard:'Jogue rápido.',
   lesson:'O goleiro pode jogar com a mão.',oops:'O rival voltou.',ok:'n3',fail:'rec'},
  n3:{title:'Atento no gol',with:'h-ala1',home:{gk:P(110,300),ala1:P(700,150),pivo:P(720,330)},away:{fixo:P(780,250),ala1:P(640,200)},
   options:['position','advance','press'],answer:'position',target:'space',cue:P(155,300),
   line:'Seu time está no ataque!',easy:'Fique perto do gol!',medium:'Onde você fica?',hard:'Fique pronto.',
   lesson:'O goleiro sempre fica atento.',oops:'O gol ficou longe.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival no ataque',with:'a-ala1',home:{gk:P(100,300),fixo:P(330,320)},away:{ala1:P(300,200)},
   options:['defend','advance','throw'],answer:'defend',target:'a-ala1',
   line:'O rival vem rápido!',easy:'Defenda o gol!',medium:'Fique na frente!',hard:'Pare o rival.',
   lesson:'Bom lugar, boa defesa.',oops:'O gol ficou aberto.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'g3',title:'Cara a cara',start:'n1',nodes:{
  n1:{title:'Rival sozinho',with:'a-pivo',home:{gk:P(90,300),fixo:P(380,340)},away:{pivo:P(270,320)},
   options:['defend','advance','position'],answer:'defend',target:'a-pivo',
   line:'O rival vem sozinho!',easy:'Fique na frente dele!',medium:'Feche o gol!',hard:'Ganhe do rival.',
   lesson:'Fique na frente do rival.',oops:'Você ficou longe.',ok:'n2',fail:{end:'conceded'}},
  n2:{title:'Passe rápido',with:'h-gk',home:{gk:P(110,300),fixo:P(250,235)},away:{pivo:P(175,345)},
   options:['pass','advance','defend'],answer:'pass',target:'h-fixo',
   line:'Você pegou a bola!',easy:'Passe rápido para o fixo!',medium:'Não espere!',hard:'Jogue rápido.',
   lesson:'O goleiro solta a bola rápido.',oops:'O rival pegou a bola.',ok:'n3',fail:'rec'},
  n3:{title:'Fixo com a bola',with:'h-fixo',home:{fixo:P(290,240),ala1:P(440,150)},away:{pivo:P(335,285)},
   options:['position','advance','press'],answer:'position',target:'space',cue:P(85,300),
   line:'O fixo está com a bola.',easy:'Volte para o gol!',medium:'Onde você fica?',hard:'Cuide do gol.',
   lesson:'Depois do passe, volte ao gol.',oops:'O gol ficou aberto.',ok:{end:'keep'},fail:'rec'},
  rec:{title:'Bola nossa',with:'a-pivo',home:{gk:P(120,300)},away:{pivo:P(200,330)},
   options:['defend','advance','pass'],answer:'defend',target:'a-pivo',
   line:'O rival pegou a bola!',easy:'Defenda!',medium:'Fique na frente!',hard:'Salve o time!',
   lesson:'Nunca desista!',oops:'A bola passou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'g4',title:'Escanteio do rival',start:'n1',nodes:{
  n1:{title:'Bola na área',ball:P(62,58),home:{gk:P(95,300),fixo:P(165,325),ala1:P(260,200),ala2:P(300,400),pivo:P(420,300)},away:{ala1:P(70,70),pivo:P(150,270),fixo:P(250,250),ala2:P(330,450)},
   options:['defend','advance','pass'],answer:'defend',target:'a-pivo',
   line:'Escanteio do rival!',easy:'Pegue a bola no alto!',medium:'Cuide da área!',hard:'Olhe a bola.',
   lesson:'Na área, use as mãos.',oops:'O rival pegou a bola.',ok:'n2',fail:{end:'conceded'}},
  n2:{title:'Ataque rápido',with:'h-gk',home:{gk:P(110,290),pivo:P(600,300)},away:{pivo:P(170,280),ala1:P(150,130)},
   options:['throw','pass','defend'],answer:'throw',target:'h-pivo',
   line:'Você pegou!',easy:'Jogue para o pivô!',medium:'Quem está lá longe?',hard:'Jogue rápido.',
   lesson:'Lá na frente tem espaço.',oops:'O rival voltou.',ok:'n3',fail:'rec'},
  n3:{title:'Voltar pro gol',with:'h-pivo',home:{gk:P(135,300),pivo:P(760,300)},away:{fixo:P(660,280)},
   options:['position','advance','press'],answer:'position',target:'space',cue:P(88,300),
   line:'O pivô está sozinho!',easy:'Volte para o gol!',medium:'Onde você fica?',hard:'Fique pronto.',
   lesson:'Depois de jogar, volte ao gol.',oops:'O gol ficou vazio.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival de novo',with:'a-ala1',home:{gk:P(110,300)},away:{ala1:P(220,230)},
   options:['defend','advance','throw'],answer:'defend',target:'a-ala1',
   line:'O rival pegou de novo!',easy:'Defenda o gol!',medium:'Fique na frente!',hard:'Salve o time!',
   lesson:'Fique pronto até o fim.',oops:'A bola passou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'g5',title:'Chute de longe',start:'n1',nodes:{
  n1:{title:'Chute de longe',with:'a-fixo',home:{gk:P(90,300),fixo:P(330,365)},away:{fixo:P(420,300),pivo:P(250,230)},
   options:['defend','advance','position'],answer:'defend',target:'a-fixo',
   line:'O rival chutou de longe!',easy:'Defenda!',medium:'Pegue o chute!',hard:'Fique firme.',
   lesson:'Fique no meio do gol.',oops:'A bola passou.',ok:'n2',fail:{end:'conceded'}},
  n2:{title:'Bola solta',ball:P(185,335),home:{gk:P(100,300),fixo:P(300,385)},away:{pivo:P(265,250)},
   options:['advance','defend','position'],answer:'advance',target:'space',cue:P(175,335),
   line:'A bola ficou solta!',easy:'Corra e pegue a bola!',medium:'Chegue antes!',hard:'Pegue a bola.',
   lesson:'Bola solta? Corra e pegue!',oops:'O rival chegou antes.',ok:'n3',fail:'rec'},
  n3:{title:'Passe rápido',with:'h-gk',home:{gk:P(170,330),ala2:P(460,460)},away:{pivo:P(235,275)},
   options:['pass','advance','defend'],answer:'pass',target:'h-ala2',
   line:'A bola é sua!',easy:'Passe para o ala!',medium:'Quem está livre?',hard:'Comece o jogo.',
   lesson:'Ache um amigo livre.',oops:'Você saiu do gol.',ok:{end:'keep'},fail:'rec'},
  rec:{title:'Perigo!',with:'a-pivo',home:{gk:P(150,320)},away:{pivo:P(205,295)},
   options:['defend','advance','pass'],answer:'defend',target:'a-pivo',
   line:'O rival está perto do gol!',easy:'Defenda!',medium:'Fique na frente!',hard:'Salve o time!',
   lesson:'Seja rápido e corajoso.',oops:'O gol ficou vazio.',ok:{end:'safe'},fail:{end:'conceded'}}
 }}
],

/* ======================= FIXO ======================= */
"Fixo":[
 {id:'f1',title:'Jogo pelo lado',start:'n1',nodes:{
  n1:{title:'Começar o jogo',with:'h-fixo',home:{fixo:P(270,300)},away:{pivo:P(400,320),ala1:P(600,200),ala2:P(600,420)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-ala1',
   line:'A bola é sua.',easy:'Passe para o ala!',medium:'Quem está livre?',hard:'Comece o jogo.',
   lesson:'O fixo faz passes seguros.',oops:'Você perdeu a bola.',ok:'n2',fail:'rec'},
  n2:{title:'Ajudar o ala',with:'h-ala1',home:{ala1:P(470,150)},away:{ala1:P(520,180),pivo:P(380,300)},
   options:['position','advance','mark'],answer:'position',target:'space',cue:P(340,220),
   line:'O rival marca o ala.',easy:'Chegue perto do ala!',medium:'Como você ajuda?',hard:'Ajude o amigo.',
   lesson:'Fique perto para ajudar.',oops:'O ala ficou sozinho.',ok:'n3',fail:'rec'},
  n3:{title:'Trocar de lado',with:'h-fixo',home:{fixo:P(340,220),ala1:P(470,140),ala2:P(480,450)},away:{pivo:P(400,265),ala2:P(620,400)},
   options:['pass','shoot','advance'],answer:'pass',target:'h-ala2',
   line:'A bola voltou para você.',easy:'Passe para o outro lado!',medium:'Qual lado está livre?',hard:'Troque o lado.',
   lesson:'Troque o lado da bola.',oops:'O rival pegou a bola.',ok:'n4',fail:'rec'},
  n4:{title:'Cuidar de trás',with:'h-ala2',home:{ala2:P(580,440),pivo:P(700,320)},away:{ala2:P(640,420)},
   options:['cover','advance','press'],answer:'cover',target:'space',cue:P(330,300),
   line:'O ala foi para a frente.',easy:'Fique atrás, no meio!',medium:'Quem cuida da defesa?',hard:'Cuide de trás.',
   lesson:'O fixo cuida de trás.',oops:'Ninguém ficou atrás.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival no ataque',with:'a-pivo',home:{fixo:P(290,250)},away:{pivo:P(370,310)},
   options:['mark','return','shoot'],answer:'mark',target:'a-pivo',
   line:'O rival vem pelo meio!',easy:'Marque o rival!',medium:'Quem você marca?',hard:'Pare o rival.',
   lesson:'Fique entre o rival e o gol.',oops:'O rival passou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'f2',title:'Marcar o pivô',start:'n1',nodes:{
  n1:{title:'Pivô rival',with:'a-fixo',home:{fixo:P(270,240),pivo:P(560,320),ala1:P(450,180),ala2:P(450,420)},away:{fixo:P(600,300),pivo:P(340,300)},
   options:['mark','press','advance'],answer:'mark',target:'a-pivo',
   line:'O rival quer passar.',easy:'Fique perto do pivô rival!',medium:'Quem é o perigo?',hard:'Marque bem.',
   lesson:'Marque o pivô de perto.',oops:'O pivô ficou livre.',ok:'n2',fail:'rec'},
  n2:{title:'Pegar o passe',ball:P(440,300),home:{fixo:P(305,270)},away:{pivo:P(330,305),fixo:P(560,300)},
   options:['control','return','shoot'],answer:'control',target:'space',cue:P(400,300),
   line:'A bola vem para o rival!',easy:'Entre na frente e pegue!',medium:'Dá para pegar?',hard:'Chegue antes.',
   lesson:'Chegue antes do rival.',oops:'O rival pegou a bola.',ok:'n3',fail:'rec'},
  n3:{title:'Ataque rápido',with:'h-fixo',home:{fixo:P(400,300),ala2:P(530,455)},away:{pivo:P(350,330)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-ala2',
   line:'Você pegou a bola!',easy:'Passe para o ala!',medium:'Quem está na frente?',hard:'Jogue rápido!',
   lesson:'Pegou? Passe rápido!',oops:'O rival voltou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival virou',with:'a-pivo',home:{fixo:P(340,270)},away:{pivo:P(290,320)},
   options:['return','advance','shoot'],answer:'return',target:'space',cue:P(215,310),
   line:'O pivô rival virou!',easy:'Volte para perto do gol!',medium:'Cuide do gol!',hard:'Volte rápido.',
   lesson:'Volte para ajudar o goleiro.',oops:'O rival chutou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'f3',title:'Ajudar o amigo',start:'n1',nodes:{
  n1:{title:'Ajudar o amigo',with:'a-ala2',home:{fixo:P(280,320),ala2:P(480,460)},away:{ala2:P(400,470),pivo:P(450,300)},
   options:['cover','mark','advance'],answer:'cover',target:'space',cue:P(340,430),
   line:'O rival passou pelo amigo!',easy:'Feche o lado!',medium:'Quem ajuda o amigo?',hard:'Ajude o amigo.',
   lesson:'O fixo ajuda o amigo.',oops:'O rival passou.',ok:'n2',fail:'rec'},
  n2:{title:'Bola nossa',with:'h-fixo',home:{fixo:P(340,430),pivo:P(620,300)},away:{ala2:P(385,470),fixo:P(700,300)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-pivo',
   line:'Você pegou a bola!',easy:'Passe para o pivô!',medium:'Quem está livre?',hard:'Ache o passe.',
   lesson:'Um passe longo vai rápido.',oops:'Ninguém ficou atrás.',ok:'n3',fail:'rec'},
  n3:{title:'Ficar atrás',with:'h-pivo',home:{pivo:P(680,300)},away:{pivo:P(420,300),fixo:P(720,300)},
   options:['position','advance','press'],answer:'position',target:'space',cue:P(330,300),
   line:'O pivô pegou a bola.',easy:'Fique no meio, atrás!',medium:'Onde você fica?',hard:'Cuide de trás.',
   lesson:'O fixo fica no meio.',oops:'O rival ficou livre.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Perigo!',with:'a-ala2',home:{fixo:P(300,380)},away:{ala2:P(210,420)},
   options:['mark','return','shoot'],answer:'mark',target:'a-ala2',
   line:'O rival está perto do gol!',easy:'Marque o rival!',medium:'Quem você marca?',hard:'Pare o chute.',
   lesson:'Perto do gol, marque de perto.',oops:'O rival chutou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'f4',title:'Chute do fixo',start:'n1',nodes:{
  n1:{title:'Caminho livre',with:'h-fixo',home:{fixo:P(420,300),pivo:P(700,250),ala1:P(600,140),ala2:P(600,460)},away:{fixo:P(760,300),pivo:P(560,170),ala1:P(680,180),ala2:P(680,430)},
   options:['advance','pass','shoot'],answer:'advance',target:'space',cue:P(540,300),
   line:'Ninguém marca você!',easy:'Vá com a bola!',medium:'O caminho está livre?',hard:'Use o espaço.',
   lesson:'Livre? Vá com a bola.',oops:'O chute foi fraco.',ok:'n2',fail:'rec'},
  n2:{title:'Passe pro pivô',with:'h-fixo',home:{fixo:P(540,300),pivo:P(720,230)},away:{fixo:P(615,300)},
   options:['pass','shoot','advance'],answer:'pass',target:'h-pivo',
   line:'Um rival vem em você.',easy:'Passe para o pivô!',medium:'Quem ficou livre?',hard:'Ache o passe.',
   lesson:'Um amigo ficou livre.',oops:'O rival pegou a bola.',ok:'n3',fail:'rec'},
  n3:{title:'Bola solta',ball:P(610,330),home:{fixo:P(560,320),pivo:P(780,240)},away:{gk:P(880,340),fixo:P(700,280)},
   options:['shoot','control','return'],answer:'shoot',target:'goal',
   line:'A bola sobrou para você!',easy:'Chute rápido!',medium:'O gol está aí!',hard:'Chute!',
   lesson:'Bola sobrou? Chute rápido!',oops:'O rival tirou a bola.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival no ataque',with:'a-ala1',home:{fixo:P(560,320)},away:{ala1:P(450,200)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(330,300),
   line:'O rival saiu correndo!',easy:'Volte para a defesa!',medium:'Onde você fica?',hard:'Volte rápido.',
   lesson:'Perdeu a bola? Volte!',oops:'Ninguém voltou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'f5',title:'Dois contra um',start:'n1',nodes:{
  n1:{title:'Dois rivais',with:'a-ala1',home:{fixo:P(270,335),ala1:P(600,150),ala2:P(600,450),pivo:P(700,300)},away:{ala1:P(430,200),pivo:P(440,380)},
   options:['cover','press','advance'],answer:'cover',target:'space',cue:P(325,300),
   line:'Dois rivais vêm aí!',easy:'Fique no meio!',medium:'Vai ou espera?',hard:'Segure os dois.',
   lesson:'Contra dois, fique no meio.',oops:'Um rival ficou livre.',ok:'n2',fail:'rec'},
  n2:{title:'Marcar quem pegou',with:'a-pivo',home:{fixo:P(325,300),ala1:P(480,180)},away:{pivo:P(360,375),ala1:P(380,200)},
   options:['mark','cover','return'],answer:'mark',target:'a-pivo',
   line:'O rival passou a bola.',easy:'Marque quem pegou!',medium:'Quem tem a bola?',hard:'Pare o chute.',
   lesson:'Marque quem tem a bola.',oops:'O rival ficou livre.',ok:'n3',fail:'rec'},
  n3:{title:'Bola nossa',with:'h-fixo',home:{fixo:P(340,360),ala1:P(450,175)},away:{ala1:P(320,210),pivo:P(380,410)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-ala1',
   line:'Você pegou a bola!',easy:'Passe para o ala!',medium:'Quem pode pegar?',hard:'Comece o jogo.',
   lesson:'Depois de defender, passe.',oops:'Você perdeu a bola.',ok:{end:'keep'},fail:'rec'},
  rec:{title:'Chute do rival',with:'a-pivo',home:{fixo:P(310,320)},away:{pivo:P(250,375)},
   options:['cover','return','shoot'],answer:'cover',target:'space',cue:P(225,345),
   line:'O rival vai chutar!',easy:'Entre na frente!',medium:'Cuide do gol!',hard:'Pare o chute.',
   lesson:'Na frente da bola, bloqueie.',oops:'A bola passou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }}
],

/* ======================= ALA ======================= */
"Ala":[
 {id:'a1',title:'Tabela',start:'n1',nodes:{
  n1:{title:'Passe pro pivô',with:'h-ala1',home:{ala1:P(445,160),pivo:P(650,300),fixo:P(300,300)},away:{ala1:P(500,200),fixo:P(720,300),pivo:P(520,320)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-pivo',
   line:'A bola é sua.',easy:'Passe para o pivô!',medium:'Quem está perto do gol?',hard:'Ache o passe.',
   lesson:'O ala acha o pivô.',oops:'O rival pegou a bola.',ok:'n2',fail:'rec'},
  n2:{title:'Correr pra frente',with:'h-pivo',home:{pivo:P(660,300),ala1:P(470,160)},away:{fixo:P(710,300),ala1:P(505,205)},
   options:['advance','return','mark'],answer:'advance',target:'space',cue:P(745,150),
   line:'O pivô pegou a bola.',easy:'Corra para a frente!',medium:'Onde você vai?',hard:'Corra para o espaço.',
   lesson:'Passou? Corra para a frente!',oops:'Você ficou parado.',ok:'n3',fail:'rec'},
  n3:{title:'Chute no gol',with:'h-ala1',home:{ala1:P(750,160),pivo:P(680,310)},away:{ala1:P(640,190),fixo:P(720,300)},
   options:['shoot','pass','advance'],answer:'shoot',target:'goal',
   line:'A bola voltou! O gol está perto.',easy:'Chute no gol!',medium:'O gol está livre?',hard:'Chute!',
   lesson:'Passa e corre: é tabela!',oops:'O rival chegou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Voltar e defender',with:'a-ala1',home:{ala1:P(560,150)},away:{ala1:P(470,185)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(385,190),
   line:'O rival pegou a bola!',easy:'Volte para defender!',medium:'Onde você fica?',hard:'Ajude o time.',
   lesson:'O ala ataca e defende.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'a2',title:'Lado livre',start:'n1',nodes:{
  n1:{title:'Lado livre',with:'h-ala1',home:{ala1:P(420,150),pivo:P(680,320),ala2:P(560,450)},away:{ala1:P(560,300),fixo:P(740,280),pivo:P(600,360)},
   options:['advance','pass','shoot'],answer:'advance',target:'space',cue:P(600,140),
   line:'O lado está livre!',easy:'Corra com a bola!',medium:'Tem espaço?',hard:'Use o lado.',
   lesson:'Lado livre? Vá com a bola.',oops:'O chute foi fraco.',ok:'n2',fail:'rec'},
  n2:{title:'Passe pro pivô',with:'h-ala1',home:{ala1:P(600,140),pivo:P(720,320)},away:{fixo:P(665,185),pivo:P(600,300)},
   options:['pass','shoot','advance'],answer:'pass',target:'h-pivo',
   line:'Um rival vem em você.',easy:'Passe para o pivô!',medium:'Quem ficou livre?',hard:'Ache o amigo.',
   lesson:'Um amigo ficou livre.',oops:'O rival pegou a bola.',ok:'n3',fail:'rec'},
  n3:{title:'Bola solta',ball:P(825,210),home:{ala1:P(760,170),pivo:P(760,330)},away:{gk:P(890,320),fixo:P(700,225)},
   options:['shoot','control','return'],answer:'shoot',target:'goal',
   line:'O goleiro soltou a bola!',easy:'Chute de novo!',medium:'A bola é sua!',hard:'Chute!',
   lesson:'Siga a bola até o fim.',oops:'O goleiro pegou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Voltar e defender',with:'a-ala1',home:{ala1:P(620,150)},away:{ala1:P(500,190)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(400,185),
   line:'O rival pegou a bola!',easy:'Volte para defender!',medium:'Onde você fica?',hard:'Ajude o time.',
   lesson:'O ala ataca e defende.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'a3',title:'Voltar e defender',start:'n1',nodes:{
  n1:{title:'Rival no ataque',with:'a-ala1',home:{ala1:P(640,150),fixo:P(300,300)},away:{ala1:P(560,195),pivo:P(450,320)},
   options:['return','press','advance'],answer:'return',target:'space',cue:P(400,170),
   line:'O rival vem do seu lado!',easy:'Volte para defender!',medium:'Para onde você vai?',hard:'Volte rápido.',
   lesson:'Perdeu a bola? Volte!',oops:'O rival passou.',ok:'n2',fail:'rec'},
  n2:{title:'Marcar o rival',with:'a-ala1',home:{ala1:P(400,170)},away:{ala1:P(465,195)},
   options:['mark','cover','shoot'],answer:'mark',target:'a-ala1',
   line:'Você chegou antes!',easy:'Marque o rival!',medium:'Quem você marca?',hard:'Pare o rival.',
   lesson:'Fique entre o rival e o gol.',oops:'O rival passou.',ok:'n3',fail:'rec'},
  n3:{title:'Passe rápido',with:'h-ala1',home:{ala1:P(425,180),pivo:P(640,300)},away:{ala1:P(455,230)},
   options:['pass','advance','shoot'],answer:'pass',target:'h-pivo',
   line:'Você pegou a bola!',easy:'Passe para o pivô!',medium:'Quem está na frente?',hard:'Jogue rápido!',
   lesson:'Pegou? Passe rápido!',oops:'Você perdeu a bola.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Perigo!',with:'a-ala1',home:{ala1:P(380,190),fixo:P(260,300)},away:{ala1:P(300,205)},
   options:['mark','return','shoot'],answer:'mark',target:'a-ala1',
   line:'O rival está perto do gol!',easy:'Marque o rival!',medium:'Quem você marca?',hard:'Pare o chute.',
   lesson:'Ajude até o fim.',oops:'O rival chutou.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'a4',title:'Lateral',start:'n1',nodes:{
  n1:{title:'Lateral',ball:P(560,52),home:{ala1:P(560,72),pivo:P(640,175),fixo:P(380,300)},away:{ala1:P(595,125),fixo:P(705,225),pivo:P(520,205)},
   options:['kickin','throw','advance'],answer:'kickin',target:'h-pivo',
   line:'Lateral do seu time!',easy:'Chute para o pivô!',medium:'Como se bate o lateral?',hard:'Bata o lateral.',
   lesson:'No futsal, lateral é com o pé.',oops:'Com a mão não vale!',ok:'n2',fail:'rec'},
  n2:{title:'Correr pra frente',with:'h-pivo',home:{pivo:P(650,180),ala1:P(570,75)},away:{fixo:P(705,205)},
   options:['advance','return','mark'],answer:'advance',target:'space',cue:P(760,120),
   line:'O pivô pegou a bola.',easy:'Corra para a frente!',medium:'Onde você vai?',hard:'Corra para o espaço.',
   lesson:'Depois do lateral, corra!',oops:'Você ficou parado.',ok:'n3',fail:'rec'},
  n3:{title:'Passe pro outro lado',with:'h-ala1',home:{ala1:P(770,130),ala2:P(800,430)},away:{gk:P(890,250),fixo:P(760,220),ala2:P(700,455)},
   options:['pass','shoot','advance'],answer:'pass',target:'h-ala2',
   line:'A bola voltou! O goleiro está perto.',easy:'Passe para o outro lado!',medium:'Quem está livre?',hard:'Ache o amigo.',
   lesson:'Um lado fechou, o outro abriu.',oops:'O goleiro pegou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Voltar e defender',with:'a-ala1',home:{ala1:P(640,110)},away:{ala1:P(520,180)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(420,180),
   line:'O rival pegou a bola!',easy:'Volte para defender!',medium:'Onde você fica?',hard:'Ajude o time.',
   lesson:'O ala ataca e defende.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'a5',title:'Apertar lá na frente',start:'n1',nodes:{
  n1:{title:'Apertar o rival',with:'a-fixo',home:{ala1:P(700,160),pivo:P(720,330)},away:{fixo:P(800,220),ala1:P(650,250),pivo:P(600,320)},
   options:['press','return','position'],answer:'press',target:'a-fixo',
   line:'O rival tem a bola lá atrás.',easy:'Corra e aperte o rival!',medium:'Dá para pegar a bola?',hard:'Aperte o rival!',
   lesson:'Apertar faz o rival errar.',oops:'O rival jogou fácil.',ok:'n2',fail:'rec'},
  n2:{title:'Bola nossa',with:'h-pivo',home:{pivo:P(760,300),ala1:P(770,185)},away:{fixo:P(800,240)},
   options:['advance','return','mark'],answer:'advance',target:'space',cue:P(845,170),
   line:'O rival errou! O pivô pegou.',easy:'Corra para perto do gol!',medium:'Onde você vai?',hard:'Fique livre.',
   lesson:'Fique perto do gol.',oops:'Você voltou cedo.',ok:'n3',fail:'rec'},
  n3:{title:'Chutar',with:'h-ala1',home:{ala1:P(845,175),pivo:P(760,310)},away:{gk:P(900,280)},
   options:['shoot','pass','control'],answer:'shoot',target:'goal',
   line:'A bola é sua, perto do gol!',easy:'Chute!',medium:'É hora de chutar?',hard:'Chute!',
   lesson:'Pegou, chutou: gol!',oops:'O goleiro fechou o gol.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival escapou',with:'a-ala1',home:{ala1:P(650,170)},away:{ala1:P(520,220)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(430,190),
   line:'O rival escapou!',easy:'Volte para defender!',medium:'Para onde você vai?',hard:'Volte rápido.',
   lesson:'Não deu? Volte rápido.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }}
],

/* ======================= PIVÔ ======================= */
"Pivô":[
 {id:'p1',title:'Segurar e passar',start:'n1',nodes:{
  n1:{title:'Segurar a bola',with:'h-pivo',home:{pivo:P(660,300),ala1:P(560,160)},away:{fixo:P(710,300),ala1:P(520,220)},
   options:['pass','shoot','advance'],answer:'pass',target:'h-ala1',
   line:'O gol está atrás de você.',easy:'Segure e passe para o ala!',medium:'Quem vem ajudar?',hard:'Segure e passe.',
   lesson:'Use o corpo e passe.',oops:'O chute foi fraco.',ok:'n2',fail:'rec'},
  n2:{title:'Virar e ir',with:'h-ala1',home:{ala1:P(600,160),pivo:P(665,300)},away:{fixo:P(705,300)},
   options:['position','return','mark'],answer:'position',target:'space',cue:P(775,330),
   line:'O ala está com a bola.',easy:'Vire e vá para o gol!',medium:'Onde você fica?',hard:'Fique livre.',
   lesson:'Passou? Vire e vá!',oops:'Você ficou preso.',ok:'n3',fail:'rec'},
  n3:{title:'Chute!',with:'h-pivo',home:{pivo:P(775,330)},away:{fixo:P(730,295),gk:P(905,310)},
   options:['shoot','pass','control'],answer:'shoot',target:'goal',
   line:'O ala tocou para você!',easy:'Chute no gol!',medium:'O gol está aí!',hard:'Chute!',
   lesson:'Perto do gol, chute rápido.',oops:'O rival tirou a bola.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Apertar o rival',with:'a-fixo',home:{pivo:P(700,320)},away:{fixo:P(680,280)},
   options:['press','return','shoot'],answer:'press',target:'a-fixo',
   line:'O rival pegou a bola!',easy:'Corra e aperte o rival!',medium:'O que você faz?',hard:'Pegue de volta.',
   lesson:'Perdeu? Aperte o rival!',oops:'O rival saiu jogando.',ok:{end:'keep'},fail:{end:'lost'}}
 }},
 {id:'p2',title:'Ficar livre',start:'n1',nodes:{
  n1:{title:'Ficar livre',with:'h-ala2',home:{ala2:P(520,440),pivo:P(650,300)},away:{fixo:P(670,285),ala2:P(580,425)},
   options:['position','mark','return'],answer:'position',target:'space',cue:P(705,375),
   line:'O ala está com a bola.',easy:'Fuja do rival!',medium:'Como fica livre?',hard:'Fique livre.',
   lesson:'Mexa-se para ficar livre.',oops:'Você ficou preso.',ok:'n2',fail:'rec'},
  n2:{title:'Virar com a bola',with:'h-pivo',home:{pivo:P(705,375)},away:{fixo:P(640,320)},
   options:['advance','pass','shoot'],answer:'advance',target:'space',cue:P(785,335),
   line:'O rival ficou para trás!',easy:'Vire e vá para o gol!',medium:'Tem espaço?',hard:'Use o espaço.',
   lesson:'Com espaço, vire para o gol.',oops:'O rival voltou.',ok:'n3',fail:'rec'},
  n3:{title:'Chute no canto',with:'h-pivo',home:{pivo:P(790,335)},away:{gk:P(880,300),fixo:P(720,320)},
   options:['shoot','pass','advance'],answer:'shoot',target:'goal',
   line:'O goleiro saiu do gol.',easy:'Chute no canto!',medium:'Hora de chutar?',hard:'Chute!',
   lesson:'No canto é mais difícil.',oops:'O goleiro pegou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Apertar o rival',with:'a-fixo',home:{pivo:P(700,340)},away:{fixo:P(670,300)},
   options:['press','return','shoot'],answer:'press',target:'a-fixo',
   line:'O rival pegou a bola!',easy:'Corra e aperte o rival!',medium:'O que você faz?',hard:'Pegue de volta.',
   lesson:'Perdeu? Aperte o rival!',oops:'O rival saiu jogando.',ok:{end:'keep'},fail:{end:'lost'}}
 }},
 {id:'p3',title:'Bola solta',start:'n1',nodes:{
  n1:{title:'Pegar a bola',ball:P(855,260),home:{ala1:P(650,170),pivo:P(740,310)},away:{gk:P(900,335),fixo:P(790,340)},
   options:['advance','return','mark'],answer:'advance',target:'space',cue:P(840,270),
   line:'O goleiro soltou a bola!',easy:'Corra para a bola!',medium:'Onde está a bola?',hard:'Pegue a bola.',
   lesson:'Siga a bola até o fim.',oops:'O rival chegou antes.',ok:'n2',fail:'rec'},
  n2:{title:'Gol livre',with:'h-pivo',home:{pivo:P(835,270)},away:{gk:P(900,355)},
   options:['shoot','control','pass'],answer:'shoot',target:'goal',
   line:'A bola é sua! O goleiro caiu.',easy:'Chute!',medium:'Rápido!',hard:'Chute!',
   lesson:'Bola sobrou? Chute rápido!',oops:'O goleiro levantou.',ok:{end:'goal'},fail:{end:'saved'}},
  rec:{title:'Apertar o rival',with:'a-fixo',home:{pivo:P(780,300)},away:{fixo:P(830,270)},
   options:['press','return','shoot'],answer:'press',target:'a-fixo',
   line:'O rival pegou a bola!',easy:'Corra e aperte o rival!',medium:'O que você faz?',hard:'Pegue de volta.',
   lesson:'Perto do gol, aperte o rival.',oops:'O rival saiu jogando.',ok:{end:'keep'},fail:{end:'lost'}}
 }},
 {id:'p4',title:'Marcar primeiro',start:'n1',nodes:{
  n1:{title:'Apertar o rival',with:'a-fixo',home:{pivo:P(690,300),ala1:P(640,170),ala2:P(680,430)},away:{fixo:P(760,300),ala1:P(760,160),ala2:P(770,440)},
   options:['press','return','shoot'],answer:'press',target:'a-fixo',
   line:'O rival está com a bola.',easy:'Corra e aperte o rival!',medium:'Quem marca primeiro?',hard:'Aperte o rival!',
   lesson:'O pivô marca primeiro.',oops:'O rival jogou fácil.',ok:'n2',fail:'rec'},
  n2:{title:'Ficar livre',with:'h-ala2',home:{ala2:P(730,420),pivo:P(755,300)},away:{fixo:P(800,250),ala2:P(700,470)},
   options:['position','return','mark'],answer:'position',target:'space',cue:P(815,350),
   line:'O rival errou! O ala pegou.',easy:'Vá para perto do gol!',medium:'Onde você fica?',hard:'Fique livre.',
   lesson:'Fique livre para pegar.',oops:'Você ficou escondido.',ok:'n3',fail:'rec'},
  n3:{title:'Chutar',with:'h-pivo',home:{pivo:P(815,350)},away:{gk:P(900,300)},
   options:['shoot','pass','control'],answer:'shoot',target:'goal',
   line:'O ala passou para você!',easy:'Chute no gol!',medium:'É hora de chutar?',hard:'Chute!',
   lesson:'Você ajudou duas vezes!',oops:'O goleiro pegou.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Voltar',with:'a-ala1',home:{pivo:P(730,300)},away:{ala1:P(610,190)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(565,290),
   line:'O rival escapou!',easy:'Volte para ajudar!',medium:'O que você faz?',hard:'Ajude o time.',
   lesson:'O pivô também defende.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }},
 {id:'p5',title:'Escanteio nosso',start:'n1',nodes:{
  n1:{title:'Escanteio',ball:P(942,56),home:{ala1:P(935,72),pivo:P(780,300),ala2:P(720,450),fixo:P(520,300)},away:{fixo:P(795,285),gk:P(905,300),pivo:P(760,420),ala1:P(840,180)},
   options:['position','mark','return'],answer:'position',target:'space',cue:P(855,385),
   line:'Escanteio do seu time!',easy:'Fuja do rival, vá para o gol!',medium:'Onde a bola vai?',hard:'Ache o espaço.',
   lesson:'No escanteio, fique livre.',oops:'Você ficou parado.',ok:'n2',fail:'rec'},
  n2:{title:'Chute direto',with:'h-pivo',home:{pivo:P(855,385)},away:{fixo:P(800,320),gk:P(900,285)},
   options:['shoot','control','pass'],answer:'shoot',target:'goal',
   line:'A bola chegou em você!',easy:'Chute direto!',medium:'Dá tempo de parar?',hard:'Chute!',
   lesson:'Perto do gol, chute direto.',oops:'O rival tirou a bola.',ok:{end:'goal'},fail:'rec'},
  rec:{title:'Rival no ataque',with:'a-ala1',home:{pivo:P(800,330)},away:{ala1:P(620,190)},
   options:['return','press','shoot'],answer:'return',target:'space',cue:P(600,300),
   line:'O rival pegou a bola!',easy:'Volte para ajudar!',medium:'O que você faz?',hard:'Ajude o time.',
   lesson:'Depois do escanteio, volte.',oops:'O rival chegou no gol.',ok:{end:'safe'},fail:{end:'conceded'}}
 }}
]
};
})();
