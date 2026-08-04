# Decisões de Design — Campo Minado ETEPD

## Referências pesquisadas

- **Campo Minado do Google Play Games**: tema "jardim" — células fechadas remetem a grama (checkerboard de dois tons de verde), células reveladas remetem a terra/areia (checkerboard de dois tons bege), números em cores vivas e saturadas. Não há uma folha de cores oficial pública com hex exatos, então a paleta abaixo é uma interpretação original inspirada nesse padrão (checkerboard grama/areia + números vívidos), não uma cópia pixel-a-pixel.
- **UI de jogos casuais mobile-first (2026)**: prioriza clareza e hierarquia visual sobre decoração; microinterações devem comunicar estado (não só "enfeitar"); alvo de toque mínimo de 44×44px; layouts pensados para uso com uma mão.
- **Leaderboards**: os dois formatos mais comuns são "pódio" (top 3, com tamanhos diferentes por posição) + "lista paginada" para o restante. "Carregar mais" é preferível a paginação numerada em contextos mobile-first.

## Paleta de cores

Pastel vibrante/saturado (mais intenso que pastel tradicional), com checkerboard de 2 tons por estado da célula para dar profundidade sem poluir:

| Token | Uso | Hex |
|---|---|---|
| `bg` | Fundo geral da aplicação | `#FDF6EC` |
| `surface` | Cards, painéis | `#FFFFFF` |
| `ink` | Texto principal | `#2D3142` |
| `ink-soft` | Texto secundário | `#6B7280` |
| `accent` | Identidade ETEPD (header, botões primários) | `#6C5CE7` |
| `accent-soft` | Fundo suave do accent | `#EDE9FE` |
| `cell-closed-a` / `cell-closed-b` | Célula fechada (checkerboard "grama") | `#8FE3B5` / `#7FD9A8` |
| `cell-open-a` / `cell-open-b` | Célula revelada (checkerboard "areia") | `#F6ECD2` / `#EFE3C0` |
| `flag` | Bandeira | `#FF5A5F` |
| `mine` | Bomba | `#2D3142` |
| `mine-bg-hit` | Fundo da célula que causou a derrota | `#FF8A80` |
| `danger` | Mensagens de erro/validação em formulários | `#EF4444` |
| `gold` / `silver` / `bronze` | Pódio do ranking | `#FFD166` / `#D9D9E3` / `#E0A96D` |

**Números por quantidade de bombas vizinhas** (aparecem só sobre célula revelada — bege claro —, então todos foram escolhidos com contraste alto contra `cell-open-*`):

| Nº | Cor | Hex |
|---|---|---|
| 1 | Azul | `#3B82F6` |
| 2 | Verde | `#22A559` |
| 3 | Vermelho | `#EF4444` |
| 4 | Roxo | `#7C3AED` |
| 5 | Laranja queimado | `#C2410C` |
| 6 | Ciano | `#0891B2` |
| 7 | Quase-preto | `#1E1B29` |
| 8 | Cinza | `#6B7280` |

Implementado como design tokens Tailwind v4 (`@theme` em [frontend/src/index.css](frontend/src/index.css)) — gera utilitários automáticos (`bg-accent`, `text-num-3`, etc.), sem `tailwind.config.js` (Tailwind v4 é CSS-first).

## Tipografia

- **Display/headings:** Baloo 2 — rounded, lúdica, combina com o tom "gostoso de jogar" sem comprometer legibilidade de números grandes.
- **Corpo/UI:** Nunito — bem legível em telas pequenas, amigável, boa distinção entre números.

Carregadas via Google Fonts em [frontend/index.html](frontend/index.html).

## Decisão: comparação de ranking entre dificuldades

Optamos por **(a) ranking separado por dificuldade** (abas Fácil/Médio/Difícil) em vez de uma fórmula de pontuação ponderada. Motivo: é a solução mais simples e transparente — o jogador entende exatamente o que está sendo comparado (tempo dentro da mesma dificuldade), sem a arbitrariedade de inventar pesos para converter tempo×dificuldade em um score único. Evita também disputas sobre "a fórmula é justa?".

## Microinterações planejadas (implementação nas fases de UI)

- Transição suave (scale + fade) ao revelar célula.
- Leve `scale-95` no `:active` de células e botões (feedback tátil).
- Confete na tela de vitória.
- Shake sutil + revelação em cascata das bombas na derrota.
