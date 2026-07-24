# Relatório de Testes de Aceitação — PG Guia de Bolso v1.3.2

Este documento resume a validação da interface, responsividade, travagem de quiz, acessibilidade e novas ferramentas operacionais nas resoluções especificadas.

---

## 1. Responsividade e Geometria de Ecrã

Todos os testes foram executados com sucesso em ambiente Chrome com emulação de dispositivos.

| Resolução (px) | Dispositivo de Referência | Scroll Horizontal? | Colisão de Título? | Observações / Comportamento |
| :--- | :--- | :---: | :---: | :--- |
| **320 × 568** | iPhone SE (Compacto) | Não | Não | Topbar quebra em duas linhas com as ações abaixo do título. SOS legível. |
| **360 × 640** | Galaxy S8+ | Não | Não | Visual fluido. Grelhas de cartões renderizam a 1 coluna. |
| **375 × 667** | iPhone 8 / SE 2nd | Não | Não | Excelente adaptação de margens e preenchimentos. |
| **390 × 844** | iPhone 12/13/14 | Não | Não | Dock inferior perfeitamente posicionado respeitando safe areas. |
| **412 × 915** | Pixel 7 | Não | Não | Todos os botões táteis medem mais de 44 px. Inputs confortáveis de ler. |
| **480 × 800** | Telemóvel Médio | Não | Não | Visualização de mapas e controlos sem transbordar o ecrã. |
| **768 × 1024** | iPad (Modo Retrato) | Não | Não | Layout de transição. Sidebar oculta e dock móvel ativo. |
| **1024 × 768** | iPad (Modo Paisagem) | Não | Não | Layout desktop ativo. Sidebar visível. Grelhas a 2 colunas. |
| **1366 × 768** | Laptop / Computador | Não | Não | Área útil útil limitada a 1200 px. Visualização limpa e institucional. |

---

## 2. Validação Funcional das Correções

### A. Seletor de Pisos (Floor Selector)
- **Diferenciação Visual**: O piso ativo destaca-se com fundo branco elevado e sombra perceptível (`box-shadow`), com fundo geral cinzento suave.
- **Acessibilidade**: Atributos `aria-selected` e `role="tab"` actualizam-se corretamente com as seleções e navegação por teclado (`:focus-visible`) visível.
- **Scroll Horizontal**: Em 320 px, as abas de pisos deslizam perfeitamente na horizontal sem quebrar o layout da página.

### B. Trava e Estados do Treino
- **Trava operacional**: O botão "Próxima pergunta" fica 100% oculto (`.hidden`) antes de ser dada uma resposta. Não é possível avançar arbitrariamente.
- **Bloqueio de duplo clique**: Ao selecionar uma opção, todos os botões de resposta são marcados como `disabled`, impossibilitando alteração de resposta ou soma dupla de pontos.
- **Perguntas de Piso**: Testadas lojas com múltiplos pisos (ex.: Worten, Auchan). Nenhuma foi selecionada dinamicamente para gerar a pergunta simples "Em que piso fica X?", garantindo 0% de ambiguidade.
- **Estudo de erros**: Ao terminar, as perguntas falhadas aparecem listadas na revisão com o motivo e o botão "Rever Erros" gera um sub-treino apenas com as incorretas.

### C. Novas Ferramentas do Manual
- **Pessoa Perdida**: O cronómetro de 5 minutos corre em segundo plano e a sua contagem decrescente resiste ao recarregamento da página (armazenado no localStorage). Ultrapassado o tempo, pisca um aviso de escalonamento prioritário a vermelho.
- **Perdidos e Achados**: Adição e eliminação de objetos locais funciona perfeitamente, registando e mantendo a cadeia de custódia localmente.
- **Relatório de Ocorrências**: Permite escrever relatórios detalhados sem guardar dados sensíveis e exportá-los individualmente em ficheiros `.txt`.
- **Limpeza de dados**: O botão "Limpar tudo" na aba de privacidade limpa 100% dos dados gerados, deixando o dispositivo com as configurações de fábrica limpas.

---

## 3. Lista de Chaves de LocalStorage

A aplicação preserva e migra as chaves de armazenamento local de forma segura e transparente.

- **Chave Principal**: `pg-guia-bolso-v1`
  - *Conteúdo interno*:
    - `favorites`: Lista de IDs de locais marcados como favoritos.
    - `overrides`: Lojas corrigidas pelo operador no terreno.
    - `customPlaces`: Marcadores personalizados criados.
    - `notes`: Notas escritas (com os novos modelos de rádio speak migrados).
    - `quiz`: Pontuação cumulativa histórica do quiz.
    - `patrol`: Registo diário de rondas efetuadas por piso.
    - `userFloor`: Última posição de piso guardada do operador.
    - `userDir`: Última direção de zona guardada do operador.
    - `failedSearches`: Termos de pesquisa que não obtiveram resultado.
    - `feedbacks`: Eventos de feedback de cliques nas lojas ("Visitante encontrou", "Incorreto", etc.).
    - `operationalMode`: Configuração de visualização (Público vs. Operacional Privado).
    - `trainingSession`: Estado ativo da sessão de quiz em curso (para suportar recarregamento).
    - `lostPerson`: Dados temporários e início de cronómetro do assistente de pessoa perdida.
    - `lostAndFoundItems`: Objeto perdidos e achados registados.
    - `occurrences`: Relatório local de ocorrências gravadas.

---

## 4. Pendências de Validação Operacional (Manual 02/2013)

Tendo em conta que a fonte de informação principal é o Manual de 2013, as seguintes regras devem ser validadas pela chefia da segurança do Palácio do Gelo antes de serem tidas como procedimentos vigentes de posto:

1. **Tempo de Escalonamento de Menor (5 minutos)**: Confirmar se o tempo para repetir a mensagem de rádio e acionar âncoras/PSP se mantém em 5 minutos ou se deve ser alterado.
2. **Números de SOS**: Garantir que o número móvel interno da Central de Segurança PG (`910 000 000`) e o ramal interno (`2118`) se encontram atualizados.
3. **Cadeia de Custódia de Perdidos e Achados**: Confirmar se o encaminhamento oficial de artigos não reclamados se faz para a PSP ou se existe outro protocolo de conservação interno.
4. **Procedimento de Abordagem em Suspeitas de Furto**: Validar se o vigilante deve atuar apenas como reforço passivo do lojista (procedimento de 2013) ou se as regras de abordagem em flagrante delito sofreram alterações regulamentares.
