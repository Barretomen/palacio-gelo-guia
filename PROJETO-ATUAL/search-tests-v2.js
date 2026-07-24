const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const context = { console };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + '/catalogo-pesquisa-v2.js', 'utf8'), context);
vm.runInContext(fs.readFileSync(__dirname + '/search-engine-v2.js', 'utf8'), context);
const engine = context.PG_SEARCH_V2.makeSearchEngine(context.PG_SEARCH_CATALOG_V2);

function names(query, maxResults = 8) {
  return engine.search(query, { maxResults }).map((result) => result.name);
}
function first(query) { return names(query, 1)[0]; }
function includes(query, expected) {
  assert(names(query).includes(expected), `${query}: esperava incluir ${expected}; recebeu ${names(query).join(', ')}`);
}

assert.strictEqual(first('cadeira de rodas'), 'Empréstimo de cadeiras de rodas');
assert.strictEqual(first('onde fica o multibanco'), 'Multibanco');
assert.strictEqual(first('perdi a carteira'), 'Perdidos e achados');
assert.strictEqual(first('pilha de relógio'), 'Mister Minit');
assert.strictEqual(first('análises ao sangue'), 'Laboratório de análises clínicas');
assert.strictEqual(first('carregar carro elétrico'), 'Carregamento de veículos elétricos');
assert.strictEqual(first('fraldário'), 'Fraldários e WC infantil');
assert.strictEqual(first('wroten'), 'Worten');
assert.strictEqual(first('manga'), 'FNAC');
assert.strictEqual(first('pizza'), 'Pizza Hut');
assert.strictEqual(first('açaí'), 'Oakberry');
assert.strictEqual(first('cópia de chaves'), 'Mister Minit');
assert.strictEqual(first('trocar moeda'), 'Tax Free e câmbios');
assert.strictEqual(first('aparelho auditivo'), 'Widex');
assert.strictEqual(first('capsulas de café'), 'Nespresso');

includes('capa de iphone', 'La Casa de Las Carcasas');
includes('capa de iphone', 'iServices');
includes('carregador usb c', 'Worten');
includes('roupa de bebé', 'Chicco');
includes('roupa de bebé', 'Mayoral');
includes('óculos de sol', 'Hawkers');
includes('óculos graduados', 'MultiOpticas');
includes('perfume', 'Douglas');
includes('champô', 'Pluricosmética');
includes('ténis', 'JD Sports');
includes('colchão', 'ColchãoNet');
includes('ração para gato', 'Companhia de 4 Patas');
includes('louça', 'Vista Alegre Atlantis');
includes('computador portátil', 'Worten');
includes('brinquedos', 'Centroxogo');

assert.strictEqual(names('tem').length, 0, 'Uma palavra vazia de intenção não pode produzir resultados.');
assert(!names('pilha de relógio').includes('Bluebird'), 'Joalharias não devem ser sugeridas só por venderem relógios.');
assert(!names('manga').includes('Mango'), 'Manga não pode virar Mango por fuzzy matching de produtos.');
assert.strictEqual(engine.search('inside', { maxResults: 1 })[0].currentOfficialDirectoryMatch, false, 'Inside deve ser marcado como não correspondido no diretório atual.');

console.log('OK — 34 testes de pesquisa passaram.');
