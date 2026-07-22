# PG — Guia de Bolso

PWA móvel e offline para consulta de lojas, pisos, unidades, referências cardeais, horários, treino e notas pessoais.

## Abrir a aplicação

**[Abrir o PG — Guia de Bolso](https://barretomen.github.io/palacio-gelo-guia/)**

No telemóvel, abra o link no Chrome ou Safari e escolha **Instalar aplicação** ou **Adicionar ao ecrã principal**.

## Referências cardeais configuradas
- Norte: lado da MEO
- Sul: lado do Auchan
- Poente: lado da Farmácia Pinto de Campos
- Nascente: lado oposto à Farmácia

Para testar no computador:
```bash
python -m http.server 8080
```
Abra `http://localhost:8080`.

## Dados
- 142 locais pesquisáveis.
- Piso e unidade transcritos do diretório fotografado.
- Lista pública complementada pelo site oficial.
- Correções, favoritos, notas e pontos personalizados ficam no `localStorage` do dispositivo.

Alguns pisos usam miniaturas do diretório porque ainda não há fotografias aproximadas de cada mapa. O app permite atualizar dados à medida que forem confirmados no terreno.
