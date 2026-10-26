/* Simulador de crédito pessoal (seção #simulador).
   Cálculo local, sem envio de dados: parcela pela Tabela Price
   pmt = pv * i / (1 - (1 + i)^-n). */
(function () {
  "use strict";

  var fmt = HS.format;
  var TAXA = HS.config.taxaMensal;

  var valor    = document.getElementById("sv");
  var valorOut = document.getElementById("svOut");
  var prazoOut = document.getElementById("snOut");
  var parcela  = document.getElementById("pmt");
  var linhas   = {
    valor: document.getElementById("rPv"),
    prazo: document.getElementById("rN"),
    taxa:  document.getElementById("rI"),
    total: document.getElementById("rTot")
  };

  if (!valor || !parcela) return;   /* seção ausente nesta página */

  var prazo = HS.config.prazoPadrao;

  function parcelaPrice(pv, i, n) {
    return pv * i / (1 - Math.pow(1 + i, -n));
  }

  function render() {
    var pv  = Number(valor.value);
    var pmt = parcelaPrice(pv, TAXA, prazo);
    var p   = fmt.partes(pmt);

    valorOut.textContent = fmt.moedaCurta(pv);
    prazoOut.textContent = prazo + "x";
    parcela.innerHTML    = "R$ " + p.inteiro + "<span>," + p.centavos + "</span>";

    linhas.valor.textContent = fmt.moeda(pv);
    linhas.prazo.textContent = prazo + " meses";
    linhas.taxa.textContent  = fmt.percentual(TAXA) + " a.m.";
    linhas.total.textContent = fmt.moeda(pmt * prazo);
  }

  /* Grupo de chips com comportamento de rádio via aria-pressed. */
  function grupoChips(seletor, aoEscolher) {
    var chips = document.querySelectorAll(seletor);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (outro) { outro.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        if (aoEscolher) aoEscolher(chip);
      });
    });
  }

  valor.addEventListener("input", render);

  grupoChips(".chip[data-n]", function (chip) {
    prazo = Number(chip.dataset.n);
    render();
  });

  /* Forma de recebimento: só destaca a escolha, não entra no cálculo. */
  grupoChips(".chip[data-w]");

  /* O chip aceso ao abrir a página sai do config, não do HTML. */
  document.querySelectorAll(".chip[data-n]").forEach(function (chip) {
    chip.setAttribute("aria-pressed", Number(chip.dataset.n) === prazo ? "true" : "false");
  });

  render();
})();
