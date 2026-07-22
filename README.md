<div align="center">

# LucasQC Games

**Portal de jogos clássicos completos no navegador, com suporte a desktop, celular e uso offline.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-8A2BE2)](https://phaser.io/)
[![Production](https://img.shields.io/badge/status-production-success)](https://games.lucasqc.com)

[**Jogar agora**](https://games.lucasqc.com)

</div>

## Sobre o projeto

O **LucasQC Games** é uma coleção de dezenas de jogos de estratégia, tabuleiro, puzzle, arcade, palavras, cartas e matemática, executados diretamente no navegador.

O projeto reúne jogos independentes em uma experiência única, com páginas próprias, controles adaptados para teclado e toque, estatísticas locais e suporte progressivo para funcionamento offline.

## Jogos disponíveis

Entre os jogos implementados estão:

- Jogo da Velha;
- Campo Minado;
- Batalha Naval;
- Forca;
- Jogo da Memória;
- Ligue 4;
- Damas e Xadrez;
- Reversi e Mancala;
- Sudoku e 2048;
- Snake, Pong e Tetris;
- Sokoban;
- Termo, Conexões e Caça-Palavras;
- Palavras Cruzadas, Anagramas e Criptograma;
- Stop / Adedonha;
- jogos de cartas, lógica e matemática.

## Funcionalidades

- modos single player, contra a máquina e dois jogadores locais;
- diferentes níveis de dificuldade;
- inteligências artificiais com estratégias como minimax e avaliação heurística;
- controles por teclado, mouse e touchscreen;
- catálogo filtrável por nome, categoria e modo;
- páginas dedicadas para cada jogo;
- regras e instruções contextualizadas;
- estatísticas salvas localmente;
- tema claro e escuro;
- layout responsivo;
- recursos de PWA e uso offline;
- conteúdo estruturado para indexação por mecanismos de busca.

## Arquitetura

```text
app/                     rotas e páginas do Next.js
components/games/        catálogo e componentes compartilhados
components/layout/       header, footer e containers
components/pwa/          instalação e controles offline
src/data/games.ts        catálogo tipado de jogos
src/lib/                 persistência e utilidades
src/types/               modelos da aplicação
data/game-content.ts     descrições e conteúdo por jogo
```

Cada jogo é registrado em um catálogo central com metadados, categoria, modos, regras e controles. As páginas são construídas a partir desses dados, permitindo ampliar a coleção sem duplicar estrutura de navegação e apresentação.

## Stack

- **Framework:** Next.js 15;
- **Interface:** React 18 e Tailwind CSS;
- **Linguagem:** TypeScript;
- **Game engine:** Phaser 3 para experiências que exigem canvas e loop de jogo;
- **Regras especializadas:** Chess.js e implementações próprias;
- **Persistência:** Local Storage;
- **Distribuição:** PWA e deploy web.

## Executando localmente

### Requisitos

- Node.js 20 ou superior;
- npm.

```bash
git clone https://github.com/Lucasqc04/games-lucasqc.git
cd games-lucasqc
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Qualidade

```bash
npm run typecheck
npm run lint
npm run build
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | inicia o servidor de desenvolvimento |
| `npm run build` | gera o build de produção |
| `npm run start` | executa o build gerado |
| `npm run typecheck` | valida os tipos TypeScript |
| `npm run lint` | executa o ESLint |

## Roadmap

- adicionar novos jogos e variações de regras;
- ampliar recursos offline;
- incluir conquistas e estatísticas avançadas;
- melhorar acessibilidade de jogos por teclado;
- evoluir as IAs e modos de dificuldade.

## Autor

Desenvolvido por **[Lucas Quinteiro Campos](https://github.com/Lucasqc04)**.

[LinkedIn](https://www.linkedin.com/in/lucas-quinteiro-2071022a4/) · [Jogar](https://games.lucasqc.com)
