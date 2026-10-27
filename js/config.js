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

  /* WhatsApp aberto por "Continuar com esta simulação", com valor, prazo e
     parcela já escritos na mensagem: DDI + DDD + número, só dígitos
     (hoje o WhatsApp do SAC, (51) 4042 1377). */
  whatsappSimulacao: "555140421377",

  /* Largura, em px, a partir da qual o menu mobile é fechado. */
  breakpointMenu: 960,

  /* Ferramentas de terceiros: as mesmas contas do site atual. Cada uma só é
     carregada com a sua categoria aceita no banner de cookies (js/cookies.js)
     e só nestes domínios — em homologação e no localhost o banner funciona,
     mas nada vai para o Google nem para o Emarsys, para não misturar testes
     com os dados reais. */
  dominiosOficiais: ["hsfinanceira.com.br", "www.hsfinanceira.com.br"],
  /* Google Analytics 4 — categoria "Analíticos". */
  analyticsId: "G-K19JZS99WR",
  /* Emarsys (SAP) — categoria "Publicidade" (js/emarsys.js). */
  emarsysId: "1F668F10C779FDAD",

  /* Depois de quantos dias a escolha de cookies é perguntada de novo. */
  cookiesValidadeDias: 365,
  /* Versão do banner: troque a data quando entrar ou sair uma ferramenta, ou
     mudar o texto, e todo mundo é perguntado de novo. Vai junto no registro. */
  cookiesVersao: "2026-10-27",
  /* Onde cada escolha é registrada, como prova do consentimento
     (api/consentimento.php). Deixe "" para não registrar. */
  consentimentoUrl: "/api/consentimento.php"
};
