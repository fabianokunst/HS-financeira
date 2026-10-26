/* Formatação de números no padrão pt-BR. */
window.HS = window.HS || {};

HS.format = (function () {
  "use strict";

  var brl  = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var brl0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

  return {
    /* 3000 -> "3.000,00" */
    valor: function (n) { return brl.format(n); },

    /* 3000 -> "3.000" */
    inteiro: function (n) { return brl0.format(n); },

    /* 3000 -> "R$ 3.000,00" */
    moeda: function (n) { return "R$ " + brl.format(n); },

    /* 3000 -> "R$ 3.000" */
    moedaCurta: function (n) { return "R$ " + brl0.format(n); },

    /* 0.0399 -> "3,99%" */
    percentual: function (taxa) { return brl.format(taxa * 100) + "%"; },

    /* 231.4405 -> { inteiro: "231", centavos: "44" } */
    partes: function (n) {
      var p = brl.format(n).split(",");
      return { inteiro: p[0], centavos: p[1] };
    }
  };
})();
