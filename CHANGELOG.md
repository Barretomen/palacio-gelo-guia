# Changelog — PG Guia de Bolso v1.3.2

Todas as alterações efetuadas nesta versão mestre estão resumidas abaixo.

## [1.3.2] - 2026-07-24

### Adicionado
- **Ficheiro `catalogo-perguntas.js`**: Banco de dados determinístico em JavaScript offline contendo o repositório mestre de perguntas contextuais e cenários derivados do Manual de Operações (02/2013).
- **Separador de Modo Público vs. Operacional Privado**:
  - Comutador por trinco (`#toggleModeBtn`) no cabeçalho superior e caixa de seleção (`#operationalModeToggle`) no perfil de utilizador da barra lateral.
  - Ocultação automática de todas as vistas confidenciais (`Treino` e `Mais`) no Modo Público para evitar indexação pública ou exposição inadequada.
- **Novas Ferramentas do Manual (Centro Operacional)**:
  - **Pessoa Perdida**: Assistente com cronómetro integrado de 5 minutos, checklists de zonas inspecionadas e vestuário, e gerador de mensagem rápida para rádio.
  - **Perdidos e Achados**: Painel local offline com registo de cadeia de custódia e estados atualizáveis (*Recebido*, *Contactado*, *Entregue*, *Encaminhado*).
  - **Ocorrências**: Criador de relatórios e exportação instantânea como ficheiro `.txt` local.
  - **Rádio Wizard**: Gerador contextual de rádio speak padronizado com os códigos correctos.
  - **Protocolos**: Fichas pesquisáveis de "Fazer / Não Fazer" para cenários de risco.
  - **Passagem de Turno**: Assistente rápido com cópia estruturada para área de transferência.

### Corrigido
- **Responsividade do Layout**:
  - Novo CSS flexível para o cabeçalho superior prevenindo sobreposição de elementos em ecrãs estreitos de 320 px (comutador de flex-wrap e quebra para duas linhas controlada).
  - O `#quizAnswers` e o `#quizCard` foram reestruturados, eliminando estilos inline e garantindo uma única coluna no mobile e grelha fluida no desktop.
  - Correção na grelha do Hero (`.hero-grid`), que passa a empilhar em coluna única no mobile.
- **Seletor de Pisos (`#floorTabs`)**:
  - Definição completa de estilos em `styles.css`.
  - Introdução de comportamento de Segmented Control com sombras e botões táteis de 44 px.
  - Inserção de atributos ARIA (`role="tab"` e `aria-selected`) atualizados a cada clique para acessibilidade.
- **Trava e Fluxo de Treino**:
  - Implementação de máquina de estados estrita: `unanswered` -> `answered` (grade com feedbacks coloridos e fonte visível) -> `ready-next`.
  - Bloqueio completo do avanço e de duplo clique de pontuação.
  - Confirmação explícita antes de quebrar sessões ou alterar categorias.
  - Prevenção de perguntas de piso ambíguas (apenas lojas de piso único são selecionadas dinamicamente).
- **Offline e PWA**:
  - Remoção de fontes Google externas, substituindo por uma stack robusta de fontes locais do sistema para fiabilidade 100% offline.
  - Registo do novo script no cache do Service Worker e incremento da build de cache para `v1.3.2`.
