import type { GameMeta } from "../types";

export type GameGuide = {
  objective: string;
  setup: string[];
  steps: string[];
  rules: string[];
  controls: string[];
  visual: string[];
  tips: string[];
};

const gameGuides: Record<string, GameGuide> = {
  "tic-tac-toe": {
    objective: "Preencher uma linha com 3 marcas iguais antes do adversario. A linha pode ser horizontal, vertical ou diagonal.",
    setup: [
      "Escolha se vai jogar contra a maquina ou contra outra pessoa no mesmo aparelho.",
      "No modo contra maquina, escolha a dificuldade antes de fazer a primeira jogada.",
    ],
    steps: [
      "Voce joga com X e normalmente comeca a partida.",
      "Toque ou clique em uma casa vazia do tabuleiro 3x3.",
      "O outro jogador coloca O em uma casa vazia.",
      "Continue alternando ate alguem formar uma linha com 3 marcas ou ate o tabuleiro ficar cheio.",
    ],
    rules: [
      "Nao pode jogar em uma casa que ja tem X ou O.",
      "Uma linha com 3 marcas iguais vence imediatamente.",
      "Se todas as 9 casas forem preenchidas sem linha vencedora, a partida termina empatada.",
      "Na dificuldade dificil, a maquina procura jogadas de vitoria e bloqueio com minimax.",
    ],
    controls: [
      "Mouse ou toque: escolha uma casa vazia.",
      "Reiniciar: limpa o tabuleiro e mantem as opcoes escolhidas.",
    ],
    visual: [
      "X e O sao as marcas dos jogadores.",
      "Casas vazias mostram onde ainda da para jogar.",
      "Linhas horizontais, verticais e diagonais contam como vitoria.",
    ],
    tips: [
      "O centro costuma ser uma casa forte porque participa de varias linhas.",
      "Se o adversario tiver duas marcas na mesma linha, bloqueie a terceira casa.",
    ],
  },
  minesweeper: {
    objective: "Revelar todas as casas seguras sem clicar em uma mina.",
    setup: [
      "Escolha o tamanho do campo: facil, medio, dificil ou personalizado.",
      "O primeiro clique abre o campo e nunca deve explodir uma mina.",
    ],
    steps: [
      "Clique em uma casa fechada para revelar o que existe ali.",
      "Leia o numero: ele mostra quantas minas encostam naquela casa, inclusive nas diagonais.",
      "Use bandeiras nas casas que voce acredita que tenham minas.",
      "Continue abrindo casas seguras ate todas as casas sem mina aparecerem.",
    ],
    rules: [
      "Casa vazia abre uma area maior automaticamente quando nao ha minas por perto.",
      "Casa com numero ajuda a deduzir onde estao as minas ao redor.",
      "Clicar em uma mina termina a partida.",
      "Voce vence quando todas as casas sem mina estiverem reveladas.",
    ],
    controls: [
      "Mouse: clique para revelar.",
      "Clique direito: marca ou remove bandeira.",
      "Celular: ative o modo Bandeira e toque nas casas suspeitas.",
    ],
    visual: [
      "Numero 1 quer dizer uma mina em volta; numero 2 quer dizer duas, e assim por diante.",
      "Bandeira marca uma suspeita e evita revelar a casa por engano.",
      "Casas abertas brancas sao seguras; casas fechadas ainda precisam ser deduzidas.",
    ],
    tips: [
      "Comece por areas abertas e use os numeros das bordas para deduzir.",
      "Nao chute cedo: procure numeros que ja tenham a quantidade exata de bandeiras ao redor.",
    ],
  },
  battleship: {
    objective: "Afundar toda a frota inimiga antes que a sua frota seja destruida.",
    setup: [
      "Escolha jogar contra a maquina ou em dois jogadores locais.",
      "Posicione todos os navios no seu tabuleiro antes da fase de ataque.",
      "Use posicionamento aleatorio se quiser comecar mais rapido.",
    ],
    steps: [
      "Na preparacao, coloque cada navio em casas livres, na horizontal ou vertical.",
      "Quando a batalha comecar, escolha uma coordenada no tabuleiro do adversario.",
      "Se acertar um navio, aquela casa vira acerto; se errar, vira agua.",
      "Continue atacando ate descobrir e afundar todos os navios do outro lado.",
    ],
    rules: [
      "Navios nao podem ficar sobrepostos.",
      "Um navio afunda quando todas as casas dele foram atingidas.",
      "No modo local, esconda a tela entre os turnos para nao revelar a frota.",
      "Vence quem afundar primeiro todos os navios adversarios.",
    ],
    controls: [
      "Clique ou toque no tabuleiro para posicionar, mirar ou atacar.",
      "Use o botao de aleatorio para reposicionar a frota automaticamente.",
    ],
    visual: [
      "Agua ou marca de erro indica tiro sem navio.",
      "Explosao ou acerto indica parte de navio atingida.",
      "Navio afundado deixa claro que aquele alvo ja foi completado.",
    ],
    tips: [
      "Depois de acertar, teste casas vizinhas para descobrir a direcao do navio.",
      "Espalhe os tiros no inicio para cobrir mais area do tabuleiro.",
    ],
  },
  hangman: {
    objective: "Descobrir a palavra secreta antes de cometer o limite de erros.",
    setup: [
      "Escolha uma categoria no modo solo ou deixe outra pessoa digitar a palavra no modo local.",
      "A palavra aparece como espacos vazios, um espaco para cada letra.",
    ],
    steps: [
      "Leia a dica e observe o tamanho da palavra.",
      "Escolha uma letra pelo teclado fisico ou virtual.",
      "Se a letra existir, ela aparece em todas as posicoes corretas.",
      "Se a letra nao existir, voce ganha um erro.",
      "Continue ate completar a palavra ou atingir o numero maximo de erros.",
    ],
    rules: [
      "Letras repetidas nao devem contar como nova tentativa.",
      "Cada erro avanca um estagio visual da forca.",
      "Voce vence quando todas as letras forem descobertas.",
      "Voce perde quando os erros chegam ao limite.",
    ],
    controls: [
      "Teclado fisico: pressione uma letra.",
      "Celular ou mouse: toque em uma letra do teclado virtual.",
      "Reiniciar: sorteia ou prepara uma nova palavra.",
    ],
    visual: [
      "Quadrados vazios mostram quantas letras a palavra tem.",
      "Letras reveladas aparecem nas posicoes certas.",
      "A imagem da forca mostra quantos erros ainda pesam contra voce.",
    ],
    tips: [
      "Comece por vogais e consoantes frequentes.",
      "Use a categoria e o tamanho da palavra para eliminar palpites ruins.",
    ],
  },
  memory: {
    objective: "Encontrar todos os pares de cartas iguais.",
    setup: [
      "Escolha jogar solo por desempenho ou em dois jogadores por turno.",
      "As cartas comecam viradas para baixo e embaralhadas.",
    ],
    steps: [
      "Vire uma carta e memorize o simbolo.",
      "Vire uma segunda carta tentando encontrar o par.",
      "Se as duas forem iguais, o par fica aberto.",
      "Se forem diferentes, elas voltam a ficar escondidas.",
      "Continue ate todos os pares serem encontrados.",
    ],
    rules: [
      "No modo local, quem acerta um par continua jogando.",
      "No modo solo, tente terminar com menos movimentos e menos tempo.",
      "A partida termina quando nenhuma carta fechada resta no tabuleiro.",
    ],
    controls: [
      "Clique ou toque em uma carta fechada para revelar.",
      "Use reiniciar para embaralhar uma nova partida.",
    ],
    visual: [
      "Verso da carta indica carta escondida.",
      "Duas figuras iguais formam um par valido.",
      "Cartas abertas permanentemente ja foram resolvidas.",
    ],
    tips: [
      "Monte mentalmente um mapa: canto superior, centro, bordas.",
      "Quando errar, ainda assim memorize as duas cartas vistas.",
    ],
  },
  "connect-four": {
    objective: "Conectar 4 pecas da sua cor em linha, coluna ou diagonal antes do adversario.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "No modo contra maquina, defina a dificuldade.",
    ],
    steps: [
      "Escolha uma coluna do tabuleiro.",
      "Sua peca cai ate a casa livre mais baixa dessa coluna.",
      "O outro jogador faz o mesmo em outra coluna ou na mesma, se ainda houver espaco.",
      "Procure criar uma linha de 4 pecas conectadas.",
    ],
    rules: [
      "Nao da para colocar peca em coluna cheia.",
      "A conexao pode ser horizontal, vertical ou diagonal.",
      "Se alguem conecta 4, a partida acaba imediatamente.",
      "Se o tabuleiro encher sem vencedor, a partida empata.",
    ],
    controls: [
      "Mouse ou toque: selecione a coluna onde a peca deve cair.",
      "Reiniciar: limpa o tabuleiro.",
    ],
    visual: [
      "Cada coluna funciona como um tubo: a peca sempre cai para baixo.",
      "Quatro pecas grudadas em qualquer direcao formam a vitoria.",
      "Colunas quase cheias limitam as proximas jogadas.",
    ],
    tips: [
      "O centro cria mais possibilidades de linhas do que as bordas.",
      "Fique atento a ameacas duplas, quando uma jogada cria duas formas de vencer.",
    ],
  },
  checkers: {
    objective: "Capturar ou bloquear todas as pecas do adversario.",
    setup: [
      "Escolha jogar contra maquina ou contra outra pessoa localmente.",
      "As pecas comecam nas casas escuras do tabuleiro.",
    ],
    steps: [
      "Selecione uma peca sua.",
      "Escolha um destino destacado para mover ou capturar.",
      "Para capturar, salte por cima de uma peca adversaria para a casa vazia logo depois dela.",
      "Continue jogando ate um lado ficar sem movimentos ou sem pecas.",
    ],
    rules: [
      "Capturas sao obrigatorias quando existem.",
      "Uma peca comum anda para frente na diagonal.",
      "Ao chegar ao fim do tabuleiro, a peca vira dama e ganha mais liberdade.",
      "Em capturas multiplas, continue capturando enquanto houver salto legal.",
    ],
    controls: [
      "Clique ou toque em uma peca e depois em uma casa de destino.",
      "Use reiniciar para recomecar a partida.",
    ],
    visual: [
      "Marcadores no tabuleiro indicam casas legais para a peca escolhida.",
      "Peca promovida aparece como dama ou rei.",
      "Peca capturada sai do tabuleiro.",
    ],
    tips: [
      "Nao entregue pecas de graca: conte se o adversario podera saltar na volta.",
      "Promover uma peca costuma virar a partida.",
    ],
  },
  chess: {
    objective: "Dar xeque-mate no rei adversario, ou seja, atacar o rei sem que ele tenha defesa legal.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "No modo contra maquina, selecione a dificuldade.",
      "As pecas brancas comecam a partida.",
    ],
    steps: [
      "Clique em uma peca sua para ver ou escolher seus movimentos.",
      "Mova a peca para uma casa legal.",
      "Se a peca for para uma casa ocupada por inimigo, ela captura aquela peca.",
      "Proteja seu rei e tente atacar o rei adversario.",
      "Quando um rei esta atacado, o jogador precisa sair do xeque.",
    ],
    rules: [
      "Rei anda uma casa; dama anda em linhas e diagonais; torre anda em linhas; bispo anda em diagonais; cavalo anda em L; peao anda para frente e captura na diagonal.",
      "Roque, en passant, promocao, xeque, xeque-mate e empates seguem as regras legais da engine.",
      "Nao e permitido fazer uma jogada que deixe o proprio rei em xeque.",
      "A partida tambem pode empatar por afogamento ou falta de material, conforme a engine detectar.",
    ],
    controls: [
      "Mouse ou toque: selecione uma peca e depois a casa de destino.",
      "Promocao: escolha a nova peca quando o peao chegar ao final.",
    ],
    visual: [
      "Casas destacadas indicam selecao ou alvos possiveis.",
      "Efeito de captura marca uma peca tomada.",
      "Efeito de xeque avisa que o rei esta sob ataque.",
    ],
    tips: [
      "No comeco, desenvolva cavalos e bispos e proteja o rei.",
      "Antes de capturar, pergunte se a sua peca ficara defendida ou perdida.",
    ],
  },
  reversi: {
    objective: "Terminar a partida com mais pecas da sua cor no tabuleiro.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "O tabuleiro comeca com quatro pecas no centro.",
    ],
    steps: [
      "Jogue em uma casa valida destacada.",
      "Sua nova peca precisa prender uma ou mais pecas adversarias entre ela e outra peca sua.",
      "As pecas presas viram para a sua cor.",
      "Os turnos continuam ate ninguem ter jogada ou o tabuleiro encher.",
    ],
    rules: [
      "Uma jogada so e valida se virar pelo menos uma peca adversaria.",
      "Se um jogador nao tem jogada valida, ele passa a vez.",
      "Cantos sao muito fortes porque nao podem ser virados.",
      "Vence quem tiver mais pecas no final.",
    ],
    controls: [
      "Clique ou toque em uma casa valida destacada.",
      "Reiniciar: volta ao centro inicial.",
    ],
    visual: [
      "Marcadores mostram onde voce pode jogar agora.",
      "Pecas viradas mudam de cor depois da jogada.",
      "O placar mostra a maioria atual, mas o final pode mudar rapido.",
    ],
    tips: [
      "Evite entregar cantos para o adversario.",
      "Mobilidade importa: tente deixar o adversario com poucas jogadas boas.",
    ],
  },
  mancala: {
    objective: "Guardar mais sementes na sua mancala do que o adversario ate o fim da partida.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "Cada poco pequeno comeca com sementes; as mancalas grandes ficam nas pontas.",
    ],
    steps: [
      "Escolha um poco do seu lado que tenha sementes.",
      "Pegue todas as sementes daquele poco.",
      "Distribua uma semente por casa, seguindo a direcao do tabuleiro.",
      "Se a ultima semente cair na sua mancala, voce joga de novo.",
      "Quando um lado fica vazio, a partida termina e as sementes restantes sao recolhidas.",
    ],
    rules: [
      "Voce nao coloca sementes na mancala do adversario.",
      "Se a ultima semente cair em um poco vazio do seu lado, pode capturar sementes do poco oposto.",
      "O placar final e a quantidade de sementes nas mancalas.",
      "Vence quem tiver mais sementes guardadas.",
    ],
    controls: [
      "Clique ou toque em um poco do seu lado.",
      "Reiniciar: redistribui as sementes iniciais.",
    ],
    visual: [
      "Pocos pequenos sao casas de movimento.",
      "Mancalas maiores nas pontas sao os depositos de pontuacao.",
      "Brilho ou destaque indica uma jogada importante ou selecionada.",
    ],
    tips: [
      "Conte onde a ultima semente vai cair antes de escolher o poco.",
      "Turnos extras podem valer mais que uma captura pequena.",
    ],
  },
  nim: {
    objective: "Pegar o ultimo item da mesa, removendo itens de uma pilha por vez.",
    setup: [
      "Escolha jogar contra maquina ou contra outra pessoa localmente.",
      "Observe quantos itens existem em cada pilha.",
    ],
    steps: [
      "Na sua vez, escolha uma unica pilha.",
      "Remova uma quantidade permitida de itens dessa pilha.",
      "O adversario faz o mesmo em outra pilha ou na mesma, se ainda restarem itens.",
      "Continue ate alguem remover o ultimo item.",
    ],
    rules: [
      "Cada jogada mexe em apenas uma pilha.",
      "Nao e permitido remover zero itens.",
      "Na variante atual, quem pega o ultimo item vence.",
      "A IA dificil usa a ideia de nim-sum para procurar jogadas vencedoras.",
    ],
    controls: [
      "Clique ou toque na pilha e na quantidade mostrada pela interface.",
      "Reiniciar: restaura as pilhas iniciais.",
    ],
    visual: [
      "Cada pilha mostra quantos itens ainda podem ser removidos.",
      "O destaque de dificuldade indica o comportamento da maquina.",
      "O placar ou status mostra de quem e a vez.",
    ],
    tips: [
      "Tente deixar uma posicao sem vantagem matematica para o adversario.",
      "No fim, conte se voce consegue forcar a ultima retirada.",
    ],
  },
  rpsls: {
    objective: "Escolher uma opcao que vença a opcao do adversario.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "No modo local, cada jogador escolhe em uma etapa separada para manter segredo.",
    ],
    steps: [
      "Escolha Pedra, Papel, Tesoura, Lagarto ou Spock.",
      "O adversario faz a propria escolha.",
      "As escolhas sao reveladas ao mesmo tempo.",
      "Quem tiver a opcao vencedora marca a rodada.",
    ],
    rules: [
      "Tesoura corta Papel e decapita Lagarto.",
      "Papel cobre Pedra e refuta Spock.",
      "Pedra quebra Tesoura e esmaga Lagarto.",
      "Lagarto envenena Spock e come Papel.",
      "Spock vaporiza Pedra e quebra Tesoura.",
      "Escolhas iguais empatam.",
    ],
    controls: [
      "Clique ou toque no icone da sua escolha.",
      "Use nova rodada para jogar de novo.",
    ],
    visual: [
      "Cada icone representa uma opcao.",
      "O resultado mostra quem venceu e por qual relacao.",
      "No modo local, a interface separa as escolhas para esconder a decisao.",
    ],
    tips: [
      "Cada opcao vence duas e perde para duas, entao nao existe escolha sempre melhor.",
      "Contra pessoas, varie para nao ficar previsivel.",
    ],
  },
  mastermind: {
    objective: "Descobrir a sequencia secreta de cores usando pistas depois de cada palpite.",
    setup: [
      "Escolha a dificuldade, que muda tamanho ou variedade da senha.",
      "Observe quantas posicoes existem na linha de palpite.",
    ],
    steps: [
      "Escolha cores para preencher todas as posicoes do palpite.",
      "Envie o palpite quando a linha estiver completa.",
      "Leia os pinos de feedback.",
      "Use o feedback para montar um novo palpite mais preciso.",
      "Repita ate acertar a senha ou acabar as tentativas.",
    ],
    rules: [
      "Pino preto significa cor certa na posicao certa.",
      "Pino branco significa cor existe na senha, mas esta em outra posicao.",
      "A ordem dos pinos de feedback nao revela exatamente qual cor recebeu qual pista.",
      "Vence ao acertar todas as cores na ordem correta.",
    ],
    controls: [
      "Clique ou toque nas cores para montar o palpite.",
      "Use confirmar para enviar, voltar para apagar e limpar para recomecar a linha.",
    ],
    visual: [
      "Cores grandes sao o seu palpite.",
      "Pinos pequenos pretos e brancos sao as pistas.",
      "Linhas antigas ficam visiveis para comparar deducoes.",
    ],
    tips: [
      "Comece testando cores diferentes para descobrir quais aparecem.",
      "Depois foque em trocar posicoes sem perder informacao.",
    ],
  },
  sudoku: {
    objective: "Completar a grade 9x9 com numeros de 1 a 9 sem repetir em linhas, colunas e blocos 3x3.",
    setup: [
      "Escolha a dificuldade.",
      "Numeros ja preenchidos sao pistas fixas e nao devem ser alterados.",
    ],
    steps: [
      "Selecione uma casa vazia.",
      "Observe a linha, a coluna e o bloco 3x3 daquela casa.",
      "Escolha um numero que ainda nao aparece nesses tres grupos.",
      "Use anotacoes quando ainda houver mais de uma possibilidade.",
      "Complete todas as casas e verifique o tabuleiro.",
    ],
    rules: [
      "Cada linha precisa conter 1 a 9 uma unica vez.",
      "Cada coluna precisa conter 1 a 9 uma unica vez.",
      "Cada bloco 3x3 precisa conter 1 a 9 uma unica vez.",
      "Numeros conflitantes indicam erro de logica.",
    ],
    controls: [
      "Clique ou toque em uma casa e depois em um numero.",
      "Modo anotacao: registra candidatos pequenos em vez de resposta final.",
      "Borracha remove um numero editavel.",
    ],
    visual: [
      "Casa selecionada mostra onde o proximo numero sera aplicado.",
      "Casas relacionadas ajudam a conferir linha, coluna e bloco.",
      "Pistas fixas aparecem com visual diferente das respostas do jogador.",
    ],
    tips: [
      "Procure numeros que so podem caber em uma casa de um bloco.",
      "Nao chute cedo; anotacoes ajudam a evitar contradicoes.",
    ],
  },
  "2048": {
    objective: "Juntar blocos iguais para formar numeros maiores e tentar chegar ao bloco 2048.",
    setup: [
      "O tabuleiro comeca com poucos blocos.",
      "A cada movimento, todos os blocos deslizam na mesma direcao.",
    ],
    steps: [
      "Escolha uma direcao: cima, baixo, esquerda ou direita.",
      "Todos os blocos deslizam ate bater na borda ou em outro bloco.",
      "Blocos iguais que colidem se somam.",
      "Um novo bloco aparece depois de um movimento valido.",
      "Continue ate formar 2048 ou ate nao haver movimentos.",
    ],
    rules: [
      "Cada bloco so combina uma vez por movimento.",
      "Blocos diferentes nao se juntam.",
      "Se o tabuleiro enche e nao existe combinacao possivel, a partida acaba.",
      "A pontuacao aumenta conforme os valores combinados.",
    ],
    controls: [
      "Teclado: setas ou WASD.",
      "Celular: use os botoes na tela.",
    ],
    visual: [
      "Cores e numeros maiores indicam blocos mais valiosos.",
      "Casas vazias mostram espaco para respirar.",
      "O maior bloco e o foco do planejamento.",
    ],
    tips: [
      "Tente manter o maior bloco em um canto.",
      "Evite alternar direcoes sem plano, porque isso bagunca a grade rapidamente.",
    ],
  },
  snake: {
    objective: "Comer itens para crescer sem bater nas paredes ou no proprio corpo.",
    setup: [
      "Escolha velocidade ou modo disponivel.",
      "A cobrinha comeca pequena e anda sozinha em uma direcao.",
    ],
    steps: [
      "Mude a direcao antes de chegar no obstaculo.",
      "Guie a cabeca ate a comida.",
      "Ao comer, a cobrinha cresce e a pontuacao aumenta.",
      "Continue criando caminho livre para nao bater no corpo.",
    ],
    rules: [
      "A cobrinha nao pode voltar diretamente para a direcao oposta.",
      "Bater na parede termina a partida quando paredes estao ativas.",
      "Bater no proprio corpo termina a partida.",
      "Itens especiais podem dar bonus ou mudar ritmo conforme o modo.",
    ],
    controls: [
      "Teclado: setas ou WASD.",
      "Celular: botoes na tela ou gesto de arrastar/deslizar.",
    ],
    visual: [
      "Cabeca indica a direcao atual.",
      "Comida aparece como item destacado no grid.",
      "Corpo maior significa mais pontos, mas menos espaco seguro.",
    ],
    tips: [
      "Planeje curvas largas e evite se fechar em cantos.",
      "Quando estiver grande, rode pelas bordas para ganhar tempo.",
    ],
  },
  pong: {
    objective: "Rebater a bola com sua raquete e fazer o adversario deixar a bola passar.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "Defina a pontuacao alvo antes de iniciar.",
    ],
    steps: [
      "Mova sua raquete para ficar na frente da bola.",
      "Rebata a bola para o lado adversario.",
      "Se o adversario nao rebater, voce marca ponto.",
      "A rodada reinicia depois de cada ponto.",
      "Vence quem atingir a pontuacao alvo.",
    ],
    rules: [
      "A bola quica nas bordas superior e inferior.",
      "A bola muda de direcao quando toca uma raquete.",
      "O ponto sai quando a bola passa por uma lateral.",
      "O ritmo pode acelerar durante a troca.",
    ],
    controls: [
      "Jogador 1: W/S ou controles na tela.",
      "Jogador 2 local: setas para cima/baixo.",
      "Celular: use botoes ou toque conforme a interface.",
    ],
    visual: [
      "Raquetes ficam nas laterais.",
      "Bola no centro e o objeto que deve ser bloqueado.",
      "Placar mostra quem esta perto da vitoria.",
    ],
    tips: [
      "Rebater com a ponta da raquete pode mudar melhor o angulo.",
      "Volte para o centro depois de uma defesa para cobrir mais espaco.",
    ],
  },
  tetris: {
    objective: "Encaixar pecas caindo para completar linhas horizontais e evitar que a pilha chegue ao topo.",
    setup: [
      "A partida comeca com uma peca caindo e uma fila de proximas pecas.",
      "O nivel aumenta conforme voce limpa linhas.",
    ],
    steps: [
      "Mova a peca para a esquerda ou direita enquanto ela cai.",
      "Gire a peca para encaixar melhor.",
      "Use queda rapida quando tiver certeza do lugar.",
      "Complete uma linha inteira para remove-la.",
      "Continue limpando linhas antes que as pecas alcancem o topo.",
    ],
    rules: [
      "Linha completa desaparece e pontua.",
      "Remover varias linhas de uma vez vale mais.",
      "Quanto maior o nivel, mais rapido as pecas caem.",
      "A partida acaba quando uma nova peca nao consegue entrar no campo.",
    ],
    controls: [
      "Teclado: setas ou WASD para mover e girar.",
      "Espaco: queda rapida quando disponivel.",
      "Celular: botoes de mover, girar e cair.",
    ],
    visual: [
      "Campo principal mostra a peca atual e a pilha.",
      "Peca fantasma ou previsao mostra onde ela pode cair, quando disponivel.",
      "Fila lateral ajuda a planejar as proximas jogadas.",
    ],
    tips: [
      "Mantenha a superficie baixa e sem buracos.",
      "Deixe um corredor vertical se quiser fazer quatro linhas de uma vez.",
    ],
  },
  sokoban: {
    objective: "Empurrar todas as caixas ate os alvos marcados.",
    setup: [
      "Escolha ou inicie uma fase.",
      "Observe paredes, caixas, alvos e a posicao do personagem.",
    ],
    steps: [
      "Mova o personagem pelo labirinto.",
      "Fique atras de uma caixa para empurra-la.",
      "Empurre a caixa ate um alvo.",
      "Repita ate todas as caixas ficarem sobre alvos.",
    ],
    rules: [
      "Voce pode empurrar caixas, mas nao puxar.",
      "So da para empurrar uma caixa por vez.",
      "Caixa presa em canto sem alvo geralmente trava a fase.",
      "A fase termina quando todas as caixas estao nos alvos.",
    ],
    controls: [
      "Teclado: setas ou WASD.",
      "Celular: botoes direcionais.",
      "Desfazer: volta a ultima jogada quando disponivel.",
    ],
    visual: [
      "Parede bloqueia movimento.",
      "Alvo indica onde uma caixa precisa terminar.",
      "Caixa sobre alvo costuma mudar de aparencia.",
    ],
    tips: [
      "Pense no destino da caixa antes de empurrar.",
      "Use desfazer assim que perceber que prendeu uma caixa.",
    ],
  },
  "dots-boxes": {
    objective: "Fechar mais caixas do que o adversario desenhando linhas entre pontos.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "O tabuleiro comeca como uma grade de pontos sem linhas.",
    ],
    steps: [
      "Clique em um segmento vazio entre dois pontos vizinhos.",
      "O segmento vira uma linha da sua jogada.",
      "Se voce fechar o quarto lado de uma caixa, ganha aquela caixa.",
      "Quem fecha caixa joga novamente.",
      "A partida acaba quando todas as linhas foram desenhadas.",
    ],
    rules: [
      "So valem linhas horizontais ou verticais entre pontos vizinhos.",
      "Uma caixa pertence ao jogador que desenhou o quarto lado dela.",
      "Fechar duas caixas com uma linha conta as duas.",
      "Vence quem tiver mais caixas no final.",
    ],
    controls: [
      "Mouse ou toque: escolha uma linha vazia.",
      "Desfazer ou reiniciar quando a interface permitir.",
    ],
    visual: [
      "Pontos sao os cantos das caixas.",
      "Linhas ativas mostram segmentos ja escolhidos.",
      "Caixas coloridas mostram pontos conquistados.",
    ],
    tips: [
      "Evite criar o terceiro lado de uma caixa sem necessidade.",
      "No fim do jogo, cadeias longas de caixas podem decidir tudo.",
    ],
  },
  termo: {
    objective: "Descobrir uma ou mais palavras de 5 letras usando as cores de feedback depois de cada tentativa.",
    setup: [
      "Escolha Termo, Dueto, Trio, Quarteto ou modo custom.",
      "A mesma tentativa vale para todos os tabuleiros ativos.",
    ],
    steps: [
      "Digite uma palavra valida de 5 letras.",
      "Pressione Enter para enviar.",
      "Leia as cores de cada letra em cada tabuleiro.",
      "Use as pistas para escolher a proxima tentativa.",
      "Resolva todos os tabuleiros antes de acabar o limite de tentativas.",
    ],
    rules: [
      "Letra verde esta certa e na posicao correta.",
      "Letra amarela existe na palavra, mas esta em outra posicao.",
      "Letra escura nao aparece naquela palavra, respeitando repeticoes.",
      "Cada modo aumenta a quantidade de palavras que precisam ser resolvidas ao mesmo tempo.",
    ],
    controls: [
      "Teclado fisico: digite letras, Backspace apaga, Enter envia.",
      "Celular: use o teclado virtual.",
      "Configuracoes: mudam quantidade de tabuleiros e opcoes da partida.",
    ],
    visual: [
      "Cada linha e uma tentativa.",
      "Cada coluna e uma posicao da palavra.",
      "O teclado tambem muda de cor para resumir as melhores pistas das letras.",
    ],
    tips: [
      "Comece com palavra que teste vogais e consoantes comuns.",
      "No modo com varios tabuleiros, uma tentativa pode ajudar uma palavra e atrapalhar outra; acompanhe todas.",
    ],
  },
  connections: {
    objective: "Encontrar 4 grupos de 4 palavras que tenham uma relacao em comum.",
    setup: [
      "A rodada mostra 16 palavras embaralhadas.",
      "Cada grupo resolvido sai da area principal ou fica destacado.",
    ],
    steps: [
      "Leia todas as palavras antes de selecionar.",
      "Escolha 4 palavras que parecam pertencer ao mesmo tema.",
      "Envie o grupo.",
      "Se estiver certo, o grupo e revelado.",
      "Se estiver errado, voce perde uma vida ou soma um erro.",
    ],
    rules: [
      "Cada palavra pertence a apenas um grupo correto.",
      "Grupos podem usar relacoes obvias, sinonimos, categorias ou pegadinhas.",
      "Selecionar menos ou mais de 4 palavras nao envia um grupo valido.",
      "A rodada termina quando todos os grupos sao achados ou os erros acabam.",
    ],
    controls: [
      "Clique ou toque em uma palavra para selecionar ou desmarcar.",
      "Enviar grupo: valida as 4 selecionadas.",
      "Nova rodada: embaralha uma nova lista.",
    ],
    visual: [
      "Palavras selecionadas ficam destacadas.",
      "Grupos encontrados aparecem juntos com o nome da categoria.",
      "Contador de erros mostra quanto risco ainda resta.",
    ],
    tips: [
      "Procure primeiro grupos muito fortes, como cores, jogos ou naipes.",
      "Cuidado com palavras que cabem em mais de uma ideia; elas costumam ser a armadilha.",
    ],
  },
  "word-search": {
    objective: "Encontrar todas as palavras escondidas na grade de letras.",
    setup: [
      "Escolha o tamanho da grade.",
      "A lista lateral mostra quais palavras precisam ser encontradas.",
    ],
    steps: [
      "Procure a primeira letra de uma palavra da lista.",
      "Siga em linha reta na horizontal, vertical ou diagonal.",
      "Clique na primeira letra e depois na ultima letra da palavra.",
      "Se a linha formar uma palavra da lista, ela fica marcada.",
      "Continue ate marcar todas as palavras.",
    ],
    rules: [
      "Palavras podem aparecer de frente para tras ou de tras para frente.",
      "A direcao precisa ser uma linha reta.",
      "Letras podem fazer parte de mais de uma palavra.",
      "A partida termina quando todas as palavras da lista forem achadas.",
    ],
    controls: [
      "Mouse ou toque: selecione inicio e fim da palavra.",
      "Nova grade: gera outro caca-palavras.",
    ],
    visual: [
      "Letra inicial selecionada fica destacada.",
      "Palavras encontradas ficam coloridas na grade.",
      "A lista mostra o progresso de palavras restantes.",
    ],
    tips: [
      "Procure letras raras primeiro, como J, X, Z ou Q.",
      "Depois de achar o inicio, confira todas as 8 direcoes ao redor.",
    ],
  },
  crossword: {
    objective: "Preencher a cruzadinha com palavras que batem nas dicas e nos cruzamentos.",
    setup: [
      "Leia as dicas horizontais e verticais.",
      "Observe quantas casas cada resposta possui.",
    ],
    steps: [
      "Escolha uma casa branca da grade.",
      "Digite a letra correspondente a dica.",
      "Use cruzamentos para confirmar letras de outras respostas.",
      "Preencha todas as casas brancas.",
      "Use verificar para saber se a grade esta correta.",
    ],
    rules: [
      "Casas pretas nao recebem letras.",
      "Uma letra em cruzamento vale para a palavra horizontal e para a vertical.",
      "Todas as letras precisam estar corretas para concluir.",
      "Respostas normalmente ignoram espacos e acentos quando a interface pede uma letra por casa.",
    ],
    controls: [
      "Clique ou toque em uma casa e digite a letra.",
      "Verificar: confere a solucao.",
      "Limpar: apaga suas respostas.",
    ],
    visual: [
      "Casas brancas sao preenchiveis.",
      "Casas escuras separam palavras.",
      "Dicas horizontais e verticais indicam o sentido da resposta.",
    ],
    tips: [
      "Comece pelas dicas que voce sabe com certeza.",
      "Uma unica letra de cruzamento pode destravar uma palavra dificil.",
    ],
  },
  anagrams: {
    objective: "Reorganizar letras embaralhadas para formar a palavra correta.",
    setup: [
      "A rodada mostra um conjunto de letras fora de ordem.",
      "Cada resposta correta avanca para a proxima rodada.",
    ],
    steps: [
      "Leia todas as letras disponiveis.",
      "Imagine combinacoes que usem todas as letras.",
      "Digite a palavra que voce acredita ser correta.",
      "Envie a resposta.",
      "Continue ate concluir as rodadas.",
    ],
    rules: [
      "A resposta precisa usar as letras da rodada.",
      "Ordem importa: as mesmas letras podem formar palavras diferentes.",
      "Resposta errada nao avanca a rodada.",
      "A pontuacao aumenta a cada acerto.",
    ],
    controls: [
      "Digite no campo de resposta.",
      "Enviar: valida a palavra.",
      "Reiniciar: volta para a primeira rodada.",
    ],
    visual: [
      "Bloco de letras mostra o material que voce precisa reorganizar.",
      "Rodada indica seu progresso.",
      "Score mostra os acertos acumulados.",
    ],
    tips: [
      "Procure vogais para descobrir a estrutura da palavra.",
      "Teste prefixos e finais comuns, como RE, AO, AR e ES.",
    ],
  },
  "spelling-bee": {
    objective: "Formar o maior numero possivel de palavras usando as letras disponiveis, sempre com a letra central.",
    setup: [
      "Observe o conjunto de letras e identifique a letra central obrigatoria.",
      "As letras podem ser reutilizadas dentro da mesma palavra quando o jogo permitir.",
    ],
    steps: [
      "Monte uma palavra usando apenas as letras da colmeia.",
      "Confira se a palavra inclui a letra central.",
      "Digite ou toque nas letras em ordem.",
      "Envie a palavra.",
      "Continue encontrando novas palavras sem repetir.",
    ],
    rules: [
      "Toda resposta precisa conter a letra central.",
      "Palavras repetidas nao contam novamente.",
      "Palavras fora da lista da rodada sao rejeitadas.",
      "Quanto mais palavras encontradas, maior o progresso.",
    ],
    controls: [
      "Clique nas letras ou digite pelo teclado.",
      "Enviar: valida a palavra atual.",
      "Apagar ou limpar remove letras digitadas.",
    ],
    visual: [
      "Letra central costuma ficar destacada.",
      "Lista de encontradas mostra o que ja pontuou.",
      "Mensagem de status explica rejeicoes, repeticoes e acertos.",
    ],
    tips: [
      "Teste plural, feminino, verbos e palavras derivadas quando forem aceitas.",
      "Comece combinando a letra central com cada vogal disponivel.",
    ],
  },
  "word-ladder": {
    objective: "Transformar a palavra inicial na palavra final mudando uma letra por vez.",
    setup: [
      "Leia a palavra de partida e a palavra alvo.",
      "Todas as palavras intermediarias precisam ser validas.",
    ],
    steps: [
      "Digite uma nova palavra com o mesmo tamanho.",
      "Mude apenas uma letra em relacao a palavra anterior.",
      "Envie a palavra.",
      "Repita criando uma escada ate chegar na palavra final.",
    ],
    rules: [
      "Nao vale mudar duas ou mais letras no mesmo passo.",
      "Nao vale inventar palavra fora do dicionario da rodada.",
      "As palavras devem manter o mesmo numero de letras.",
      "A escada termina quando a palavra atual for exatamente a palavra alvo.",
    ],
    controls: [
      "Digite a proxima palavra no campo.",
      "Enviar: adiciona o passo se for valido.",
    ],
    visual: [
      "Lista de passos mostra a transformacao palavra por palavra.",
      "Palavra inicial e alvo indicam origem e destino.",
      "Mensagem de erro aponta quando a mudanca nao e valida.",
    ],
    tips: [
      "Tente aproximar uma letra por vez da palavra final.",
      "As vezes e preciso dar um passo lateral para formar uma palavra real.",
    ],
  },
  cryptogram: {
    objective: "Decifrar uma frase substituindo cada letra codificada pela letra real correta.",
    setup: [
      "A frase aparece cifrada com letras trocadas.",
      "A mesma letra cifrada representa sempre a mesma letra real.",
    ],
    steps: [
      "Observe letras repetidas e tamanhos das palavras.",
      "Escolha uma letra cifrada e teste uma substituicao.",
      "A substituicao aparece em todos os lugares onde aquela letra ocorre.",
      "Use padroes de palavras comuns para confirmar.",
      "Complete o mapa ate a frase fazer sentido.",
    ],
    rules: [
      "Uma letra cifrada nao deve representar duas letras diferentes.",
      "A mesma letra real tambem nao deve ser usada por duas letras cifradas, salvo regra especial da interface.",
      "Espacos e pontuacao ajudam a ler a frase.",
      "A solucao precisa formar a frase original completa.",
    ],
    controls: [
      "Preencha o mapa de substituicoes ou campos de letras.",
      "Apague uma substituicao se ela causar conflito.",
    ],
    visual: [
      "Texto cifrado mostra o enigma original.",
      "Mapa de letras mostra suas escolhas atuais.",
      "Letras repetidas sao pistas fortes de padrao.",
    ],
    tips: [
      "Procure palavras curtas comuns, como A, O, DE, E, EM.",
      "Se uma escolha quebrar varias palavras, volte cedo.",
    ],
  },
  stop: {
    objective: "Responder categorias com palavras que comecem pela letra sorteada e marcar mais pontos.",
    setup: [
      "Sorteie ou receba uma letra da rodada.",
      "Leia as categorias que precisam ser preenchidas.",
    ],
    steps: [
      "Para cada categoria, pense em uma palavra que comece com a letra da rodada.",
      "Digite suas respostas nos campos.",
      "Quando terminar, encerre a rodada.",
      "Compare respostas e some pontos conforme validade e repeticao.",
    ],
    rules: [
      "Todas as respostas precisam comecar com a letra sorteada.",
      "Resposta vazia vale zero.",
      "Resposta valida e unica vale mais do que resposta repetida.",
      "No modo local, jogadores devem combinar criterio de validade antes da partida.",
    ],
    controls: [
      "Digite cada resposta no campo da categoria.",
      "Encerrar rodada: trava respostas e calcula a rodada.",
      "Nova rodada: sorteia outra letra.",
    ],
    visual: [
      "Letra da rodada e o filtro principal.",
      "Cada linha ou campo corresponde a uma categoria.",
      "Pontuacao mostra o resultado da rodada atual.",
    ],
    tips: [
      "Preencha primeiro categorias que voce sabe rapido.",
      "Palavras mais especificas reduzem chance de empate com outro jogador.",
    ],
  },
  "guess-word": {
    objective: "Descobrir a palavra secreta usando o menor numero possivel de dicas.",
    setup: [
      "A rodada tem uma palavra escondida.",
      "As dicas aparecem em ordem progressiva, da mais geral para a mais direta.",
    ],
    steps: [
      "Leia a primeira dica.",
      "Digite um palpite se ja souber.",
      "Se precisar, abra outra dica.",
      "Envie o palpite.",
      "Tente acertar antes de usar muitas dicas.",
    ],
    rules: [
      "Cada dica usada reduz a pontuacao potencial.",
      "Palpite errado nao conclui a rodada.",
      "A palavra precisa bater com a resposta esperada da rodada.",
      "A rodada termina ao acertar a palavra.",
    ],
    controls: [
      "Abrir dica: revela a proxima pista.",
      "Campo de palpite: digite sua resposta.",
      "Enviar: confere o palpite.",
    ],
    visual: [
      "Dicas abertas mostram o caminho de raciocinio.",
      "Campo de resposta e onde entra a palavra final.",
      "Score indica quanto valeu acertar com poucas dicas.",
    ],
    tips: [
      "Antes de abrir dica nova, tente listar possibilidades.",
      "Use a quantidade de letras ou tema quando a interface mostrar essa informacao.",
    ],
  },
  nonogram: {
    objective: "Pintar as casas corretas da grade seguindo pistas numericas para revelar uma imagem.",
    setup: [
      "Pistas ficam nas linhas e colunas.",
      "Cada numero indica um bloco continuo de casas pintadas.",
    ],
    steps: [
      "Leia os numeros de uma linha ou coluna.",
      "Calcule onde blocos pintados podem caber.",
      "Pinte casas que com certeza fazem parte de um bloco.",
      "Marque como vazias as casas que com certeza nao serao pintadas.",
      "Cruze informacoes de linhas e colunas ate completar a imagem.",
    ],
    rules: [
      "Entre dois blocos numerados precisa existir pelo menos uma casa vazia.",
      "A ordem dos numeros e a ordem dos blocos na linha ou coluna.",
      "Todas as pistas precisam ser satisfeitas ao mesmo tempo.",
      "Pintar casa errada pode contradizer outra pista.",
    ],
    controls: [
      "Clique ou toque para alternar uma celula.",
      "Use o modo de marcacao vazio quando disponivel.",
    ],
    visual: [
      "Numeros fora da grade sao as pistas.",
      "Casas pintadas formam a imagem final.",
      "Marcacoes de vazio ajudam a separar blocos.",
    ],
    tips: [
      "Comece por linhas com numeros grandes, porque elas deixam menos possibilidades.",
      "Se uma linha de 5 tem pista 5, ela e toda pintada.",
    ],
  },
  kakuro: {
    objective: "Preencher grupos com numeros de 1 a 9 para que cada soma bata exatamente com a pista.",
    setup: [
      "Casas com pistas indicam somas para a direita e para baixo.",
      "Casas brancas recebem numeros.",
    ],
    steps: [
      "Escolha um grupo de casas ligado a uma soma.",
      "Determine quais combinacoes de numeros podem formar aquela soma.",
      "Preencha numeros candidatos nas casas.",
      "Cruze a soma horizontal com a vertical de cada casa.",
      "Complete a grade sem repetir numeros dentro de cada grupo.",
    ],
    rules: [
      "Use apenas numeros de 1 a 9.",
      "Nao pode repetir numero dentro do mesmo grupo de soma.",
      "Cada grupo precisa somar exatamente o valor da pista.",
      "Uma casa pertence a um grupo horizontal e a um vertical.",
    ],
    controls: [
      "Selecione uma casa e informe um numero.",
      "Apague para corrigir tentativa.",
    ],
    visual: [
      "Pistas diagonais mostram somas de direcoes diferentes.",
      "Casas brancas sao preenchiveis.",
      "Grupos sao sequencias continuas ate uma parede ou pista.",
    ],
    tips: [
      "Somas pequenas e grupos curtos costumam ter poucas combinacoes.",
      "Anote candidatos quando duas somas se cruzarem com duvida.",
    ],
  },
  kenken: {
    objective: "Completar a grade sem repetir numeros em linhas e colunas, respeitando a operacao de cada regiao.",
    setup: [
      "O tamanho da grade define os numeros permitidos: em 4x4, use 1 a 4; em 6x6, use 1 a 6.",
      "Cada regiao mostra um resultado e uma operacao.",
    ],
    steps: [
      "Escolha uma regiao.",
      "Liste combinacoes que produzem o resultado com a operacao indicada.",
      "Preencha numeros sem repetir na mesma linha ou coluna.",
      "Use cruzamentos entre regioes para eliminar candidatos.",
      "Complete todas as casas.",
    ],
    rules: [
      "Linhas nao podem repetir numero.",
      "Colunas nao podem repetir numero.",
      "Cada regiao precisa satisfazer sua operacao: soma, subtracao, multiplicacao ou divisao.",
      "Regioes de uma casa ja indicam diretamente o valor daquela casa.",
    ],
    controls: [
      "Selecione a casa e informe o numero.",
      "Use apagar ou sobrescrever para corrigir.",
    ],
    visual: [
      "Bordas grossas delimitam regioes.",
      "Numero e simbolo no canto indicam alvo e operacao.",
      "Casas da mesma regiao trabalham juntas.",
    ],
    tips: [
      "Resolva primeiro regioes de uma casa e combinacoes obrigatorias.",
      "Use a regra de linha e coluna antes de testar operacoes dificeis.",
    ],
  },
  hitori: {
    objective: "Escurecer numeros para que nao haja repeticoes em nenhuma linha ou coluna, mantendo as casas claras conectadas.",
    setup: [
      "A grade comeca cheia de numeros.",
      "Voce decide quais numeros devem ficar escuros.",
    ],
    steps: [
      "Procure numeros repetidos em uma linha ou coluna.",
      "Escureca algumas repeticoes para deixar apenas uma ocorrencia clara.",
      "Marque como claras as casas que nao podem ser escurecidas.",
      "Garanta que casas escuras nao encostem pelos lados.",
      "Confira se todas as casas claras continuam conectadas.",
    ],
    rules: [
      "Nenhuma linha pode ter o mesmo numero claro duas vezes.",
      "Nenhuma coluna pode ter o mesmo numero claro duas vezes.",
      "Casas escuras nao podem ser vizinhas ortogonais.",
      "Todas as casas claras devem formar uma unica area conectada.",
    ],
    controls: [
      "Clique ou toque para alternar uma celula clara, escura ou marcada.",
    ],
    visual: [
      "Casa escura remove aquele numero da linha e coluna.",
      "Casa clara ainda conta para repeticoes.",
      "Marcacoes ajudam a lembrar casas que devem permanecer claras.",
    ],
    tips: [
      "Se escurecer uma casa obrigaria a escurecer uma vizinha, provavelmente e erro.",
      "Proteja caminhos que mantem a area clara conectada.",
    ],
  },
  futoshiki: {
    objective: "Preencher a grade com numeros sem repetir em linhas e colunas, obedecendo sinais de maior e menor.",
    setup: [
      "O tamanho da grade define os numeros permitidos.",
      "Sinais entre casas mostram relacoes obrigatorias.",
    ],
    steps: [
      "Escolha uma casa vazia.",
      "Confira quais numeros ainda faltam na linha e coluna.",
      "Veja sinais ligados a casas vizinhas.",
      "Preencha um numero que respeite todas as comparacoes.",
      "Complete a grade inteira.",
    ],
    rules: [
      "Cada linha usa todos os numeros permitidos sem repetir.",
      "Cada coluna usa todos os numeros permitidos sem repetir.",
      "Se ha sinal de maior, o lado aberto aponta para o numero maior.",
      "Todas as desigualdades precisam ser verdadeiras ao final.",
    ],
    controls: [
      "Selecione a casa e informe um numero.",
      "Apague ou substitua para corrigir.",
    ],
    visual: [
      "Sinais < e > ficam entre duas casas relacionadas.",
      "Casas vazias precisam receber numeros.",
      "Sequencias de sinais criam cadeias de valores.",
    ],
    tips: [
      "Uma casa maior que varias vizinhas provavelmente precisa de numero alto.",
      "Uma casa menor que varias vizinhas provavelmente precisa de numero baixo.",
    ],
  },
  akari: {
    objective: "Colocar lampadas para iluminar todas as casas vazias sem que uma lampada veja outra.",
    setup: [
      "Casas pretas bloqueiam luz.",
      "Algumas casas pretas possuem numeros.",
    ],
    steps: [
      "Coloque uma lampada em uma casa vazia.",
      "A luz se espalha na horizontal e vertical ate bater em parede preta.",
      "Use numeros pretos para saber quantas lampadas devem encostar naquela parede.",
      "Marque casas onde lampada nao pode ficar.",
      "Continue ate todas as casas vazias estarem iluminadas.",
    ],
    rules: [
      "Duas lampadas nao podem enxergar uma a outra na mesma linha ou coluna sem parede entre elas.",
      "Numero em parede preta indica a quantidade exata de lampadas vizinhas ortogonais.",
      "Casa sem numero nao exige quantidade especifica ao redor.",
      "Toda casa branca precisa estar iluminada ou ter lampada.",
    ],
    controls: [
      "Clique ou toque em casa vazia para colocar ou remover lampada.",
      "Use marcacoes se a interface oferecer modo de bloqueio.",
    ],
    visual: [
      "Lampada e fonte de luz.",
      "Casas iluminadas ficam destacadas.",
      "Parede preta interrompe a luz.",
    ],
    tips: [
      "Paredes com numero 4 forcam lampadas nos quatro lados livres.",
      "Se uma casa so pode ser iluminada por um lugar, esse lugar precisa de lampada.",
    ],
  },
  slitherlink: {
    objective: "Desenhar um unico loop fechado usando bordas da grade.",
    setup: [
      "Numeros dentro das celulas dizem quantas bordas ao redor fazem parte do loop.",
      "Celulas sem numero nao impoem quantidade direta.",
    ],
    steps: [
      "Clique em bordas para ligar segmentos do caminho.",
      "Use os numeros para decidir quantas bordas cada celula deve ter.",
      "Marque bordas impossiveis quando tiver certeza.",
      "Conecte segmentos sem criar pontas soltas.",
      "Feche um unico circuito continuo.",
    ],
    rules: [
      "O loop nao pode se cruzar.",
      "O loop nao pode se dividir em mais de um circuito.",
      "Cada numero precisa ter exatamente aquela quantidade de bordas ligadas ao redor.",
      "Pontos do loop devem ter entrada e saida, nunca tres caminhos.",
    ],
    controls: [
      "Clique ou toque em uma borda para ligar ou desligar.",
    ],
    visual: [
      "Linhas ativas formam o caminho.",
      "Numeros sao restricoes locais.",
      "Bordas marcadas como vazias ajudam a evitar caminhos errados.",
    ],
    tips: [
      "Celulas 0 eliminam todas as quatro bordas ao redor.",
      "Evite fechar um mini-loop antes de incluir todo o tabuleiro necessario.",
    ],
  },
  hashi: {
    objective: "Conectar todas as ilhas com pontes para que cada ilha tenha exatamente o numero indicado.",
    setup: [
      "Cada ilha mostra quantas pontes devem tocar nela.",
      "Pontes so podem ser horizontais ou verticais.",
    ],
    steps: [
      "Escolha duas ilhas alinhadas sem ilha no meio.",
      "Adicione uma ponte entre elas.",
      "Clique novamente para alternar entre zero, uma ou duas pontes.",
      "Repita ate todas as ilhas baterem seus numeros.",
      "Confira se a rede inteira esta conectada.",
    ],
    rules: [
      "No maximo duas pontes podem ligar o mesmo par de ilhas.",
      "Pontes nao podem cruzar outras pontes.",
      "Cada ilha precisa receber exatamente o numero mostrado.",
      "Todas as ilhas precisam fazer parte de uma unica rede.",
    ],
    controls: [
      "Clique ou toque em duas ilhas alinhadas para alternar pontes.",
    ],
    visual: [
      "Numero na ilha e a meta de conexoes.",
      "Linha simples vale uma ponte; linha dupla vale duas.",
      "Ilhas completas nao devem receber mais pontes.",
    ],
    tips: [
      "Ilhas com numero alto e poucos vizinhos costumam forcar pontes.",
      "Nao isole um grupo; a rede final precisa estar toda ligada.",
    ],
  },
  takuzu: {
    objective: "Preencher a grade com 0 e 1 obedecendo equilibrio, sequencia e unicidade.",
    setup: [
      "Algumas casas ja vem preenchidas.",
      "O tamanho da grade define quantos zeros e uns cada linha e coluna precisa ter.",
    ],
    steps: [
      "Clique em uma casa vazia para escolher 0 ou 1.",
      "Evite criar tres numeros iguais seguidos.",
      "Mantenha a mesma quantidade de 0 e 1 em cada linha e coluna.",
      "Compare linhas e colunas para evitar duplicatas.",
      "Complete a grade sem contradicoes.",
    ],
    rules: [
      "Nao pode haver 000 ou 111 em sequencia horizontal ou vertical.",
      "Cada linha tem metade 0 e metade 1.",
      "Cada coluna tem metade 0 e metade 1.",
      "Nenhuma linha ou coluna completa pode ser identica a outra.",
    ],
    controls: [
      "Clique ou toque para alternar vazio, 0 e 1.",
    ],
    visual: [
      "Zeros e uns sao os dois estados principais.",
      "Pistas fixas nao devem ser alteradas.",
      "Linhas quase completas mostram faltas de equilibrio.",
    ],
    tips: [
      "Dois numeros iguais juntos geralmente forcam o oposto nas pontas.",
      "Se uma linha ja tem metade de zeros, o resto deve ser um.",
    ],
  },
  tents: {
    objective: "Colocar uma barraca para cada arvore sem que barracas se encostem.",
    setup: [
      "Arvores ja estao posicionadas no tabuleiro.",
      "Pistas nas bordas indicam quantas barracas existem em cada linha e coluna.",
    ],
    steps: [
      "Escolha uma casa vazia ao lado de uma arvore.",
      "Coloque uma barraca nessa casa.",
      "Garanta que a barraca pertence a uma arvore vizinha.",
      "Evite encostar barracas, inclusive na diagonal.",
      "Complete as contagens de linhas e colunas.",
    ],
    rules: [
      "Cada arvore precisa de exatamente uma barraca ortogonalmente vizinha.",
      "Cada barraca pertence a uma unica arvore.",
      "Barracas nao podem tocar outras barracas, nem diagonalmente.",
      "As pistas de linha e coluna precisam bater exatamente.",
    ],
    controls: [
      "Clique ou toque em casas livres para alternar barraca ou marca vazia.",
    ],
    visual: [
      "Arvore e a referencia da barraca.",
      "Barraca ocupa uma casa livre ao lado da arvore.",
      "Numeros nas bordas controlam quantidade por linha e coluna.",
    ],
    tips: [
      "Linhas ou colunas com zero podem ser marcadas como vazias.",
      "Se uma arvore so tem uma casa livre possivel, ela forca uma barraca.",
    ],
  },
  shikaku: {
    objective: "Dividir a grade em retangulos, cada um contendo um numero e area igual a esse numero.",
    setup: [
      "Numeros ja aparecem em algumas casas.",
      "Cada numero sera o centro logico de uma regiao retangular.",
    ],
    steps: [
      "Escolha um numero da grade.",
      "Imagine retangulos que contenham esse numero.",
      "O retangulo precisa ter quantidade de casas igual ao numero.",
      "Pinte ou selecione as casas desse retangulo.",
      "Repita ate cobrir toda a grade sem sobrepor regioes.",
    ],
    rules: [
      "Cada retangulo contem exatamente um numero.",
      "A area do retangulo precisa ser igual ao numero dentro dele.",
      "Retangulos nao podem se sobrepor.",
      "Toda casa da grade deve pertencer a um retangulo.",
    ],
    controls: [
      "Escolha um numero e marque as casas do retangulo conforme a interface.",
    ],
    visual: [
      "Numero indica o tamanho da regiao.",
      "Bordas ou cores separam retangulos.",
      "Casas sem regiao ainda precisam ser cobertas.",
    ],
    tips: [
      "Numeros primos tem poucos formatos possiveis.",
      "Cantos e bordas reduzem as formas que um retangulo pode assumir.",
    ],
  },
  masyu: {
    objective: "Desenhar um unico loop continuo passando por todos os circulos e respeitando suas regras.",
    setup: [
      "Circulos brancos e pretos aparecem na grade.",
      "Voce desenha linhas pelas bordas ou caminhos entre pontos.",
    ],
    steps: [
      "Trace segmentos para formar um caminho.",
      "Ao passar por circulo branco, siga reto nele e vire antes ou depois.",
      "Ao passar por circulo preto, vire nele e siga reto nas casas antes e depois.",
      "Conecte todos os segmentos sem pontas soltas.",
      "Feche um unico loop.",
    ],
    rules: [
      "O loop deve passar por todos os circulos.",
      "Circulo branco exige caminho reto naquela casa.",
      "Circulo preto exige curva naquela casa.",
      "Nao pode haver cruzamento, bifurcacao ou mais de um loop.",
    ],
    controls: [
      "Clique ou toque nas bordas para formar o caminho.",
    ],
    visual: [
      "Circulo branco pede reta.",
      "Circulo preto pede curva.",
      "Linhas conectadas mostram o loop em construcao.",
    ],
    tips: [
      "Pretos perto da borda costumam forcar direcoes.",
      "Brancos alinhados podem criar trechos longos obrigatorios.",
    ],
  },
  nurikabe: {
    objective: "Formar ilhas de terra do tamanho indicado pelos numeros e uma parede de agua conectada.",
    setup: [
      "Numeros sao sementes de ilhas.",
      "Voce marca casas como terra ou agua.",
    ],
    steps: [
      "Expanda cada numero formando uma ilha com exatamente aquele tamanho.",
      "Separe ilhas diferentes com agua.",
      "Conecte todas as casas de agua em uma unica parede.",
      "Evite formar blocos 2x2 de agua.",
      "Complete todas as casas da grade.",
    ],
    rules: [
      "Cada ilha contem exatamente um numero.",
      "O tamanho da ilha e o valor do numero.",
      "Ilhas nao podem se tocar ortogonalmente.",
      "Toda agua precisa estar conectada e nao pode formar quadrado 2x2.",
    ],
    controls: [
      "Clique ou toque para marcar terra, agua ou vazio.",
    ],
    visual: [
      "Numeros sao ilhas obrigatorias.",
      "Agua separa ilhas.",
      "Terra sem numero precisa pertencer a uma ilha numerada.",
    ],
    tips: [
      "Numeros 1 ja sao ilhas completas e precisam de agua ao redor.",
      "Quando uma ilha atinge seu tamanho, bloqueie a expansao com agua.",
    ],
  },
  fillomino: {
    objective: "Preencher a grade com regioes em que o numero escrito indica o tamanho da propria regiao.",
    setup: [
      "Algumas casas ja tem numeros.",
      "Voce completa os numeros restantes formando grupos conectados.",
    ],
    steps: [
      "Escolha uma regiao parcial.",
      "Expanda ou preencha numeros iguais ate a regiao ter o tamanho certo.",
      "Separe regioes de mesmo numero quando nao pertencem ao mesmo grupo.",
      "Use bordas e pistas para evitar crescimento impossivel.",
      "Complete todas as casas.",
    ],
    rules: [
      "Uma regiao de numero 3 precisa ter exatamente 3 casas com numero 3.",
      "Regioes de mesmo numero nao podem se encostar se formariam uma regiao maior.",
      "Todas as casas precisam pertencer a alguma regiao.",
      "Pistas dadas fazem parte das regioes finais.",
    ],
    controls: [
      "Selecione uma casa e informe o numero.",
      "Apague para corrigir candidato.",
    ],
    visual: [
      "Numeros iguais conectados formam uma regiao.",
      "Tamanho da regiao deve bater com o numero.",
      "Bordas implicitas surgem onde numeros diferentes se encontram.",
    ],
    tips: [
      "Numeros grandes precisam de espaco; verifique se ha caminho para crescer.",
      "Se uma regiao ja chegou ao tamanho certo, casas vizinhas nao podem ter o mesmo numero.",
    ],
  },
  maze: {
    objective: "Levar o jogador da entrada ate a saida do labirinto.",
    setup: [
      "Observe paredes, caminho livre, saida e objetivos extras como chaves ou portas.",
      "Escolha o modo de fase quando disponivel.",
    ],
    steps: [
      "Mova o jogador uma casa por vez.",
      "Evite paredes e becos sem saida quando estiver correndo contra tempo ou passos.",
      "Pegue chaves se houver portas bloqueando o caminho.",
      "Chegue ate a saida para concluir.",
    ],
    rules: [
      "Paredes bloqueiam movimento.",
      "A saida conclui a fase quando os requisitos foram cumpridos.",
      "Modos com tempo ou passos limitam a quantidade de erro.",
      "Chaves e portas precisam ser resolvidas na ordem correta quando aparecem.",
    ],
    controls: [
      "Teclado: setas ou WASD.",
      "Celular: botoes direcionais na tela.",
    ],
    visual: [
      "Jogador mostra sua posicao atual.",
      "Paredes formam os bloqueios.",
      "Saida, chave e porta aparecem como objetivos visuais.",
    ],
    tips: [
      "Em labirintos simples, seguir uma parede pode ajudar a explorar.",
      "Antes de entrar em um corredor longo, confira se ele nao e beco sem saida.",
    ],
  },
  gomoku: {
    objective: "Alinhar 5 pecas da sua cor em sequencia antes do adversario.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "O tabuleiro comeca vazio.",
    ],
    steps: [
      "Clique em uma intersecao vazia.",
      "O adversario coloca uma peca em outra intersecao vazia.",
      "Crie sequencias horizontais, verticais ou diagonais.",
      "Bloqueie sequencias perigosas do adversario.",
      "Venca ao formar cinco em linha.",
    ],
    rules: [
      "Uma casa ocupada nao pode receber outra peca.",
      "A sequencia vencedora precisa ter 5 pecas conectadas em linha reta.",
      "Linhas, colunas e diagonais contam.",
      "A IA prioriza vitorias, bloqueios e extensoes.",
    ],
    controls: [
      "Clique ou toque em uma intersecao vazia.",
      "Reiniciar: limpa o tabuleiro.",
    ],
    visual: [
      "Pecas pretas e brancas mostram os lados.",
      "Intersecoes vazias sao jogadas possiveis.",
      "Sequencias abertas nas pontas sao ameacas fortes.",
    ],
    tips: [
      "Crie ameacas com quatro aberto ou duas linhas ao mesmo tempo.",
      "Bloqueie imediatamente uma linha de quatro do adversario.",
    ],
  },
  hex: {
    objective: "Conectar os dois lados do tabuleiro marcados pela sua cor.",
    setup: [
      "Escolha modo contra maquina ou dois jogadores locais.",
      "Cada jogador tem dois lados opostos como meta.",
    ],
    steps: [
      "Coloque uma peca em uma celula vazia.",
      "O adversario coloca a peca dele em outra celula vazia.",
      "Crie uma cadeia conectada de pecas da sua cor.",
      "Bloqueie caminhos do adversario sem abandonar sua conexao.",
      "Venca quando seus dois lados estiverem ligados.",
    ],
    rules: [
      "Celulas vizinhas se conectam pelos lados hexagonais.",
      "Uma celula ocupada nao pode ser jogada novamente.",
      "Nao existe empate em Hex: alguem sempre conecta primeiro.",
      "Caminhos podem fazer curvas; nao precisam ser linha reta.",
    ],
    controls: [
      "Clique ou toque em uma celula vazia.",
    ],
    visual: [
      "Cada cor tem dois lados opostos para conectar.",
      "Cadeias de pecas vizinhas formam caminho.",
      "Gargalos no centro podem decidir a partida.",
    ],
    tips: [
      "Construa pontes: duas pecas separadas por um espaco podem criar duas ameacas.",
      "Jogar so na defesa costuma deixar o adversario completar o caminho.",
    ],
  },
  morris: {
    objective: "Formar moinhos de tres pecas alinhadas para remover pecas adversarias e reduzir o rival a poucas opcoes.",
    setup: [
      "Cada jogador recebe um conjunto de pecas.",
      "O jogo tem fase de colocacao, movimento e, em algumas regras, voo com 3 pecas.",
    ],
    steps: [
      "Na fase inicial, coloque uma peca em um ponto vazio.",
      "Tente formar tres pecas suas em uma linha do tabuleiro.",
      "Ao formar um moinho, remova uma peca adversaria valida.",
      "Depois que todas as pecas forem colocadas, mova pecas para pontos adjacentes.",
      "Venca deixando o adversario com menos de 3 pecas ou sem movimentos.",
    ],
    rules: [
      "Moinho e uma linha de 3 pecas da mesma cor em pontos conectados.",
      "Ao remover, normalmente nao se pode escolher peca que esta em moinho se houver outra opcao.",
      "Com apenas 3 pecas, algumas variantes permitem voar para qualquer ponto vazio.",
      "Bloquear todos os movimentos do adversario tambem vence.",
    ],
    controls: [
      "Clique em ponto vazio para colocar.",
      "Na fase de movimento, clique na origem e no destino.",
      "Clique em uma peca adversaria quando a interface pedir captura.",
    ],
    visual: [
      "Pontos do tabuleiro sao casas validas.",
      "Linhas mostram adjacencias para movimento.",
      "Tres pecas alinhadas formam o moinho.",
    ],
    tips: [
      "Tente criar ameacas duplas de moinho.",
      "Bloquear um moinho recorrente do adversario pode valer mais que capturar qualquer peca.",
    ],
  },
  backgammon: {
    objective: "Levar todas as suas pecas para o seu quadrante final e retira-las do tabuleiro antes do adversario.",
    setup: [
      "As pecas comecam distribuidas em pontos especificos do tabuleiro.",
      "Cada turno usa dois dados para determinar movimentos.",
    ],
    steps: [
      "Role os dados.",
      "Escolha uma peca e mova a quantidade de pontos indicada por um dado.",
      "Use o outro dado em uma peca, ou na mesma se for legal.",
      "Se capturar uma peca solta, ela vai para a barra.",
      "Quando todas as suas pecas estiverem no quadrante final, comece a retira-las.",
    ],
    rules: [
      "Voce move no sentido da sua rota.",
      "Ponto com duas ou mais pecas adversarias fica bloqueado.",
      "Peca sozinha em um ponto pode ser capturada.",
      "Pecas na barra precisam voltar ao tabuleiro antes de mover outras.",
      "Dados iguais contam como quatro movimentos daquele valor.",
    ],
    controls: [
      "Role os dados e clique na peca de origem e destino legal.",
      "Use acoes guiadas de barra, captura e retirada quando aparecerem.",
    ],
    visual: [
      "Triangulos sao pontos de movimento.",
      "Barra central guarda pecas capturadas.",
      "Dados mostram os movimentos disponiveis.",
    ],
    tips: [
      "Evite deixar pecas soltas quando o adversario puder captura-las.",
      "Formar bloqueios seguidos dificulta a volta de pecas capturadas.",
    ],
  },
  ludo: {
    objective: "Levar suas 4 pecas da base ate a chegada central antes dos outros jogadores.",
    setup: [
      "Cada jogador tem uma base, um caminho e uma reta final.",
      "A partida usa dado para definir quantas casas mover.",
    ],
    steps: [
      "Role o dado.",
      "Tire uma peca da base quando sair 6, se a regra exigir.",
      "Escolha uma peca que possa andar o valor do dado.",
      "Capture adversarios caindo na mesma casa, quando a casa permitir.",
      "Leve todas as suas pecas ate o centro.",
    ],
    rules: [
      "Geralmente e preciso tirar 6 para sair da base.",
      "Cair sobre adversario manda a peca dele de volta para a base, exceto em casas seguras.",
      "Para entrar na chegada, o valor do dado precisa encaixar conforme a variante.",
      "Vence quem completar primeiro suas pecas.",
    ],
    controls: [
      "Clique em rolar dado.",
      "Depois clique na peca legal que deseja mover.",
    ],
    visual: [
      "Bases coloridas guardam pecas ainda fora do caminho.",
      "Caminho principal circunda o tabuleiro.",
      "Reta final leva ao centro.",
    ],
    tips: [
      "Ter mais pecas em jogo aumenta opcoes, mas tambem aumenta risco de captura.",
      "Use capturas para atrasar quem esta perto do centro.",
    ],
  },
  dominoes: {
    objective: "Esvaziar sua mao antes dos outros ou terminar a rodada com menor soma de pontos.",
    setup: [
      "Cada jogador recebe pecas de domino.",
      "A mesa comeca com uma peca inicial ou com a primeira jogada valida.",
    ],
    steps: [
      "Observe os numeros nas duas pontas abertas da mesa.",
      "Escolha da sua mao uma peca que combine com uma das pontas.",
      "Jogue a peca na ponta correspondente.",
      "Se nao tiver peca valida, compre ou passe conforme a regra da partida.",
      "Continue ate alguem bater ou a rodada travar.",
    ],
    rules: [
      "Numeros iguais se encostam: 6 com 6, 3 com 3, e assim por diante.",
      "Uma peca sem numero compativel nao pode ser jogada naquela ponta.",
      "A rodada trava quando ninguem consegue jogar.",
      "Ao travar, vence quem tiver menor soma de pontos na mao.",
    ],
    controls: [
      "Clique em uma peca valida e escolha a ponta se necessario.",
      "Use comprar ou passar quando nao houver jogada.",
    ],
    visual: [
      "Pontas abertas mostram os numeros que aceitam jogada.",
      "Sua mao mostra pecas disponiveis.",
      "Pecas duplas aparecem com numeros iguais nos dois lados.",
    ],
    tips: [
      "Tente manter variedade de numeros na mao.",
      "Se perceber que o adversario nao tem um numero, force essa ponta de novo.",
    ],
  },
  "mahjong-solitaire": {
    objective: "Remover todos os pares de pecas iguais que estejam livres.",
    setup: [
      "As pecas aparecem empilhadas em camadas.",
      "Nem toda peca visivel pode ser removida.",
    ],
    steps: [
      "Procure duas pecas com o mesmo simbolo.",
      "Confira se cada uma esta livre.",
      "Clique na primeira peca e depois na segunda.",
      "O par sai do tabuleiro.",
      "Continue abrindo novas pecas ate limpar o layout.",
    ],
    rules: [
      "Uma peca e livre quando nao tem peca em cima e tem pelo menos um lado esquerdo ou direito desbloqueado.",
      "Pecas iguais formam par, com excecoes de flores e estacoes quando a variante permite equivalencia.",
      "Pecas bloqueadas nao podem ser removidas.",
      "A partida acaba quando todas saem ou nao restam pares livres.",
    ],
    controls: [
      "Clique ou toque em duas pecas livres iguais.",
      "Use embaralhar ou dica se a interface oferecer.",
    ],
    visual: [
      "Pecas elevadas ou deslocadas indicam camadas.",
      "Peca livre tem lateral aberta.",
      "Pares removidos revelam pecas que estavam presas.",
    ],
    tips: [
      "Priorize pares que liberam muitas pecas escondidas.",
      "Evite remover pares equivalentes sem olhar qual opcao abre mais caminhos.",
    ],
  },
  quoridor: {
    objective: "Levar seu peao ao lado oposto do tabuleiro antes do adversario, usando paredes para atrasar caminhos.",
    setup: [
      "Cada jogador comeca em lados opostos.",
      "Cada jogador tem quantidade limitada de paredes.",
    ],
    steps: [
      "Na sua vez, escolha mover o peao ou colocar uma parede.",
      "Movimente o peao para uma casa vizinha legal.",
      "Se colocar parede, posicione-a entre casas para bloquear passagem.",
      "Garanta que ambos os jogadores ainda tenham algum caminho ate a meta.",
      "Venca ao chegar em qualquer casa do lado oposto.",
    ],
    rules: [
      "Paredes nao podem bloquear todos os caminhos de um jogador.",
      "Paredes ocupam espacos entre casas e afetam ambos os jogadores.",
      "Quando peoes se encostam, regras de pulo permitem ultrapassar ou contornar conforme bloqueios.",
      "Paredes sao limitadas, entao cada uma precisa valer o atraso.",
    ],
    controls: [
      "Clique no destino do peao para mover.",
      "Escolha orientacao e posicao da parede quando for bloquear.",
    ],
    visual: [
      "Peoes mostram posicoes atuais.",
      "Paredes sao barras entre casas.",
      "Lado oposto do tabuleiro e a linha de chegada.",
    ],
    tips: [
      "Nao bloqueie tarde demais: uma parede boa muda a rota inteira.",
      "Conte a distancia de cada jogador ate a meta antes de escolher mover ou bloquear.",
    ],
  },
  pentago: {
    objective: "Formar 5 pecas em linha em um tabuleiro 6x6, colocando uma peca e girando um quadrante a cada turno.",
    setup: [
      "O tabuleiro e dividido em quatro quadrantes 3x3.",
      "Cada jogador joga com uma cor de peca.",
    ],
    steps: [
      "Coloque uma peca sua em uma casa vazia.",
      "Escolha um quadrante.",
      "Gire esse quadrante 90 graus para a esquerda ou direita.",
      "Confira se a rotacao criou uma linha de 5.",
      "Continue ate alguem formar 5 ou o tabuleiro encher.",
    ],
    rules: [
      "Cada turno tem duas partes: colocar e girar.",
      "A linha vencedora pode atravessar quadrantes.",
      "Se a colocacao ou a rotacao formar 5, a partida reconhece a vitoria conforme a regra da variante.",
      "Se os dois formarem linha ao mesmo tempo, a variante define empate ou prioridade.",
    ],
    controls: [
      "Clique em uma casa vazia para colocar.",
      "Depois clique na rotacao do quadrante escolhido.",
    ],
    visual: [
      "Divisao 3x3 mostra os quadrantes que podem girar.",
      "Setas de rotacao indicam sentido.",
      "Linhas de 5 podem ser horizontais, verticais ou diagonais.",
    ],
    tips: [
      "Pense na posicao depois da rotacao, nao apenas antes.",
      "Crie ameacas que sobrevivem a mais de uma rotacao possivel.",
    ],
  },
  quarto: {
    objective: "Formar uma linha de 4 pecas que compartilhem pelo menos uma caracteristica.",
    setup: [
      "As pecas possuem atributos, como cor, altura, formato ou preenchimento.",
      "Diferente de outros jogos, voce escolhe a peca que o adversario tera que colocar.",
    ],
    steps: [
      "Receba a peca escolhida pelo adversario.",
      "Coloque essa peca em uma casa vazia.",
      "Verifique se alguma linha de 4 agora compartilha uma caracteristica.",
      "Escolha a proxima peca que o adversario devera jogar.",
      "Continue ate alguem declarar ou formar Quarto.",
    ],
    rules: [
      "Linha pode ser horizontal, vertical ou diagonal.",
      "As 4 pecas da linha precisam ter pelo menos uma caracteristica em comum.",
      "Voce nao escolhe a propria peca; escolhe a peca do adversario.",
      "Uma peca colocada nao sai mais do tabuleiro.",
    ],
    controls: [
      "Clique na casa para posicionar a peca recebida.",
      "Depois selecione uma peca disponivel para entregar ao adversario.",
    ],
    visual: [
      "Atributos das pecas sao as pistas: iguais em uma linha podem vencer.",
      "Tabuleiro 4x4 mostra as linhas possiveis.",
      "Pecas fora do tabuleiro ainda podem ser entregues.",
    ],
    tips: [
      "Antes de entregar uma peca, veja se ela permite vitoria imediata ao adversario.",
      "Acompanhe caracteristicas comuns, nao apenas posicoes.",
    ],
  },
  klondike: {
    objective: "Mover todas as cartas para as fundacoes, separadas por naipe, do As ao Rei.",
    setup: [
      "O tableau tem colunas com algumas cartas abertas e outras fechadas.",
      "O estoque permite comprar cartas extras.",
    ],
    steps: [
      "Mova Ases para as fundacoes quando aparecerem.",
      "No tableau, monte colunas em ordem decrescente alternando cores.",
      "Vire cartas fechadas liberando a coluna.",
      "Compre do estoque quando nao houver jogada boa.",
      "Suba cartas para as fundacoes em ordem crescente por naipe.",
    ],
    rules: [
      "Fundacoes sobem A, 2, 3 ate K no mesmo naipe.",
      "Tableau desce K, Q, J ate A alternando vermelho e preto.",
      "Somente Rei pode iniciar uma coluna vazia na regra classica.",
      "Compra pode ser de 1 ou 3 cartas conforme opcao.",
    ],
    controls: [
      "Clique em Ases e cartas prontas para fundacao para subi-las automaticamente.",
      "Clique em uma carta ou sequencia e depois no destino; se voce clicar primeiro no alvo e depois na carta que encaixa, o jogo tambem entende a jogada.",
      "Arraste uma carta ou sequencia ate uma coluna ou fundacao; a carta sai visualmente da origem enquanto voce arrasta.",
      "Clique no estoque para comprar cartas.",
      "Use Auto fundacao para subir todas as cartas obvias disponiveis no momento.",
    ],
    visual: [
      "Fundacoes ficam no topo e organizam naipes.",
      "Colunas do tableau sao a area principal de manobra.",
      "Cartas viradas para baixo precisam ser liberadas.",
    ],
    tips: [
      "Priorize virar cartas fechadas.",
      "Nao suba cartas cedo demais se elas ainda ajudam a alternar colunas.",
    ],
  },
  freecell: {
    objective: "Mover todas as cartas para as fundacoes por naipe, usando celulas livres como espaco temporario.",
    setup: [
      "Todas as cartas comecam abertas.",
      "Celulas livres ficam no topo e seguram uma carta cada.",
    ],
    steps: [
      "Monte sequencias decrescentes alternando cores no tableau.",
      "Use celulas livres para guardar cartas que bloqueiam jogadas.",
      "Mova Ases e cartas seguintes para as fundacoes.",
      "Libere colunas vazias para manobrar sequencias maiores.",
      "Complete os quatro naipes ate o Rei.",
    ],
    rules: [
      "Cada celula livre guarda no maximo uma carta.",
      "Fundacoes sobem por naipe de As a Rei.",
      "No tableau, sequencias descem alternando cores.",
      "A quantidade de cartas que voce consegue mover em sequencia depende de celulas e colunas livres.",
    ],
    controls: [
      "Clique em uma carta pronta para fundacao para subi-la automaticamente.",
      "Clique na carta, celula, coluna ou fundacao de origem e destino.",
      "Arraste cartas entre colunas, celulas livres e fundacoes; a carta arrastada some da origem durante o movimento.",
      "Use Auto fundacao para subir cartas que ja estejam liberadas.",
    ],
    visual: [
      "Celulas livres sao vagas temporarias.",
      "Fundacoes mostram progresso permanente.",
      "Todas as cartas abertas permitem planejamento completo.",
    ],
    tips: [
      "Mantenha celulas livres vazias sempre que possivel.",
      "Abrir uma coluna vazia aumenta muito sua capacidade de reorganizar.",
    ],
  },
  spider: {
    objective: "Montar sequencias completas de Rei a As para remove-las do tabuleiro.",
    setup: [
      "Escolha jogar com 1, 2 ou 4 naipes.",
      "O tableau tem colunas e um estoque para distribuir novas cartas.",
    ],
    steps: [
      "Organize cartas em ordem decrescente.",
      "Priorize sequencias do mesmo naipe, porque elas podem ser movidas juntas com mais facilidade.",
      "Quando formar K-Q-J-10-...-A do mesmo naipe, a sequencia sai do jogo.",
      "Use colunas vazias para reorganizar.",
      "Compre nova fileira do estoque quando ficar sem progresso.",
    ],
    rules: [
      "Sequencias completas de Rei a As do mesmo naipe sao removidas.",
      "Comprar do estoque distribui uma carta em cada coluna.",
      "Em muitas variantes, nao se pode comprar se houver coluna vazia.",
      "Mais naipes aumentam muito a dificuldade.",
    ],
    controls: [
      "Clique na carta ou sequencia e depois no destino.",
      "Arraste uma sequencia aberta e do mesmo naipe para outra coluna; a sequencia sai visualmente da origem durante o arraste.",
      "Clique no estoque para distribuir nova fileira.",
    ],
    visual: [
      "Colunas mostram pilhas de trabalho.",
      "Sequencias do mesmo naipe sao mais valiosas.",
      "Estoque representa novas fileiras pendentes.",
    ],
    tips: [
      "Nao compre cedo se ainda ha jogadas uteis.",
      "Criar uma coluna vazia costuma ser o maior ganho estrategico.",
    ],
  },
  hearts: {
    objective: "Terminar com o menor numero de pontos, evitando cartas de copas e a dama de espadas.",
    setup: [
      "Cada jogador recebe cartas.",
      "Em rodadas classicas, jogadores passam cartas antes da primeira vaza conforme direcao da rodada.",
    ],
    steps: [
      "Jogue uma carta valida na sua vez.",
      "Siga o naipe liderado se tiver carta daquele naipe.",
      "Quem joga a maior carta do naipe liderado ganha a vaza.",
      "Cartas de copas e a dama de espadas somam pontos negativos para quem ganhou a vaza.",
      "A rodada termina quando todas as cartas forem jogadas.",
    ],
    rules: [
      "Cada copa vale 1 ponto.",
      "A dama de espadas vale 13 pontos.",
      "Voce deve seguir o naipe da vaza quando puder.",
      "Copas normalmente nao podem ser lideradas ate serem quebradas.",
      "Quem fizer todos os pontos de uma rodada pode atirar na lua, conforme a variante.",
    ],
    controls: [
      "Clique em uma carta valida da sua mao.",
      "Arraste uma carta valida para o centro da mesa; ela sai visualmente da mao durante o arraste.",
      "Use botoes de passar cartas quando a fase pedir.",
    ],
    visual: [
      "Mao do jogador mostra suas opcoes.",
      "Centro da mesa mostra a vaza atual.",
      "Copas e dama de espadas sao cartas perigosas.",
    ],
    tips: [
      "Tente se livrar de naipes para poder descartar cartas perigosas depois.",
      "Cartas altas de espadas ficam arriscadas enquanto a dama ainda nao saiu.",
    ],
  },
  "truco-paulista": {
    objective: "Ganhar maos de truco somando pontos, usando cartas fortes, blefe e pedidos de aumento.",
    setup: [
      "Cada jogador ou dupla recebe 3 cartas.",
      "Uma carta vira e define as manilhas, que sao as cartas mais fortes da mao.",
      "No modo local, use o botao Estou pronto para revelar somente a mao do jogador da vez.",
    ],
    steps: [
      "Observe o vira para saber quais cartas sao manilhas.",
      "Jogue uma carta na rodada.",
      "No modo local, depois de jogar, passe o aparelho para o proximo jogador antes de tocar em Estou pronto.",
      "Compare as cartas para decidir quem ganhou a vaza.",
      "Quem vence duas das tres vazas ganha a mao.",
      "Peca truco, seis, nove ou doze quando quiser aumentar o valor da mao.",
    ],
    rules: [
      "A manilha e o valor imediatamente acima do vira, seguindo a ordem da variante paulista.",
      "Manilhas tem ordem propria por naipe.",
      "A mao normalmente vale 1 ponto, mas truco aumenta para 3, seis para 6, nove para 9 e doze para 12.",
      "Quem recebe pedido pode aceitar, correr ou aumentar.",
      "Empates de vaza seguem regras de mao conforme a ordem das vazas.",
    ],
    controls: [
      "Clique em uma carta para jogar.",
      "Arraste a carta para a mesa; ela sai visualmente da mao durante o arraste.",
      "No modo local, toque em Estou pronto apenas quando o aparelho estiver com o jogador correto.",
      "Use botoes de truco, aceitar, correr ou aumentar quando aparecerem.",
    ],
    visual: [
      "Vira indica quais sao as manilhas.",
      "Cartas na mesa mostram a vaza atual.",
      "Placar da mao mostra o valor em disputa.",
    ],
    tips: [
      "Nao peca truco so com carta alta; considere posicao, vira e comportamento do adversario.",
      "Guardar uma manilha para a segunda ou terceira vaza pode surpreender.",
    ],
  },
};

export function getGameGuide(game: GameMeta): GameGuide {
  return (
    gameGuides[game.id] ?? {
      objective: `Entender o objetivo de ${game.title} e jogar uma partida completa direto no navegador.`,
      setup: [`Escolha um dos modos disponiveis: ${game.modes.join(", ")}.`],
      steps: [
        "Leia o status do jogo para saber de quem e a vez ou qual acao esta pendente.",
        "Use os controles destacados na propria tela.",
        "Acompanhe o placar, progresso ou mensagens de erro.",
        "Continue ate o jogo indicar vitoria, derrota ou empate.",
      ],
      rules: game.rules,
      controls: game.controls,
      visual: [
        "Elementos destacados mostram a acao atual ou uma jogada permitida.",
        "Placar e mensagens de status mostram o progresso da partida.",
        "Botoes de reiniciar e configuracao ficam no HUD do proprio jogo.",
      ],
      tips: [
        "Comece pela opcao mais facil quando houver dificuldade.",
        "Use reiniciar para treinar sem recarregar a pagina.",
      ],
    }
  );
}
