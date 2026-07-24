# Diretrizes do redesign — Guia Operacional Palácio do Gelo

## Objetivo
Transformar o projeto atual numa aplicação institucional com aparência de produto final, preservando a rapidez de consulta e todas as funções existentes.

## Mudanças prioritárias

1. **Separar as áreas por intenção**
   - Visão geral: pesquisa, posição, ronda e acessos recentes.
   - Mapa: mapa em destaque, sem conteúdo operacional concorrente.
   - Diretório: pesquisa, filtros e resultados.
   - Treino: perguntas e referências.
   - Ferramentas: notas, rádio, contactos, exportação e configurações.

2. **Pesquisa como ação principal**
   - Campo central e grande na página inicial.
   - Resposta direta antes da lista completa.
   - Exibir localização, nível de confirmação e aviso de stock.
   - Separar produto, serviço e ocorrência operacional.

3. **Sistema visual consistente**
   - Conteúdo central com largura máxima entre 1120 e 1200 px.
   - Cards com raio de 16–18 px, borda discreta e sombra leve.
   - Espaçamento baseado em múltiplos de 4 px.
   - Um único azul para ações; verde para confirmação; âmbar para atenção; vermelho apenas para SOS.
   - Ícones da mesma família, sem mistura de emojis com símbolos tipográficos.

4. **Desktop e telemóvel diferentes**
   - Desktop: barra lateral fixa e cabeçalho superior.
   - Telemóvel: remover a lateral e usar dock inferior.
   - Cards de 3 ou 4 colunas no desktop; uma coluna no telemóvel.
   - Botões com pelo menos 42 px de altura em interfaces táteis.

5. **Reduzir ruído**
   - Não apresentar todos os módulos na página inicial.
   - Usar textos curtos e detalhes progressivos.
   - Evitar microtextos em maiúsculas em excesso.
   - Não aplicar sombras fortes, gradientes em todos os cards ou efeitos de vidro em toda a aplicação.

## Componentes demonstrados no HTML
- Sidebar responsiva e dock móvel.
- Cabeçalho institucional com estado e SOS.
- Pesquisa com resposta inteligente e evidência.
- Métricas de visão geral.
- Mapa centralizado com seletor de pisos.
- Painel de ronda.
- Cards de lojas.
- Serviços essenciais.
- Diretório com filtros.
- Tela de treino.
- Centro operacional.

## Integração sugerida
O HTML entregue é um conceito funcional standalone. Para integrar no projeto:

- manter `data.js`, o catálogo de pesquisa e a lógica atual como fonte de dados;
- quebrar a renderização em componentes/funções menores;
- migrar os estilos do protótipo para `styles.css`;
- substituir dados estáticos dos cards por renderização a partir do catálogo;
- manter os IDs exigidos pela lógica existente ou atualizar os seletores em `app.js` de forma coordenada;
- atualizar a versão dos assets no `sw.js` para evitar cache do design anterior;
- testar instalação PWA, funcionamento offline, diálogos e armazenamento local após a migração.

## Regra de produto
A interface pode afirmar que uma loja trabalha determinada categoria quando houver evidência. Não deve afirmar disponibilidade local de modelo, cor, tamanho ou stock sem uma fonte de inventário da unidade.
