# Integração técnica — Pesquisa v2

## Ficheiros a copiar para o projeto

- `catalogo-pesquisa-v2.js`
- `search-engine-v2.js`

Opcional para manutenção e validação:

- `catalogo-pesquisa-v2.json`
- `search-tests-v2.js`
- `cobertura-lojas.csv`

## Ordem dos scripts no `index.html`

Carregar depois de `data.js` e antes de `app.js`:

```html
<script src="data.js"></script>
<script src="store-media.js"></script>
<script src="catalogo-pesquisa-v2.js"></script>
<script src="search-engine-v2.js"></script>
<script src="app.js"></script>
```

## Inicialização

O ficheiro do motor cria automaticamente:

```js
window.pgSearch
```

Também pode ser inicializado manualmente:

```js
const pgSearch = window.PG_SEARCH_V2.makeSearchEngine(
  window.PG_SEARCH_CATALOG_V2
);
```

## Uso básico

```js
const results = pgSearch.search('onde vende capa de iphone', {
  maxResults: 12
});
```

Cada resultado contém, conforme o tipo:

```js
{
  type: 'store' | 'service',
  id,
  name,
  score,
  confidence,
  label,
  reasons,
  locations,
  providers,
  matchedTerms,
  officialCenterUrl,
  stockGuaranteed,
  availabilityMessage
}
```

## Substituição da pesquisa antiga

Remover ou deixar de chamar:

- `catalogKeywords`;
- `enrichSearchText()`;
- a versão atual de `searchPlaces()` baseada em `hay.includes(token)`.

Criar uma função adaptadora:

```js
function searchPlaces(query, limit = 12) {
  return window.pgSearch.search(query, { maxResults: limit });
}
```

A interface antiga espera objetos de loja. Portanto, também é necessário adaptar `resultButton()` e o clique dos resultados para aceitar `type: "service"`.

## Renderização recomendada

```js
function resultButton(result) {
  const place = result.type === 'store'
    ? allPlaces().find(item => item.id === result.id)
    : null;

  const floor = result.locations?.length
    ? result.locations.map(loc => `${floorLabel(loc.floor)}${loc.unit ? ` · ${loc.unit}` : ''}`).join(' / ')
    : 'Localização no detalhe';

  return `
    <button class="search-result search-result-v2"
            type="button"
            data-result-type="${esc(result.type)}"
            data-result-id="${esc(result.id)}">
      ${place ? placeVisual(place, 'small') : '<span class="service-icon">ℹ️</span>'}
      <span class="result-main">
        <b>${esc(result.name)}</b>
        <small>${esc(floor)}</small>
        <small class="match-reason">${esc(result.label)}</small>
      </span>
      <span class="confidence confidence-${esc(result.confidence)}">
        ${result.confidence === 'high' ? 'Confirmado' : result.confidence === 'medium' ? 'Confirmar stock' : 'Verificar'}
      </span>
    </button>`;
}
```

## Abertura de serviço

Ao clicar num serviço:

1. abrir um modal de serviço;
2. mostrar localização publicada;
3. mostrar lojas prestadoras (`providers`), quando existirem;
4. permitir abrir a loja prestadora no mapa;
5. mostrar a fonte e a data da última verificação.

Nunca converter silenciosamente um serviço em loja. Exemplo: “cadeira de rodas” é um serviço prestado pelo Balcão de Informações, não um produto vendido pelo balcão.

## Agrupamento de resultados

Ordenar visualmente por:

1. serviços oficiais com intenção clara;
2. produto confirmado no catálogo da marca;
3. família de produtos curada;
4. correspondência genérica de categoria;
5. sugestão de correção de nome.

## Política de texto obrigatória

### Permitido

- “A marca comercializa esta categoria.”
- “Serviço confirmado no Palácio do Gelo.”
- “Disponibilidade na loja de Viseu por confirmar.”

### Não permitido sem prova de stock

- “A loja tem o produto.”
- “Está disponível.”
- “Pode ir lá que encontra.”

## Contagem dinâmica

Trocar o texto fixo do `index.html` por:

```html
<span id="directoryCount" class="micro-label"></span>
```

E preencher:

```js
const catalog = window.PG_SEARCH_CATALOG_V2;
document.querySelector('#directoryCount').textContent =
  `${catalog.scope.storeRecords} LOCAIS + ${catalog.scope.officialServiceRecords} SERVIÇOS`;
```

## Registos que exigem ação

- Marcar Mayoral, O' Dreams, Pista de Gelo e Tuttocars como presentes no diretório atual.
- Marcar Inside como “não correspondido no diretório oficial atual”.
- Não tratar “Auchan — O Meu Pet” como loja independente sem confirmação; pode ser uma área/departamento do Auchan.
- Manter Balcão, WC, Multibanco, Espaço Kids etc. na coleção de serviços.

## Testes

Executar:

```bash
node search-tests-v2.js
```

Resultado esperado:

```text
OK — 34 testes de pesquisa passaram.
```

## Service worker

Depois de copiar os ficheiros, acrescentá-los à lista de cache do `sw.js` e alterar a versão do cache. Caso contrário, telemóveis que já instalaram o PWA podem continuar a usar a pesquisa antiga.
