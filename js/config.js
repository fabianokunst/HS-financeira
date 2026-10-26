/* Parâmetros de negócio da página.
   É o único arquivo que a equipe precisa editar para ajustar a simulação. */
window.HS = window.HS || {};

HS.config = {
  /* Taxa de referência mensal usada no simulador (3,99% a.m.).
     Não é a taxa aprovada: essa depende da análise de crédito. */
  taxaMensal: 0.0399,

  /* Prazo pré-selecionado ao abrir a página (precisa existir como chip
     [data-n] na seção SIMULADOR do index.html). */
  prazoPadrao: 18,

  /* Largura, em px, a partir da qual o menu mobile é fechado. */
  breakpointMenu: 960
};
