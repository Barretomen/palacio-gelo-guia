# Análise técnica do projeto atual

## Diagnóstico principal

A nova identidade visual é boa no desktop, mas a implementação ainda não é verdadeiramente mobile-first. A maioria dos problemas vistos nas capturas vem de regras CSS ausentes, estilos inline que bloqueiam os media queries e componentes que mantêm a geometria de desktop em ecrãs estreitos.

## Defeitos confirmados no código

### 1. O seletor de pisos não possui CSS

O HTML usa `class="floor-tabs"` e o JavaScript aplica `active`, mas não existe uma regra `.floor-tabs` nem `.floor-tabs button` em `styles.css`. Por isso os pisos aparecem como texto/botões quase nativos e o selecionado não possui diferenciação visual real.

Correção obrigatória:
- container tipo segmented control ou cards compactos;
- estado selecionado com fundo, borda, sombra e contraste;
- `aria-selected`, `role="tab"` e foco visível;
- scroll horizontal em ecrãs pequenos;
- área de toque mínima de 44 × 44 px.

### 2. A classe global `.hidden` não existe

O JavaScript utiliza `classList.add('hidden')` e `classList.remove('hidden')` em vários elementos, incluindo:
- botão “Próxima pergunta”;
- botão de instalação;
- feedbacks e elementos auxiliares.

No CSS existe somente `.search-results-v2.hidden`. Não existe `.hidden { display:none }`. Consequência: o botão “Próxima pergunta” fica visível antes de responder e permite avançar livremente.

Correção obrigatória:
```css
.hidden { display: none !important; }
```
Além disso, componentes interativos devem usar também `disabled`, `aria-disabled` e estado interno; não depender apenas de esconder visualmente.

### 3. Estilos inline anulam a responsividade

O projeto possui aproximadamente **68 atributos `style="..."`** no `index.html`. Exemplo crítico:

```html
<div id="quizAnswers" class="answers"
     style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
```

O media query tenta mudar `.answers` para uma coluna, mas o estilo inline tem prioridade e impede a alteração. Isso explica as respostas apertadas em duas colunas no telemóvel.

Correção obrigatória:
- remover estilos estruturais inline;
- mover layout, espaçamento, tamanhos e cores para classes CSS;
- deixar inline apenas valores realmente dinâmicos, como percentagem de progresso, quando necessário.

### 4. O hero mantém duas colunas no telemóvel

`.hero-grid` fica sempre com duas colunas e `.hero-stat` possui `min-width:220px`. Não existe override mobile. Em 390 px, o título é esmagado numa coluna muito estreita e quebra quase palavra por palavra.

Correção obrigatória:
- abaixo de 700–760 px, `grid-template-columns:1fr`;
- estatística abaixo do texto, com borda superior em vez de borda lateral;
- remover `min-width` rígido;
- usar `clamp()` na tipografia;
- limitar a largura ideal do texto, sem quebrar uma palavra por linha.

### 5. Classes importantes usadas no HTML não têm definição completa

Entre as classes sem regra dedicada ou dependentes de inline estão:
- `floor-tabs`;
- `training-grid`;
- `training-tabs`;
- `quiz-feedback`;
- `map-hint`;
- `section-heading`;
- `placeholder-page`;
- `floating-tools`;
- `score-pill`;
- `count-badge`.

Isso torna o visual inconsistente e dificulta a manutenção.

### 6. Breakpoints insuficientes

Há breakpoints em 1100, 820 e 520 px, mas o produto precisa funcionar de 320 px para cima. O layout deve ser fluido, não apenas trocar de duas colunas para uma em um único ponto.

### 7. Tipografia pequena demais

Há muitos textos com 9, 10 e 11 px. Num contexto operacional e em movimento, isso prejudica a leitura. Inputs abaixo de 16 px também podem provocar zoom automático no iPhone.

### 8. Perguntas de piso podem ser ambíguas

O gerador escolhe uma localização aleatória de uma loja. Se a loja possuir mais de uma unidade/piso, a pergunta “Em que piso fica X?” pode ter mais de uma resposta verdadeira.

Correção:
- perguntas simples somente para lojas com uma única localização confirmada;
- para múltiplas localizações, mencionar a unidade ou perguntar “Em quais pisos…”;
- cada pergunta deve possuir ID, fonte e explicação.

### 9. Trocar o modo do treino gera outra pergunta sem resposta

Os botões Misto/Direções/Pisos chamam `nextQuestion()` imediatamente. Isso permite ignorar questões e contornar a trava.

### 10. A fonte externa compromete o offline

A tipografia é carregada do Google Fonts. Em modo offline a aparência pode mudar. Preferir uma stack de sistema ou garantir estratégia de cache legal e funcional. Para máxima confiabilidade PWA, usar fonte de sistema.

## O que já está bom e deve ser preservado

- separação Início/Mapa/Diretório/Treino/Ferramentas;
- sidebar no desktop e dock inferior no telemóvel;
- motor Pesquisa v2 e os 34 testes atualmente aprovados;
- mapas, favoritos, notas, pontos personalizados e armazenamento local;
- identidade azul-marinho institucional;
- funcionamento em HTML/CSS/JavaScript puro;
- PWA e uso offline.
