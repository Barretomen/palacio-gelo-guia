# Segurança, privacidade e publicação

## Risco atual

O README aponta para GitHub Pages público. O Manual de Operações contém informações internas de segurança, comunicações, funções, rotinas, zonas técnicas e respostas a emergências. Colocar esse conteúdo dentro de um repositório/site público pode expor procedimentos que não devem estar disponíveis a qualquer pessoa.

## Regra obrigatória

Separar o produto em duas camadas:

### Modo público
- lojas, serviços, horários e mapas públicos;
- pesquisa de produtos;
- acessibilidade e informação ao visitante;
- sem códigos internos, postos, rondas, acessos técnicos ou procedimentos detalhados.

### Modo operacional privado
- treino do manual;
- procedimentos internos;
- relatórios;
- passagem de turno;
- pessoa perdida;
- rádio;
- rondas e funções.

## Implementação recomendada

Melhor opção: projeto operacional separado, alojado com autenticação real ou usado apenas localmente.

Uma senha/PIN implementada somente em JavaScript num site público **não protege** ficheiros publicados: qualquer pessoa pode abrir o código e os dados. Não tratar um PIN client-side como segurança.

Alternativas aceitáveis:
- aplicação privada separada atrás de autenticação real;
- pacote operacional importado localmente e não incluído no repositório;
- build local/offline distribuído apenas aos utilizadores autorizados.

## Dados pessoais

- minimizar dados de menores e pessoas envolvidas;
- não guardar documentos, números de cartões ou dados médicos;
- armazenamento local com prazo de eliminação;
- botão “Exportar e apagar”;
- não enviar fotos/relatórios automaticamente;
- mostrar aviso quando um campo puder conter dado pessoal;
- permitir limpeza completa dos dados operacionais.

## Manual antigo

Todas as entradas derivadas do manual devem conter:
- fonte;
- secção;
- imagem/página;
- data `2013-02`;
- `requiresCurrentValidation: true`;
- selo visível “Validar com chefia”.
