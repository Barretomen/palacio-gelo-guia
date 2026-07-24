# Auditoria do PG — Guia de Bolso

**Data da auditoria:** 24 de julho de 2026  
**Escopo:** estrutura do PWA, diretório, mapa, pesquisa, qualidade dos dados e política de verdade dos resultados.

## Veredito

O app já tem uma base muito boa e é realmente útil para trabalho operacional no Palácio do Gelo. A proposta está clara, o uso offline faz sentido e a combinação de diretório, mapas, favoritos, notas, treino, checklist de ronda, horários e contactos transforma o projeto em mais do que uma simples lista de lojas.

O ponto mais fraco é a pesquisa. Atualmente ela funciona como uma pesquisa manual de palavras-chave e pode devolver lojas apenas porque uma pequena parte da palavra ou da frase aparece em algum texto. Isto aumenta a cobertura aparente, mas também aumenta o risco de indicar uma loja errada.

## O que o app já faz bem

- PWA instalável, móvel e offline.
- Diretório com piso, unidade, referências e imagens.
- Mapas oficiais dos pisos.
- Favoritos, notas, correções e pontos personalizados em `localStorage`.
- Modo treino e checklist de ronda, muito adequados ao uso de vigilância.
- Atalhos rápidos para WC, multibanco, restauração, elevadores e farmácia.
- Importação e exportação dos dados locais.
- Estrutura simples em HTML/CSS/JavaScript puro, fácil de manter e publicar no GitHub Pages.

## Problemas encontrados na pesquisa atual

### 1. Correspondência por substring

A função atual usa, essencialmente:

```js
hay.includes(token)
```

Isso não respeita limites de palavra nem significado. Uma sequência curta pode coincidir dentro de outra palavra e criar resultados irrelevantes.

### 2. Pesquisa parcial demais

Cada palavra encontrada soma pontos independentemente das restantes. Uma pergunta com três termos pode devolver uma loja que corresponde apenas a um deles.

Exemplo de risco:

- “pilha de relógio” não deve sugerir todas as joalharias apenas porque vendem relógios;
- “manga” não deve ser corrigida para “Mango” quando a pessoa procura banda desenhada japonesa;
- “perdi a carteira” deve encaminhar para Perdidos e Achados, não para lojas que vendem carteiras.

### 3. Palavras-chave dentro do código

O objeto `catalogKeywords` está diretamente em `app.js`. Isto dificulta:

- atualizar produtos sem alterar código;
- registar fonte e data de verificação;
- distinguir informação confirmada de inferência;
- fazer manutenção por loja;
- testar a base automaticamente.

### 4. Duplicação desnecessária

Há palavras repetidas com e sem acento, embora a função de normalização já remova acentos. Isso aumenta o ficheiro sem melhorar a pesquisa.

### 5. Sem sinónimos estruturados

O sistema atual não entende de forma consistente relações como:

- telemóvel, celular, smartphone e iPhone;
- sapatilhas, ténis e sneakers;
- maquilhagem e maquiagem;
- WC, casa de banho e banheiro;
- fraldário, muda-fraldas e trocar fralda.

### 6. Sem tolerância segura a erros

Não existe correção controlada de nomes como “wroten” → “Worten”. Ao mesmo tempo, uma correção difusa aplicada a todos os produtos seria perigosa. A solução correta é aceitar erros principalmente em nomes de lojas e manter produtos com regras mais estritas.

### 7. O resultado não explica por que apareceu

O utilizador deveria ver algo como:

- **Produto correspondente:** capas de telemóvel;
- **Fonte:** catálogo oficial da marca;
- **Local:** Piso X, Loja Y;
- **Aviso:** stock local por confirmar.

Hoje aparece apenas a loja e a localização.

## Inconsistências atuais de dados

O diretório oficial atual contém 132 entradas de lojas/estabelecimentos. A base do app contém 142 registos porque também inclui vários serviços e pontos operacionais. Isso é uma boa ideia, mas lojas e serviços devem ser entidades separadas. O site oficial também lista dezenas de serviços que ainda não estavam cobertos corretamente na pesquisa.

### Registos que o app marca como não verificados, mas aparecem no diretório oficial atual

- Mayoral
- O' Dreams
- Pista de Gelo
- Tuttocars

### Registo marcado como confirmado no app, mas não encontrado no diretório oficial atual

- Inside

A indicação correta para Inside, até nova confirmação presencial, é:

> “Não correspondido no diretório oficial atual — confirmar antes de indicar ao visitante.”

### Registos válidos como serviço, mas que não devem ser tratados como loja do diretório

Entre outros:

- Balcão de Informações
- Cheque-prenda
- Desfibrilador e Primeiros Socorros
- Espaço Kids
- Minimingos
- Multibanco
- Perdidos e Achados
- WC acessível

## Serviços oficiais acrescentados à base v2

A nova base contém 39 registos de serviço, incluindo:

- Balcão de Informações e diretórios;
- Perdidos e Achados;
- cheques-prenda;
- cadeiras de rodas;
- carrinhos de bebé;
- Espaço Kids, cadeiras de bebé e zona familiar;
- parque infantil;
- fraldários e WC infantil;
- coworking, USB e tomadas;
- WC acessível e zona de repouso;
- multibancos com as localizações publicadas;
- bookcrossing;
- cinema;
- papelaria/tabacaria;
- sapateiro e cópia de chaves;
- Tax Free e câmbios;
- cabeleireiro/estética;
- farmácia, florista e laboratório;
- lavagem automóvel e booster;
- carregamento de veículos elétricos;
- estacionamento;
- levantamento de encomendas;
- primeiros socorros;
- recolha de pilhas e lâmpadas;
- marco de correio;
- telefones públicos;
- Wi-Fi;
- Pista de Gelo e Ponto de Táxi.

## A regra mais importante: catálogo não é stock

Mesmo depois de consultar um site oficial de uma marca, só é seguro afirmar que a marca **comercializa aquela categoria**. O site nacional pode ter produtos que:

- não existem na loja física de Viseu;
- estão esgotados;
- só são vendidos online;
- não existem naquele tamanho, cor, sabor ou modelo;
- pertencem a uma campanha já terminada.

Portanto, o app deve usar estas mensagens:

### Confirmado no centro

Para serviços e presença da loja:

> “Confirmado no Palácio do Gelo.”

### Categoria confirmada pela marca

Para uma família de produtos encontrada em catálogo oficial:

> “A marca comercializa esta categoria. Disponibilidade na loja de Viseu por confirmar.”

### Correspondência por categoria

Quando existe apenas inferência baseada no tipo de estabelecimento:

> “Loja compatível com esta categoria. Confirme antes de se deslocar.”

### Proibido sem integração de stock

O app não deve escrever:

> “Tem em stock.”

A menos que exista uma destas provas:

1. API de stock da loja específica;
2. página oficial que permita selecionar explicitamente a loja Palácio do Gelo/Viseu e mostre disponibilidade atual;
3. confirmação manual recente de um funcionário, com data e validade curta.

## Base de pesquisa v2 entregue

A base gerada inclui:

- **142 registos atuais do app**;
- **39 serviços oficiais/operacionais**;
- **127 registos com famílias de produtos curadas**;
- **869 frases de produtos/categorias**;
- **770 termos auxiliares de descoberta**;
- sinónimos em português de Portugal e termos usados por brasileiros/turistas;
- fontes e nível de evidência por registo;
- data de verificação;
- política explícita de stock;
- ligação entre serviços e lojas prestadoras;
- identificação dos registos que não correspondem ao diretório atual.

## Motor de pesquisa v2

O novo motor implementa:

- normalização de acentos e pontuação;
- remoção de palavras vazias como “onde”, “vende”, “tem”, “quero” e “comprar”;
- limites de palavra em vez de substring livre;
- singular/plural simples;
- frases completas;
- sinónimos estruturados;
- cobertura mínima dos termos importantes da pergunta;
- maior peso para produto confirmado do que para categoria genérica;
- correção aproximada apenas para nomes de loja quando não há resultado normal;
- serviços oficiais como resultados próprios;
- nível de confiança e motivo do resultado;
- aviso obrigatório sobre disponibilidade local.

## Exemplos validados

- “onde vende capa de iPhone” → iServices, La Casa de las Carcasas e Worten Mobile;
- “pilha de relógio” → Mister Minit, sem sugerir joalharias genéricas;
- “manga” → FNAC, sem transformar em Mango;
- “carregador USB-C” → lojas de tecnologia e acessórios compatíveis;
- “perdi a carteira” → Perdidos e Achados;
- “cadeira de rodas” → empréstimo no Balcão de Informações;
- “fraldário” → serviço oficial de fraldários/WC infantil;
- “análises ao sangue” → Unilabs/laboratório;
- “carregar carro elétrico” → postos de carregamento;
- “wroten” → sugestão de correção para Worten.

O ficheiro `search-tests-v2.js` contém 34 testes automatizados e está a passar integralmente.

## Melhorias visuais e operacionais recomendadas

### Pesquisa

Cada cartão de resultado deve mostrar:

1. nome e logótipo;
2. piso e unidade;
3. “Encontrado por: capa de telemóvel”;
4. selo de evidência;
5. aviso de stock;
6. botão “Ver no mapa”;
7. botão opcional “Confirmar por telefone/site”.

### Separar tipos de resultado

Mostrar secções diferentes:

- **Serviços do centro**;
- **Lojas que comercializam a categoria**;
- **Possíveis alternativas — confirmar**.

### Pesquisa sem resultado

Em vez de apenas esconder a caixa:

- mostrar “Não encontrei uma correspondência segura”;
- sugerir reformulação;
- permitir pesquisar por categoria;
- registar anonimamente/localmente a consulta falhada para enriquecer a base depois.

### Termos ambíguos

Para palavras como “manga”, “capa”, “bateria” e “cartão”, apresentar uma pergunta curta:

> “Está à procura de manga de livro/banda desenhada ou de roupa?”

### Contagem dinâmica

O texto “142 LOCAIS CADASTRADOS” está fixo no HTML e pode ficar desatualizado. Deve ser preenchido por JavaScript a partir da quantidade real de lojas e serviços.

### Atualização e auditoria

Adicionar uma área administrativa simples com:

- última verificação;
- fonte;
- nível de confiança;
- “confirmado presencialmente em”;
- validade da confirmação;
- botão para desativar uma loja temporariamente;
- fila de consultas sem resultado.

### Feedback operacional

Depois de uma indicação, permitir marcar:

- “Visitante encontrou”;
- “Loja não vendia”;
- “Loja fechada/mudou”;
- “Localização incorreta”.

Isso cria uma base real do Palácio do Gelo, superior a um catálogo nacional genérico.

## Prioridade recomendada

1. Substituir a função de pesquisa.
2. Separar lojas e serviços.
3. Implantar a política de evidência/stock.
4. Corrigir verificações inconsistentes, especialmente Inside.
5. Exibir motivo e confiança no resultado.
6. Criar registo de consultas sem resultado.
7. Só depois ampliar rotas, IA conversacional ou novas funções visuais.

## Fontes oficiais principais

### Centro comercial

- Diretório oficial de lojas do Palácio do Gelo;
- página oficial de serviços do Palácio do Gelo.

### Catálogos de marcas verificados diretamente

- ALDO;
- Auchan e Auchan O Meu Pet;
- Benetton;
- C&A;
- Calzedonia;
- Centroxogo;
- Chicco;
- Cortefiel;
- Deichmann;
- Desigual;
- Douglas;
- Druni;
- FNAC;
- H&M;
- Intimissimi;
- JD Sports;
- Mango;
- Mayoral;
- O Boticário;
- Parfois;
- Pluricosmética;
- Primark;
- Wells;
- Women'secret;
- Worten e Worten Mobile.

Os endereços oficiais, o tipo de fonte e a associação de cada loja estão guardados no campo `sources` e em `sourceIds`/`sourceUrls` do ficheiro `catalogo-pesquisa-v2.json`.

## Limite desta entrega

A presença atual das lojas e a lista de serviços foram cruzadas com fontes oficiais do Palácio do Gelo. Foram verificados diretamente 25 catálogos oficiais de marcas, associados a 27 registos do app (algumas marcas têm mais de um registo, como Worten/Worten Mobile e Auchan/O Meu Pet). As restantes famílias foram curadas com base na atividade conhecida da marca e na categoria oficial do centro, ficando claramente marcadas no JSON com nível de evidência inferior.

Isso é deliberado: uma base honesta, que mostra o que está confirmado e o que ainda precisa de confirmação, é mais segura do que uma lista “completa” que inventa certeza.
