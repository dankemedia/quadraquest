# Quadra Quest — pacote para Claude/GitHub

Este pacote contém o protótipo estático atual.

- `index.html` e `plays.js`: fontes principais da aplicação e catálogo de jogadas.
- `public/scenes/`: imagens de apoio disponíveis para o trabalho visual.
- `dist/`: cópia estática pronta para hospedagem que publica a pasta `dist`.

## Importar para GitHub (sem terminal)

1. Crie um repositório privado vazio chamado `quadra-quest` em github.com/new.
2. Instale e abra o GitHub Desktop; entre na sua conta do GitHub.
3. Use **File → Clone repository** e clone `quadra-quest` para o computador.
4. Extraia este pacote e copie o conteúdo da pasta `quadra-quest-github-export` para dentro da pasta clonada.
5. No GitHub Desktop, escreva a mensagem `Importa protótipo Quadra Quest`, clique **Commit to main** e depois **Push origin**.
6. No Claude Code, abra a pasta clonada. A integração GitHub do Claude.ai pode servir para analisar arquivos, mas para editar o projeto localmente use Claude Code.

O arquivo `.openai/hosting.json` foi omitido de propósito: ele identifica a hospedagem privada atual do protótipo e não deve ser reaproveitado como configuração do novo repositório.
