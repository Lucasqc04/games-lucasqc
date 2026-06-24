# LucasQC Games

## Objetivo

`games.lucasqc.com` é um hub jogável da identidade LucasQC. O produto não deve parecer um site de ferramentas com artigos, FAQ e blocos editoriais: a prioridade é abrir o jogo rápido, ocupar quase toda a viewport e funcionar bem em desktop e celular.

## Princípios De Produto

- Jogabilidade vem antes de conteúdo. Em páginas de jogo, manter só navegação mínima, um `h1` e o palco jogável.
- Não criar versões "simplificadas", "demo", "placeholder" ou "inspiradas" quando o usuário pedir um clássico. Implementar regras, estados, opções e controles esperados pelo jogo original ou pelos concorrentes fortes do gênero.
- Cada jogo deve ter rota própria em `/jogos/[gameId]`, tela ampla e estado independente.
- Todo jogo que permitir deve oferecer modo contra máquina e modo multiplayer local. Jogos que comportam mais jogadores devem prever essa opção.
- A IA deve ter níveis quando fizer sentido, com comportamento real de jogo, não escolhas aleatórias disfarçadas.
- Desktop e mobile são obrigatórios. Mouse, teclado, toque, botões na tela e gestos devem ser tratados conforme o gênero.
- Estatísticas, recordes, preferências e recentes ficam em `localStorage` por padrão. Não exigir login ou backend para jogar.
- A identidade visual base é LucasQC: laranja, preto e branco, com visual gamer limpo e sem poluir o playfield.

## Stack

- Next.js App Router para rotas, metadata e shell do app.
- React + TypeScript para HUD, menus, overlays e jogos baseados em DOM.
- Tailwind CSS para layout responsivo e tema.
- Phaser para jogos 2D arcade/canvas com loop contínuo, colisão, animação, tilemap, sprites ou gestos intensos.
- Bibliotecas de regra consolidadas quando existirem e forem melhores que hand-roll, como `chess.js` para xadrez.

## Arquitetura Atual

- `app/`: rotas públicas.
- `components/layout/`: header, footer, marca e containers.
- `components/games/`: catálogo, palco de jogo e estatísticas.
- `data/`: metadados curtos para cards e SEO básico.
- `src/data/games.ts`: registry público dos jogos.
- `src/games/index.tsx`: registry dos componentes jogáveis atuais.
- `src/lib/`: storage, áudio e helpers client-side.
- `src/types.ts`: contratos compartilhados.
- `public/`: logos e assets estáticos.

## Estrutura Para Novos Jogos

Novos jogos grandes não devem aumentar o monolito em `src/games/index.tsx`. Criar uma pasta própria:

```txt
src/games/<game-id>/
  Game.tsx        # componente client do jogo
  rules.ts        # regras puras, validação, vitória, empate, score
  ai.ts           # IA, heurísticas, minimax, pathfinding ou bot
  input.ts        # mapa de ações e conversão de teclado/toque/gesto
  types.ts        # tipos locais do jogo
  constants.ts    # tamanhos, níveis, peças, velocidades
  index.ts        # exports públicos
```

Para Phaser, usar:

```txt
src/games/<game-id>/
  PhaserGame.tsx
  scenes/
  systems/
  sprites/
  rules.ts
  input.ts
  types.ts
```

Depois registrar o jogo em `src/data/games.ts` e no registry de componentes. O jogo deve continuar independente: regras e IA não podem depender do layout da página.

## Assets E Animações

Todo jogo novo deve passar por uma análise de assets antes da implementação visual final.

- Manter e consultar `ASSET_PROMPTS.md` como biblioteca de prompts base para gerar assets no ChatGPT ou em outra ferramenta de imagem.
- Ao criar um jogo novo, definir no proprio plano quais assets sao essenciais agora, quais sao desejaveis depois e quais animacoes pequenas melhoram feedback de jogabilidade.
- Se assets forem importantes para a qualidade do jogo, preparar prompts para o usuario gerar imagens em chroma antes da fase de polimento visual.
- Identificar quais assets melhoram a jogabilidade: peças, cartas, tabuleiros, tiles, ícones de ação, HUD, efeitos de vitória/derrota, capas e thumbnails.
- Para assets pequenos, preparar prompts pedindo spritesheets com 4, 8, 12 ou 16 itens na mesma imagem, sempre com fundo chroma sólido.
- Para assets grandes, preparar prompts separados para capa, tabuleiro, cenário, personagem ou conjunto principal, com 1, 2 ou 4 variações por imagem.
- Pedir assets em visual LucasQC Games: laranja, preto e branco como identidade base, com cores auxiliares apenas quando o jogo exigir legibilidade.
- Preferir chroma verde puro ou magenta puro para recorte, evitando sombras grudadas no fundo.
- Quando o usuário enviar as imagens, remover chroma, recortar sprites individuais, normalizar tamanhos e salvar em `public/assets/games/<game-id>/`.
- Registrar assets por chaves estáveis, não por nomes aleatórios de arquivo.
- Animações pequenas devem ser pensadas como spritesheets: idle, hover, click, win, lose, capture, deal, move, explode, clear-line ou draw-card conforme o gênero.
- Depois de integrar assets, verificar se a imagem melhora leitura e jogabilidade. Nao manter asset decorativo se ele atrapalhar tabuleiro, cartas, HUD ou toque mobile.

## Contrato De Um Jogo Completo

Todo novo jogo precisa entregar:

- Regras completas da variante escolhida, incluindo estados finais, empates, bloqueios, promoções, penalidades e pontuação.
- Modos esperados: solo, contra máquina, dois jogadores locais ou mais jogadores quando o jogo permitir.
- Opções de partida: dificuldade, tamanho de tabuleiro, velocidade, tema, nível, tempo, undo ou hints quando forem comuns naquele jogo.
- Controles desktop: teclado e mouse com atalhos clássicos quando existirem.
- Controles mobile: botões grandes, toque direto e gestos naturais como swipe/drag/pinch quando fizer sentido.
- Feedback de estado: turno, score, level, combo, check, checkmate, game over, pause, vitória, empate e erro de movimento.
- Reiniciar partida sem reload e salvar estatísticas ao finalizar.
- Layout responsivo sem overflow horizontal e sem texto sobreposto.

## Páginas De Jogo

- A rota do jogo deve renderizar `SiteHeader` mínimo e `GameStage`.
- Não adicionar FAQ, artigo, páginas "como jogar" longas, blocos relacionados ou conteúdo abaixo do jogo sem pedido explícito.
- O `GameStage` deve ocupar `calc(100svh - header)` e deixar o jogo usar toda a largura útil.
- Regras, ajuda, configurações e atalhos ficam dentro do próprio jogo como drawer, pause menu ou HUD discreto.
- Não usar sidebar fixa em desktop se ela reduzir a área jogável. Preferir controles compactos no topo ou overlay colapsável.

## PWA E Offline

- O app deve continuar instalável como PWA em `games.lucasqc.com`.
- Manter `public/manifest.webmanifest`, `public/sw.js` e `public/offline-manifest.json` atualizados quando novas rotas, assets ou jogos forem adicionados.
- Todo novo jogo precisa funcionar depois de preparado offline, sem chamadas obrigatórias para backend, CDN ou API externa durante a partida.
- Assets em `public/assets/games/<game-id>/` que forem necessários para jogar devem entrar no cache offline ou ser carregados por rotas já cobertas pelo service worker.
- Alterações grandes de assets ou runtime devem atualizar a versão dos caches no service worker para forçar recache limpo.

## UI E Experiência

- Proteger o playfield: centro e área inferior principal devem ficar livres durante a partida.
- HUD persistente deve ser compacto. Informações secundárias ficam em menus ou drawers.
- Botões precisam ter área de toque confortável no mobile.
- Tabuleiros, grids, canvases e cartas devem ter dimensões estáveis com `aspect-ratio`, `min/max` e constraints responsivas.
- Não usar cards aninhados, landing-page hero ou blocos de marketing nas páginas de jogo.
- Evitar textos longos dentro do jogo. Mostrar apenas o que ajuda a jogar naquele momento.

## IA E Regras

- Preferir engine/regras puras testáveis fora da UI.
- IA fácil pode errar; IA média deve aplicar heurísticas; IA difícil deve procurar jogadas futuras quando o jogo permitir.
- Xadrez deve manter movimentos legais, xeque, xeque-mate, empate, roque, en passant e promoção quando suportados pela engine.
- Tetris deve ter queda automática, rotação, fila/hold quando implementado, níveis, linhas, score e atalhos clássicos.
- Snake deve suportar teclado, botões e swipe/drag mobile.
- Jogos de tabuleiro devem validar movimentos ilegais e terminar automaticamente quando houver vitória, derrota, empate ou bloqueio.

## Checklist Ao Criar Ou Melhorar Um Jogo

1. Identificar a variante clássica e as funcionalidades esperadas por jogadores.
2. Definir modos: solo, IA, multiplayer local e opções extras.
3. Separar regras/estado de renderização e HUD.
4. Implementar input por ações, não por eventos espalhados.
5. Implementar desktop e mobile desde o início.
6. Registrar resultado em `record(...)` com vencedor e detalhe.
7. Garantir restart, pause ou undo quando o gênero pedir.
8. Rodar `npm run build`.
9. Testar no navegador: home, rota do jogo, uma ação real, fim de partida quando viável, viewport mobile `390x844` e console sem erros relevantes.

## Critério De Aceite

Uma mudança só deve ser considerada pronta quando o jogo abre diretamente, permite jogar de verdade, responde aos controles esperados, não quebra no mobile, registra estatísticas e passa no build. Se uma funcionalidade clássica importante ainda não existir, tratar como pendência de implementação, não como detalhe cosmético.
