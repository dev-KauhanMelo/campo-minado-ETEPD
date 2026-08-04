# Decisões de Design — Campo Minado ETEPD

## Referências pesquisadas

- **Campo Minado do Google Play Games**: tema "jardim" — células fechadas remetem a grama (checkerboard de dois tons de verde), células reveladas remetem a terra/areia (checkerboard de dois tons bege), números em cores vivas e saturadas. Não há uma folha de cores oficial pública com hex exatos, então a paleta abaixo é uma interpretação original inspirada nesse padrão (checkerboard grama/areia + números vívidos), não uma cópia pixel-a-pixel.
- **UI de jogos casuais mobile-first (2026)**: prioriza clareza e hierarquia visual sobre decoração; microinterações devem comunicar estado (não só "enfeitar"); alvo de toque mínimo de 44×44px; layouts pensados para uso com uma mão.
- **Leaderboards**: os dois formatos mais comuns são "pódio" (top 3, com tamanhos diferentes por posição) + "lista paginada" para o restante. "Carregar mais" é preferível a paginação numerada em contextos mobile-first.

## Paleta de cores

A primeira versão usava fundo bege claro com cards brancos. Na prática a tela
ficou lavada — quase tudo era branco e o tabuleiro não tinha destaque. A
paleta atual inverte isso: **fundo verde escuro** (com um leve degradê), e o
branco reservado a detalhes. O tabuleiro em tons de grama/terra passa a ser o
elemento mais claro da tela, que é onde o olho deve ir.

| Token | Uso | Hex |
|---|---|---|
| `bg` / `bg-deep` | Fundo geral (degradê) | `#0D3B26` / `#082A1A` |
| `panel` / `panel-soft` | Cards e painéis | `#12603A` / `#17784A` |
| `panel-line` | Bordas dos painéis | `#2EA36A` |
| `ink` | Texto principal (claro) | `#F2FDF7` |
| `ink-soft` | Texto secundário | `#A9D9BE` |
| `ink-dark` | Texto sobre fundo claro (botão dourado) | `#0C2B1C` |
| `accent` / `accent-dark` | Ação principal, destaques, cronômetro | `#FFC93C` / `#E2A600` |
| `berry` / `tangerine` | Acentos de apoio (dificuldades, confete) | `#7C5CFF` / `#FF8A5B` |
| `cell-closed-a` / `cell-closed-b` | Célula fechada (checkerboard "grama") | `#AAD751` / `#A2D149` |
| `cell-open-a` / `cell-open-b` | Célula revelada (checkerboard "terra") | `#E5C29F` / `#D7B899` |
| `flag` | Bandeira | `#E53935` |
| `mine-bg-hit` | Fundo da célula que causou a derrota | `#EF5350` |
| `danger` | Mensagens de erro/validação | `#FF6B6B` |
| `success` | Confirmações (ex: resultado salvo no ranking) | `#4ADE80` |
| `gold` / `silver` / `bronze` | Pódio do ranking | `#FFD54F` / `#D7DEE3` / `#D99058` |

**Números por quantidade de bombas vizinhas** (aparecem só sobre célula revelada — terra clara —, então todos foram escolhidos com contraste alto contra `cell-open-*`):

| Nº | Cor | Hex |
|---|---|---|
| 1 | Azul | `#1976D2` |
| 2 | Verde | `#2E7D32` |
| 3 | Vermelho | `#D32F2F` |
| 4 | Roxo | `#7B1FA2` |
| 5 | Laranja | `#EF6C00` |
| 6 | Ciano | `#0097A7` |
| 7 | Ardósia | `#37474F` |
| 8 | Marrom | `#6D4C41` |

Implementado como design tokens Tailwind v4 (`@theme` em [frontend/src/index.css](frontend/src/index.css)) — gera utilitários automáticos (`bg-accent`, `text-num-3`, etc.), sem `tailwind.config.js` (Tailwind v4 é CSS-first).

## Tipografia

- **Display/headings:** Baloo 2 — rounded, lúdica, combina com o tom "gostoso de jogar" sem comprometer legibilidade de números grandes.
- **Corpo/UI:** Nunito — bem legível em telas pequenas, amigável, boa distinção entre números.

Carregadas via Google Fonts em [frontend/index.html](frontend/index.html).

## Decisão: comparação de ranking entre dificuldades

Optamos por **(a) ranking separado por dificuldade** (abas Fácil/Médio/Difícil) em vez de uma fórmula de pontuação ponderada. Motivo: é a solução mais simples e transparente — o jogador entende exatamente o que está sendo comparado (tempo dentro da mesma dificuldade), sem a arbitrariedade de inventar pesos para converter tempo×dificuldade em um score único. Evita também disputas sobre "a fórmula é justa?".

## Decisão: como marcar bandeira no celular

A primeira versão usava **toque longo** (~450ms) para marcar bandeira. Testando
no celular, ficou ruim: não há retorno visual de que o toque está sendo
contado, é fácil escorregar o dedo e cancelar, e quem não leu a instrução não
descobre sozinho.

Agora, em aparelhos de toque (`pointer: coarse`), **um toque na casa abre um
menu com dois botões grandes: "Cavar" e "Marcar"**. Some a ambiguidade — a
mesma escolha que o mouse faz com os dois botões vira uma escolha explícita no
toque. No desktop nada muda: clique esquerdo cava, clique direito marca (um
menu ali só somaria um clique extra).

O menu é renderizado em `position: fixed` via portal porque o tabuleiro fica
dentro de um container com scroll, que cortaria o balão.

## Decisão: tamanho da célula

Antes as células tinham 32px fixos. O tabuleiro Fácil (9×9) virava um quadrado
minúsculo perdido no meio de um monitor. Agora o tamanho é calculado a partir
do espaço disponível ([useBoardMetrics.js](frontend/src/hooks/useBoardMetrics.js)),
com limites de 26px (menor alvo de toque aceitável) e 56px: o Fácil cresce até
ocupar a tela e o Difícil (16×30) encolhe até caber, rolando na horizontal só
quando o aparelho é estreito demais.

## Decisão: pausa de verdade, não cosmética

O cronômetro é contado no servidor (é ele que vale para o ranking). Uma pausa
só no frontend permitiria parar o relógio da tela enquanto o tempo real segue
correndo — ou pior, deixaria o jogador pensar que pausou. Por isso a pausa tem
endpoints próprios (`/game/pause` e `/game/resume`) e o servidor desconta o
tempo parado; jogadas enviadas durante a pausa são recusadas com 409.

## Microinterações

- Leve `scale-90` no `:active` de células e botões (feedback tátil).
- Confete na tela de vitória + selo de "novo recorde" pessoal.
- Shake no painel de derrota; bombas reveladas em vermelho.
- Personagem da home com flutuação sutil; painéis entram com `rise`/`pop-in`.
