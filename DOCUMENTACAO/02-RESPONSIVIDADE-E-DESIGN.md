# Especificação de responsividade e design móvel

## Regra central

A aplicação deve funcionar corretamente a partir de **320 px de largura**, sem scroll horizontal, sem texto esmagado, sem botões cortados e sem depender de um telemóvel grande.

## Larguras obrigatórias para teste

- 320 × 568
- 360 × 640
- 375 × 667
- 390 × 844
- 412 × 915
- 480 × 800
- 768 × 1024
- 1024 × 768
- 1366 × 768

## Estrutura global

- `html, body { max-width:100%; overflow-x:hidden; }`
- todo filho flex/grid relevante deve ter `min-width:0`;
- imagens e SVGs: `max-width:100%`;
- conteúdo móvel com padding fluido: `clamp(12px, 4vw, 20px)`;
- cartões sem largura fixa; `width:100%` e `max-width` apenas quando melhorar leitura;
- `box-sizing:border-box` universal;
- respeitar safe areas superior e inferior.

## Cabeçalho móvel

Em 320–360 px não cabem título longo, estado, instalação e SOS na mesma linha.

Comportamento esperado:
- linha principal: título compacto + SOS;
- estado do shopping pode ficar em uma segunda linha discreta ou virar um chip compacto;
- botão instalar só aparece quando realmente disponível;
- texto não pode colidir ou cortar;
- SOS continua visível, mas não deve efetuar chamada sem confirmação explícita.

## Hero da pesquisa

No telemóvel:
- uma coluna;
- título com `font-size:clamp(24px, 8vw, 34px)` e line-height equilibrado;
- estatística passa para baixo do texto;
- pesquisa ocupa 100%;
- chips em scroll horizontal ou wrap controlado;
- o hero não deve ultrapassar o viewport;
- resultados devem abrir abaixo da pesquisa sem sair da tela.

## Cards e métricas

- até 339 px: métricas em uma coluna ou cards compactos horizontais;
- 340–600 px: duas colunas somente se cada card mantiver no mínimo 145–155 px;
- evitar alturas fixas;
- conteúdo centralizado verticalmente, mas texto alinhado de forma consistente;
- títulos não devem ser truncados sem alternativa acessível;
- cards de loja em uma coluna no telemóvel;
- logo, nome, categoria e localização devem formar uma hierarquia clara.

## Seletor de pisos

Visual obrigatório:
- container com fundo claro e borda;
- botões arredondados;
- selecionado com fundo azul/navy, texto branco ou card branco elevado sobre fundo cinza;
- `box-shadow` perceptível mas discreto;
- `aria-selected="true"`;
- indicador não pode depender apenas da cor;
- em 320 px, scroll horizontal com `scroll-snap-type`.

Exemplo de direção visual:
```css
.floor-tabs {
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding:6px;
  border:1px solid var(--line);
  border-radius:14px;
  background:#f5f7fa;
  scrollbar-width:none;
}
.floor-tabs button {
  flex:0 0 44px;
  min-height:44px;
  border:1px solid transparent;
  border-radius:10px;
  font-weight:800;
  color:var(--muted);
}
.floor-tabs button.active,
.floor-tabs button[aria-selected="true"] {
  background:#fff;
  color:var(--navy);
  border-color:#d9e0ea;
  box-shadow:0 5px 16px rgba(16,24,40,.14);
}
```

## Mapa

- usar `aspect-ratio` e `height:clamp(...)` em vez de depender apenas de 280 px;
- mapa e controlos devem formar um card único;
- legenda em barra própria, com padding e line-height;
- botões de zoom com 44 px;
- piso selecionado e local selecionado devem ser óbvios;
- ao abrir resultado de pesquisa, trocar para o piso correto, destacar marcador e rolar o card do local para a vista;
- lista “Locais deste piso” deve iniciar abaixo do mapa sem ser escondida pelo dock.

## Treino

- card principal com padding mínimo de 16 px;
- respostas em uma coluna até 520 px;
- respostas em duas colunas apenas quando houver largura útil real;
- botão seguinte escondido/desativado até responder;
- feedback não deve mover a interface bruscamente;
- modo e dificuldade em controlos com estado ativo visível;
- placar e progresso devem caber em 320 px.

## Dock inferior

- respeitar `env(safe-area-inset-bottom)`;
- não cobrir botões ou conteúdo;
- ícones e labels legíveis;
- estado ativo com card/fundo, não só mudança de cor;
- `padding-bottom` do conteúdo deve considerar altura real do dock + safe area.

## Acessibilidade

- alvo mínimo 44 × 44 px;
- `:focus-visible` em todos os controlos;
- contraste WCAG AA;
- `prefers-reduced-motion`;
- `aria-live` para feedback de pesquisa e quiz;
- não comunicar estado apenas por cor;
- labels associados a inputs;
- fonte mínima recomendada de 12 px para microtexto e 14–16 px para conteúdo operacional.
