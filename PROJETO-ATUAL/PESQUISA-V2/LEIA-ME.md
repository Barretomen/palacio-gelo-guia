# Pacote Pesquisa v2 — PG Guia de Bolso

Este pacote foi preparado para o Antigravity integrar uma pesquisa mais completa e mais segura no app existente, sem reescrever o projeto.

## Começar por aqui

1. Abra `PROMPT-ANTIGRAVITY.txt` e envie o texto ao Antigravity com este pacote anexado.
2. Use `INTEGRACAO-ANTIGRAVITY.md` como especificação técnica.
3. Consulte `RELATORIO-AUDITORIA.md` para entender os problemas encontrados e as prioridades.

## Ficheiros principais

- `catalogo-pesquisa-v2.json`: base estruturada, legível e editável.
- `catalogo-pesquisa-v2.js`: mesma base pronta para carregar no navegador.
- `search-engine-v2.js`: motor de pesquisa sem dependências.
- `search-tests-v2.js`: 34 testes automatizados.
- `cobertura-lojas.csv`: uma linha por registo, com cobertura e nível de evidência.
- `estatisticas.json`: números consolidados da entrega.
- `stores-original.json`: fotografia dos dados originais usados na auditoria.
- `build_catalog.py`: gerador reprodutível da base.

## Números da entrega

- 142 registos existentes analisados;
- 39 serviços oficiais/operacionais;
- 127 registos com famílias de produtos curadas;
- 869 frases de produtos/categorias;
- 770 termos auxiliares;
- 25 catálogos oficiais de marcas verificados diretamente, associados a 27 registos;
- 131 páginas oficiais do centro associadas;
- 34 testes de pesquisa aprovados.

## Regra de verdade

A base diz que uma loja ou marca comercializa uma categoria; ela não promete stock físico atual na unidade de Viseu. Sem API de stock local ou confirmação recente, a interface deve mostrar “disponibilidade na loja por confirmar”.

## Validar localmente

```bash
node --check search-engine-v2.js
node search-tests-v2.js
python -m json.tool catalogo-pesquisa-v2.json > /dev/null
```
