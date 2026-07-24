# Novo treino operacional

## Problema atual

O treino atual gera apenas perguntas diretas de direção ou piso, permite avançar sem responder e não oferece uma sessão estruturada. Ele mede memória superficial, mas não prepara bem para decisões de serviço.

## Máquina de estados obrigatória

Cada pergunta deve passar por:

1. `unanswered` — respostas habilitadas; botão seguinte escondido/desativado;
2. `answered-correct` ou `answered-wrong` — respostas bloqueadas, feedback e explicação visíveis;
3. `ready-next` — botão seguinte habilitado;
4. `session-summary` ao finalizar a sessão.

Regras:
- não permitir avançar sem resposta;
- não permitir pontuar duas vezes;
- mudar categoria não pode trocar a pergunta atual sem confirmação;
- se o utilizador decidir saltar, registrar como “ignorada” e não como acertada;
- persistir sessão sem corromper o placar histórico;
- evitar repetição imediata da mesma pergunta;
- revisar automaticamente perguntas erradas.

## Modos recomendados

- **Rápido:** 5 perguntas.
- **Turno:** 10 perguntas.
- **Avaliação:** 20 perguntas, sem mostrar resposta até o fim.
- **Revisão de erros:** somente perguntas erradas ou marcadas.

## Categorias

- Orientação e pontos cardeais;
- Pisos, lojas e serviços;
- Comunicação via rádio;
- Pessoas perdidas;
- Perdidos e achados;
- Reclamações;
- Situações de conflito/agressividade;
- Furtos e apoio ao lojista;
- Acidentes pessoais e auxílio;
- Evacuação e segurança geral;
- Funções de posto e rondas;
- Cenários mistos.

## Tipos de pergunta mais inteligentes

1. **Cenário de decisão**: apresenta contexto e pergunta a primeira ação adequada.
2. **Sequência de passos**: ordenar 3–5 ações.
3. **Melhor mensagem de rádio**: escolher a comunicação mais clara e curta.
4. **Detetar erro**: identificar o comportamento incorreto.
5. **Localização aplicada**: “Está no piso X junto à referência Y; como orienta alguém?”
6. **Múltiplas respostas válidas** quando o procedimento exige várias ações.
7. **Verdadeiro/falso justificado**, sem perguntas óbvias.
8. **Caso com informação insuficiente**: reconhecer quando é necessário confirmar com a Central/Chefe.

## Estrutura de dados

Cada questão deve ter, no mínimo:
```json
{
  "id": "manual-radio-001",
  "category": "radio",
  "difficulty": "scenario",
  "visibility": "operational-private",
  "question": "...",
  "answers": ["..."],
  "correct": [1],
  "explanation": "...",
  "source": {
    "document": "Manual de Operações",
    "image": "262867.jpg",
    "section": "3. Comunicações",
    "sourceDate": "2013-02",
    "requiresCurrentValidation": true
  }
}
```

## Regras de qualidade

- não inventar procedimentos;
- não usar uma loja com várias localizações numa pergunta de resposta única;
- explicação sempre contextualizada;
- mostrar a fonte no modo privado;
- marcar conteúdo do manual antigo como “validar com chefia”;
- manter perguntas públicas separadas das perguntas operacionais internas;
- usar banco determinístico em JSON, não gerar tudo aleatoriamente em runtime.

Um conjunto de exemplos está em `EXEMPLOS/banco-perguntas-exemplo.json`.
