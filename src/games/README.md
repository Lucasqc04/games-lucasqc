# Estrutura De Jogos

Novos jogos devem ser independentes. Evite adicionar mais lógica ao arquivo `src/games/index.tsx`; ele existe como registry e compatibilidade dos jogos atuais.

## Pasta Padrão

```txt
src/games/<game-id>/
  Game.tsx
  rules.ts
  ai.ts
  input.ts
  types.ts
  constants.ts
  index.ts
```

## Responsabilidades

- `rules.ts`: estado serializável, movimentos legais, vitória, derrota, empate, score e progressão.
- `ai.ts`: níveis de dificuldade e tomada de decisão da máquina.
- `input.ts`: mapa de ações para teclado, mouse, toque e gestos.
- `Game.tsx`: HUD, renderização e ligação com `record(...)`.
- `constants.ts`: peças, velocidades, tamanhos de tabuleiro, níveis e limites.

## Checklist Antes De Registrar

- Contra máquina quando o jogo permitir.
- Dois jogadores locais quando fizer sentido.
- Mobile `390x844` sem overflow horizontal.
- Teclado/mouse no desktop e botões/gestos no celular.
- Reiniciar sem reload.
- Resultado registrado com `record(...)`.
- `npm run build` passando.
