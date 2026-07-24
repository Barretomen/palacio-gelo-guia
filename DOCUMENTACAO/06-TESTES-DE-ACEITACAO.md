# Testes de aceitação obrigatórios

## A. Responsividade

Testar 320, 360, 375, 390, 412, 480, 768, 1024 e 1366 px.

Em todas:
- nenhum scroll horizontal;
- nenhum texto letra/palavra por linha por falta de espaço;
- header sem colisão;
- SOS acessível;
- conteúdo não coberto pelo dock;
- inputs e botões totalmente visíveis;
- mapa e cards dentro do viewport.

## B. Pisos

1. Abrir Mapa.
2. Selecionar cada piso.
3. Confirmar diferenciação visual inequívoca.
4. Confirmar `aria-selected` e foco.
5. Confirmar que em 320 px os pisos podem ser percorridos horizontalmente.
6. Recarregar e verificar persistência, se implementada.

## C. Treino e trava

1. Abrir treino.
2. Confirmar que “Próxima pergunta” está escondido ou disabled antes da resposta.
3. Tentar clicar/mudar modo e garantir que não ignora a pergunta sem confirmação.
4. Responder.
5. Confirmar bloqueio de todas as respostas.
6. Confirmar que a pontuação aumenta uma única vez.
7. Confirmar feedback, explicação e fonte.
8. Avançar somente depois da resposta.
9. Recarregar durante sessão e verificar recuperação coerente.
10. Testar loja com múltiplas unidades e garantir pergunta não ambígua.

## D. Pesquisa e mapa

- executar os 34 testes existentes;
- pesquisar “wroten”, “manga”, “pilha de relógio”, “perdi a carteira”, “cadeira de rodas”;
- abrir resultado e confirmar piso/local correto;
- confirmar aviso de stock local;
- confirmar separação de lojas e serviços.

## E. PWA

- instalar;
- abrir offline;
- mapas, catálogo, treino público e funções permitidas devem carregar;
- atualizar cache sem manter HTML/CSS antigo;
- fonte e ícones funcionam offline;
- dados locais existentes são preservados.

## F. Acessibilidade

- navegação por teclado;
- foco visível;
- leitura dos estados por leitor de ecrã;
- contraste;
- touch targets;
- `aria-live` no quiz e pesquisa;
- `prefers-reduced-motion`.

## G. Segurança

- confirmar que fotos do manual e banco operacional não entram no build público;
- confirmar que um simples acesso ao repositório não revela procedimentos internos;
- confirmar limpeza/exportação dos dados pessoais locais.

## Entrega exigida

- ZIP completo do projeto;
- `CHANGELOG.md`;
- `TEST-REPORT.md` com resultado de cada largura;
- screenshots de 320, 360, 390, 412, 768 e desktop;
- lista de chaves de localStorage preservadas/migradas;
- indicação clara do que ficou pendente de validação operacional.
