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
- Imagens oficiais disponíveis para 132 lojas, com monograma de segurança nos restantes locais.
- Plantas oficiais em alta resolução para os pisos -2, -1, P0, 0, 1, 2 e 3.
- Piso e unidade transcritos do diretório fotografado.
- Lista pública complementada pelo site oficial.
- Correções, favoritos, notas e pontos personalizados ficam no `localStorage` do dispositivo.

As áreas a azul nas plantas são referências visuais do ficheiro oficial de origem. No Piso 0, a loja pesquisada pode ser destacada por um marcador aproximado.
