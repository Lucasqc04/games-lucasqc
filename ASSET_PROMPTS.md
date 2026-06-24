# LucasQC Games - Prompts De Assets Com Chroma

Use este arquivo para pedir imagens no ChatGPT e depois enviar os PNGs de volta ao Codex. Quando os arquivos chegarem, o pipeline esperado e: remover chroma, recortar itens quando houver multiplos assets na mesma imagem, normalizar tamanhos, salvar em `public/assets/games/<game-id>/` e registrar por chaves estaveis.

## Regra Base Para Todos Os Prompts

Cole este bloco antes de qualquer prompt especifico:

```txt
Crie assets 2D para um site de jogos chamado LucasQC Games.
Identidade visual: laranja vibrante, preto profundo, branco limpo, detalhes discretos em cinza escuro. Estilo gamer moderno, legivel em tela pequena, acabamento premium, bordas limpas, alto contraste.
Formato: PNG, fundo chroma verde puro #00FF00 ou magenta puro #FF00FF, sem gradiente no fundo, sem sombras grudadas no fundo, sem texto, sem logos externos, sem mockup de tela, sem perspectiva exagerada.
Se for spritesheet: organizar em grade perfeita, com margens iguais, cada item centralizado no proprio slot, sem sobreposicao, sem cortes. Manter a mesma escala e o mesmo estilo em todos os itens.
Se for capa/thumbnail: composicao limpa, sem texto renderizado na imagem, com area central forte e laterais simples para recorte responsivo.
```

## Prompt Global 1 - Capas Da Biblioteca

```txt
Gere uma imagem 2D em fundo chroma verde puro #00FF00 com 8 thumbnails quadradas separadas em grade 4x2, cada thumbnail isolada no seu slot, sem texto.
Tema: capas premium para jogos classicos do LucasQC Games.
Assets:
1. tabuleiro estrategico com pecas laranja e pretas
2. cartas premium com naipes minimalistas
3. puzzle de grade com numeros e pistas
4. arcade neon com blocos caindo e cobra pixel
5. palavras/letras com tiles elegantes
6. dados e pecas de corrida de tabuleiro
7. mahjong/domino com pecas brilhantes
8. labirinto com chave e saida
```

## Prompt Global 2 - Icones De UI

```txt
Gere uma spritesheet 4x4 em fundo chroma verde puro #00FF00, 16 icones 2D premium para HUD de jogos, sem texto.
Icones: play, pause, restart, undo, hint, settings, sound on, sound off, bot/IA, dois jogadores, timer, trophy, target, shuffle, daily challenge, fullscreen.
Estilo: LucasQC Games, laranja/preto/branco, leitura clara em 32px e 64px, cada icone centralizado em slot quadrado.
```

## Prompt Global 3 - Efeitos Pequenos

```txt
Gere uma spritesheet 4x3 em fundo chroma magenta puro #FF00FF, 12 efeitos pequenos para feedback de jogos.
Efeitos: win burst, lose crack, valid move glow, invalid move shake mark, capture flash, combo sparks, line clear, card deal trail, check warning aura, match pair sparkle, score popup burst, daily challenge badge.
Sem texto, sem numeros, sem UI de app. Estilo gamer limpo LucasQC Games.
```

## Prompt Global 4 - Botoes E Chips

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00, 8 pecas de UI sem texto: botao primario, botao secundario, botao perigo, chip selecionado, chip bloqueado, caixa de score, badge de dificuldade, slot de carta/peca.
Estilo LucasQC Games, laranja/preto/branco, glass dark discreto, bordas arredondadas pequenas, sem letras.
```

## Jogos Atuais - Assets Prioritarios

### Jogo da Velha

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Jogo da Velha premium.
Assets: X laranja, O branco, celula vazia escura, linha de vitoria horizontal, linha vertical, linha diagonal, icone IA, icone 2 jogadores.
Estilo LucasQC Games, formas grossas e legiveis.
```

### Campo Minado

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Campo Minado.
Assets: celula fechada, celula aberta vazia, bandeira laranja, mina preta/branca, explosao pequena, numero 1, numero 2, numero 3, numero 4, numero 5, celula duvida, trofeu de vitoria.
Sem texto fora dos numeros, leitura clara em 32px.
```

### Batalha Naval

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Batalha Naval.
Assets: porta-avioes, encouracado, cruzador, submarino, bote, agua escura, splash de erro, explosao de acerto, navio afundado, mira, sonar, marcador de coordenada.
Vista top-down, estilo gamer naval laranja/preto/branco com azul escuro discreto.
```

### Forca

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Forca.
Assets: estrutura da forca em 6 estagios progressivos, tile de letra vazia, tile de letra correta, tile de letra errada, icone dica, icone palavra secreta.
Sem texto real, estilo limpo e nao macabro.
```

### Jogo da Memoria

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Jogo da Memoria.
Assets: verso de carta LucasQC, e 15 frentes de cartas com simbolos simples: estrela, raio, controle, coroa, diamante, chama, alvo, foguete, cubo, lua, sol, chave, trofeu, escudo, portal.
Sem texto, todos no mesmo estilo.
```

### Ligue 4

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Ligue 4.
Assets: tabuleiro azul/preto, ficha laranja, ficha branca, coluna destacada, queda de ficha frame 1, queda frame 2, linha vencedora, brilho de vitoria.
Vista frontal, geometria limpa.
```

### Damas

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Damas.
Assets: peca preta, peca branca, dama preta coroada, dama branca coroada, casa escura, casa clara, casa selecionada, movimento valido, captura obrigatoria, trilha de multi-captura, peca capturada, vitoria.
Estilo tabuleiro premium LucasQC.
```

### Xadrez

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 com pecas de xadrez premium.
Assets: rei, dama, torre, bispo, cavalo, peao em versao branca; rei, dama, torre, bispo, cavalo, peao em versao preta; marcador de xeque, marcador de xeque-mate, casa selecionada, casa movimento legal.
Sem letras, silhuetas classicas legiveis.
```

### Reversi / Othello

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Reversi.
Assets: disco preto, disco branco, disco virando frame 1, frame 2, frame 3, movimento valido, canto estrategico destacado, vitoria por maioria.
```

### Mancala

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 4 assets grandes para Mancala em grade 2x2.
Assets: tabuleiro mancala top-down, semente laranja, semente branca, brilho de captura/turno extra.
Estilo madeira escura premium com acentos LucasQC.
```

### Nim

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Nim.
Assets: pilha pequena, pilha media, pilha grande, item removido, selecao de quantidade, turno IA, turno jogador, vitoria logica.
```

### Pedra Papel Tesoura Lagarto Spock

```txt
Gere uma spritesheet 5x1 em fundo chroma verde #00FF00.
Assets: pedra, papel, tesoura, lagarto, Spock/saudacao vulcana, todos no mesmo estilo LucasQC, sem texto.
```

### Senha / Mastermind

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Mastermind.
Assets: pinos em 8 cores premium, marcador preto, marcador branco, slot vazio, linha de tentativa, brilho de acerto.
Fundo dos itens transparente apos chroma.
```

### Sudoku

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Sudoku.
Assets: casa vazia, casa selecionada, casa fixa, casa anotacao, erro, dica, conflito linha, conflito bloco, numero correto, numero incorreto, timer, desafio diario.
Sem numeros renderizados, apenas estados visuais.
```

### 2048

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para 2048.
Assets: tiles 2,4,8,16,32,64,128,256,512,1024,2048, tile vazio, merge burst, new tile glow, game over badge sem texto, win badge sem texto.
Pode incluir numeros nos tiles, com fonte limpa e legivel.
```

### Snake

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Snake/Cobrinha.
Assets: cabeca olhando direita, corpo reto, corpo curva, cauda, maca/comida, parede, particula de comer, game over crack, swipe hint sem texto, cabeca cima, cabeca baixo, cabeca esquerda, corpo vertical, corpo horizontal, brilho velocidade, trofeu.
Estilo pixel-art premium, escala consistente.
```

### Pong

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Pong.
Assets: raquete P1 laranja, raquete P2 branca, bola, trilha de bola, impacto na raquete, linha central, marcador de ponto, explosao de score.
```

### Tetris

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Tetris.
Assets: pecas I, O, T, S, Z, J, L como tetrominos premium; ghost piece; hold slot; next slot; line clear effect; game over stack.
Peças com cores fortes mas alinhadas ao LucasQC.
```

### Sokoban

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Sokoban.
Assets: jogador, caixa, alvo, caixa no alvo, parede, piso, movimento, desfazer, reset, nivel concluido, porta, sombra de empurrar.
Vista top-down/isometrica leve, consistente.
```

### Pontos e Caixas

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Pontos e Caixas.
Assets: ponto, linha horizontal, linha vertical, caixa P1, caixa P2, linha hover, caixa fechando, turno extra.
```

## Novos Jogos De Palavra

### Termo PT-BR

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Termo PT-BR.
Assets: tile vazio, tile letra correta, tile letra presente, tile ausente, teclado tecla normal, tecla correta, tecla presente, tecla ausente, desafio diario, tentativa atual, shake erro, celebracao acerto.
Sem letras renderizadas, apenas estados.
```

### Conexões

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Conexões.
Assets: card palavra normal, card selecionado, grupo facil, grupo medio, grupo dificil, grupo absurdo, erro 1, erro 2, erro 3, erro final, grupo resolvido, celebracao.
Sem texto.
```

### Caça-Palavras

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Caça-Palavras.
Assets: celula letra normal, celula selecionada, inicio de palavra, fim de palavra, linha horizontal, linha vertical, linha diagonal, palavra encontrada, tema tecnologia, tema comida, tema games, desafio diario.
Sem letras renderizadas.
```

### Palavras Cruzadas

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Palavras Cruzadas.
Assets: casa branca, casa preta, casa ativa, numero de dica pequeno sem numero real, erro, acerto, dica horizontal, dica vertical, teclado letra, palavra completa, revelar letra, concluir puzzle.
```

### Anagramas

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Anagramas.
Assets: tile letra embaralhada, tile letra escolhida, botao embaralhar sem texto, acerto, erro, combo, timer, trofeu.
```

### Soletrando

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Soletrando.
Assets: hexagono letra comum, hexagono letra central, palavra aceita, palavra recusada, pangrama, abelha gamer minimalista, colmeia, combo, embaralhar, enviar, lista encontrada, desafio diario.
Sem letras.
```

### Escada de Palavras

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Escada de Palavras.
Assets: degrau vazio, degrau correto, degrau atual, letra mudada, palavra invalida, chegada, dica, caminho completo.
```

### Criptograma

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Criptograma.
Assets: letra cifrada, letra decodificada, slot substituicao, frase bloqueada, frase resolvida, chave, cadeado aberto, cadeado fechado, erro de mapeamento, dica, reset, trofeu.
Sem letras reais.
```

### Stop / Adedonha

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Stop/Adedonha.
Assets: roleta de letra, card categoria, resposta valida, resposta repetida, resposta invalida, cronometro, botao stop sem texto, placar, jogador 1, jogador 2, rodada concluida, trofeu.
```

### Decifre a Palavra

```txt
Gere uma spritesheet 4x2 em fundo chroma verde #00FF00 para Decifre a Palavra.
Assets: dica fechada, dica aberta, palpite correto, palpite errado, pontos por poucas dicas, lampada, envelope de pista, celebracao.
```

## Puzzles De Grade

### Nonograma / Picross

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Nonograma.
Assets: celula vazia, celula pintada, celula marcada X, pista de linha, pista de coluna, linha completa, coluna completa, erro, imagem revelada, caneta, borracha, desafio diario.
```

### Kakuro

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Kakuro.
Assets: casa numero, casa soma diagonal, erro soma, soma correta, candidato pequeno, bloco horizontal, bloco vertical, numero fixo, numero editavel, limpar, verificar, concluir.
Sem numeros especificos.
```

### KenKen / Calcudoku

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para KenKen.
Assets: celula normal, celula selecionada, regiao com borda grossa, operacao soma, operacao subtracao, operacao multiplicacao, operacao divisao, erro regiao, linha correta, coluna correta, dica, concluido.
```

### Hitori

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Hitori.
Assets: celula clara, celula escurecida, celula circulada, conflito repetido, conflito adjacente, caminho branco conectado, numero fixo, marca tentativa, verificar, reset, dica, puzzle concluido.
```

### Futoshiki

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Futoshiki.
Assets: celula numero, celula selecionada, sinal maior que, sinal menor que, linha correta, coluna correta, desigualdade correta, desigualdade errada, candidato, limpar, verificar, concluido.
```

### Akari / Light Up

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Akari.
Assets: casa vazia escura, casa iluminada, lampada, parede preta, parede com numero generico, conflito lampada, casa nao iluminada, marca proibida, raio horizontal, raio vertical, verificar, concluido.
Sem numeros especificos.
```

### Slitherlink

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Slitherlink.
Assets: ponto, borda apagada, borda ligada, borda marcada X, canto do loop, numero generico, conflito ramificacao, conflito numero, loop fechado, ferramenta linha, ferramenta X, concluido.
```

### Hashi / Pontes

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Hashi.
Assets: ilha vazia, ilha satisfeita, ilha com erro, ponte simples horizontal, ponte dupla horizontal, ponte simples vertical, ponte dupla vertical, ponte bloqueada, conexao completa, numero generico, reset, concluido.
```

### Takuzu / Binairo

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Takuzu.
Assets: celula vazia, celula 0, celula 1, conflito tres seguidos, conflito equilibrio, conflito linha repetida, linha correta, coluna correta, candidato 0, candidato 1, verificar, concluido.
Pode renderizar 0 e 1.
```

### Tents and Trees

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Tents and Trees.
Assets: arvore, barraca, grama vazia, marca proibida, barraca valida, barraca conflito, pista de linha generica, pista de coluna generica, par arvore-barraca, diagonal bloqueada, verificar, concluido.
```

### Shikaku

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Shikaku.
Assets: celula vazia, numero ancora generico, retangulo laranja, retangulo branco, borda de selecao, area invalida, area correta, puxador de drag, limpar regiao, verificar, dica, concluido.
```

### Masyu

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Masyu.
Assets: circulo branco, circulo preto, linha reta, curva, caminho invalido, caminho valido, loop fechado, regra branco correta, regra preto correta, ferramenta linha, reset, concluido.
```

### Nurikabe

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Nurikabe.
Assets: terra, agua, numero ilha generico, ilha completa, ilha incompleta, agua conectada, bloco 2x2 erro, separacao invalida, marca tentativa, verificar, dica, concluido.
```

### Fillomino

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Fillomino.
Assets: celula vazia, numero fixo generico, numero editavel, regiao tamanho correto, regiao pequena, regiao grande, fronteira de regiao, conflito adjacente, candidato, limpar, verificar, concluido.
```

### Labirinto

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Labirinto.
Assets: jogador explorador top-down, parede, piso, saida, chave, porta fechada, porta aberta, pegada, neblina/escuro, timer, menor caminho, armadilha, checkpoint, vitoria, seta controle, brilho de objetivo.
```

## Tabuleiro E Estrategia

### Gomoku

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Gomoku.
Assets: peca preta, peca branca, intersecao vazia, tabuleiro madeira escura, movimento valido, ultima jogada, quatro em linha alerta, cinco em linha vitoria, bloqueio IA, ameaça dupla, cursor, trofeu.
```

### Hex

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Hex.
Assets: celula hex vazia, celula P1 laranja, celula P2 branca, lado objetivo P1, lado objetivo P2, caminho conectado, ponte virtual, movimento valido, bloqueio, vitoria conexao, tabuleiro hex, cursor.
```

### Trilha / Moinho

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Trilha/Nine Men's Morris.
Assets: tabuleiro moinho, peca P1, peca P2, ponto vazio, moinho formado, peca removivel, movimento valido, fase colocar, fase mover, fase voar, captura, vitoria.
```

### Gamão / Backgammon

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 8 assets em grade 4x2 para Gamão.
Assets: tabuleiro backgammon aberto top-down, peca laranja, peca branca, dado preto, dado branco, barra central, indicador bear-off, destaque de movimento legal.
Estilo couro/madeira escura premium LucasQC.
```

### Ludo

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 8 assets em grade 4x2 para Ludo.
Assets: tabuleiro ludo top-down sem texto, pino laranja, pino branco, pino preto, pino cinza, dado, casa segura, trilha de movimento.
Visual moderno, nao infantil.
```

### Dominó

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Domino.
Assets: pedra verso, pedra dupla zero, pedra dupla seis, pedra mista generica, mesa escura, ponta esquerda, ponta direita, comprar peça, passar, bloquear jogo, bater, dupla vencedora.
Pode usar pontos nas pedras.
```

### Mahjong Solitaire

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Mahjong Solitaire.
Assets: 16 pecas mahjong premium com simbolos variados: bambu, circulo, caractere, dragao, vento, flor, estacao, moeda, estrela, lua, sol, chave, fogo, agua, montanha, folha.
Todas as pecas no mesmo angulo isometrico leve, sem texto latino.
```

### Quoridor

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Quoridor.
Assets: tabuleiro grade, peao P1, peao P2, parede horizontal, parede vertical, parede invalida, caminho valido, objetivo P1, objetivo P2, salto sobre adversario, contador de paredes, vitoria.
```

### Pentago

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Pentago.
Assets: quadrante 3x3 vazio, peca preta, peca branca, rotacao horario, rotacao anti-horario, quadrante destacado, cinco em linha, tabuleiro completo, cursor colocar, bloqueio, giro animacao frame, vitoria.
```

### Quarto

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Quarto.
Assets: 16 pecas com combinacoes distintas de alto/baixo, claro/escuro, redondo/quadrado, furado/solido.
Cada peca centralizada e legivel, estilo madeira/metal premium LucasQC, sem texto.
```

## Cartas

### Baralho Base LucasQC

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 com cartas base para todos os jogos de cartas.
Assets: verso de carta LucasQC, slot vazio, fundacao vazia copas, fundacao vazia ouros, fundacao vazia paus, fundacao vazia espadas, carta selecionada, carta bloqueada, brilho movimento valido, descarte, estoque, compra, carta virando frame 1, frame 2, frame 3, frame 4.
Sem texto alem dos simbolos de naipe.
```

### Paciência Klondike

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 8 assets em grade 4x2 para Klondike.
Assets: mesa de paciencia escura, pilha tableau, estoque, descarte, fundacao copas, fundacao espadas, movimento automatico para fundacao, vitoria com cartas voando.
Sem cartas especificas completas, apenas assets de mesa e estados.
```

### FreeCell

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 8 assets em grade 4x2 para FreeCell.
Assets: celula livre vazia, celula livre ocupada, fundacao vazia, coluna aberta, carta movivel, carta bloqueada, auto-move, vitoria organizada.
Estilo LucasQC cartes premium.
```

### Spider Solitaire

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Spider Solitaire.
Assets: estoque spider, coluna vazia, sequencia parcial, sequencia completa K-A, remover sequencia, modo 1 naipe, modo 2 naipes, modo 4 naipes, carta bloqueada, carta movivel, desfazer, vitoria.
```

### Copas

```txt
Gere uma spritesheet 4x3 em fundo chroma verde #00FF00 para Copas.
Assets: carta de copas penalidade, dama de espadas, passar cartas, mao do jogador, bot adversario 1, bot adversario 2, bot adversario 3, quebrar copas, rodada/trick, pontuacao baixa, estourar 100, lua/shoot the moon.
```

### Truco Paulista

```txt
Gere uma spritesheet 4x4 em fundo chroma verde #00FF00 para Truco Paulista.
Assets: carta vira, manilha destacada, botao truco sem texto, botao seis sem texto, botao nove sem texto, botao doze sem texto, aceitar, correr, mao ganha, mao perdida, rodada 1, rodada 2, rodada 3, bot adversario, dupla/local, celebracao brasileira discreta.
Sem bandeira realista, manter estilo LucasQC.
```

## Cartas - Prompt Opcional Para Faces Do Baralho

```txt
Gere uma spritesheet 13x4 em fundo chroma verde #00FF00 com um baralho completo 2D minimalista para jogos LucasQC.
Linhas: copas, ouros, paus, espadas. Colunas: A,2,3,4,5,6,7,8,9,10,J,Q,K.
Cada carta inteira centralizada no proprio slot, indices legiveis, naipes claros, cantos arredondados, estilo premium laranja/preto/branco com vermelho apenas para copas/ouros. Sem fundo alem do chroma.
```

## Prompt De Capas Por Categoria

```txt
Gere uma imagem 2D em fundo chroma verde #00FF00 com 8 capas verticais 9:16 separadas em grade 4x2, sem texto.
Capas:
1. Estrategia abstrata com tabuleiro e linhas de ataque
2. Tabuleiro classico com pecas, dados e madeira escura
3. Puzzle de grade com numeros e caminhos
4. Arcade com blocos, cobra e efeitos neon
5. Palavra com tiles, teclado e letras abstratas
6. Cartas com baralho premium e fichas
7. Matematica com somas e regioes de grid
8. Desafio diario com calendario gamer sem numeros
Identidade LucasQC Games, laranja/preto/branco, sem texto renderizado.
```

## Prompt Para Animacoes Comuns

```txt
Gere uma spritesheet 8x4 em fundo chroma magenta puro #FF00FF com 32 frames de animacoes pequenas para jogos 2D.
Linha 1: valid move glow em 8 frames.
Linha 2: capture/remove em 8 frames.
Linha 3: win burst em 8 frames.
Linha 4: invalid move shake/error flash em 8 frames.
Cada frame no mesmo tamanho, efeito centralizado, sem texto, sem camera, sem cenario.
```

## Como Enviar De Volta

Quando gerar as imagens, envie os arquivos com nomes simples:

```txt
global-ui-icons.png
global-effects.png
snake-sprites.png
tetris-pieces.png
cards-base.png
truco-paulista-actions.png
...
```

Se uma imagem tiver varios assets, mantenha a grade inteira. Eu recorto depois. Se vier com fundo chroma verde ou magenta, eu removo o chroma e normalizo.
