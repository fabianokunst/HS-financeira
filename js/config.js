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
  breakpointMenu: 960,

  /* Google Analytics 4: a mesma propriedade do site atual. Só é carregado
     depois do "Aceitar" no banner de cookies (js/cookies.js) e só nestes
     domínios — em homologação e no localhost o banner funciona, mas nada vai
     para o Google, para não misturar testes com os dados reais. */
  analyticsId: "G-K19JZS99WR",
  analyticsDominios: ["hsfinanceira.com.br", "www.hsfinanceira.com.br"],

  /* Depois de quantos dias a escolha de cookies é perguntada de novo. */
  cookiesValidadeDias: 365
};
