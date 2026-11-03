# Quadra Quest — protótipo de futsal

Protótipo web interativo para ensinar fundamentos e decisões de futsal a crianças de 6 a 9 anos.

## Arquivos principais

- `index.html`: interface e lógica interativa do protótipo.
- `lances.js`: lances encadeados por posição. Cada decisão leva à próxima: o acerto continua a jogada e o erro leva à reação do rival. Textos curtos e simples, para crianças em alfabetização.
- `tools/validar-lances.js`: confere todos os caminhos dos lances (`node tools/validar-lances.js`).
- `court3d.js`: quadra 3D em estilo cartoon (Three.js) com jogadores-bichinhos, torcida e o técnico Rafa. Se o aparelho não tiver WebGL, o jogo volta para o desenho 2D em SVG.
- `audio.js`: música animada que acelera quando o tempo da jogada acaba e efeitos sonoros (chute, gol, acerto, erro, tropeço, apito, torcida), tudo gerado com Web Audio, sem arquivos de som.
- `voice/`: narração do técnico gravada com voz neural (Thalita, pt-BR) — um mp3 por frase, o mapa `clips.js` e a lista `frases-narracao.csv`. Frases sem gravação usam a voz do aparelho.
- `tools/gravar-vozes.js`: regrava a narração depois de mudar textos (`node tools/gravar-vozes.js`, precisa do pacote `msedge-tts` e de internet só nessa hora).
- `vendor/three.min.js`: Three.js r149 (licença MIT), incluído no projeto para funcionar sem internet.
- `public/scenes/`: imagens de referência para as câmeras POV e aérea.
- `dist/`: versão estática pronta para publicação.

Cada posição (goleiro, fixo, ala e pivô) tem 5 lances por nível. Um lance tem de 2 a 4 decisões e termina em gol, defesa ou bola do rival, e o placar aparece no telão da quadra. A criança joga sempre na posição que escolheu, com ou sem a bola.

## Abrir localmente

Abra `index.html` em um navegador moderno. Para publicar em uma hospedagem estática, use a pasta `dist`.
