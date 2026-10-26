/* FAQ em acordeão (seção #ajuda). Abre um item por vez. */
(function () {
  "use strict";

  var perguntas = document.querySelectorAll(".acc__q");
  if (!perguntas.length) return;

  function fecharTodos() {
    document.querySelectorAll(".acc__it").forEach(function (item) {
      item.classList.remove("is-open");
      item.querySelector(".acc__q").setAttribute("aria-expanded", "false");
    });
  }

  function abrir(item) {
    fecharTodos();
    item.classList.add("is-open");
    item.querySelector(".acc__q").setAttribute("aria-expanded", "true");
  }

  perguntas.forEach(function (pergunta) {
    pergunta.addEventListener("click", function () {
      var estavaAberto = pergunta.getAttribute("aria-expanded") === "true";
      if (estavaAberto) fecharTodos();
      else abrir(pergunta.closest(".acc__it"));
    });
  });

  /* Link direto para uma pergunta (#renegociacao, #consignado, #telefones)
     já chega com a resposta aberta — vale para o menu e para quem vem de busca. */
  function abrirPeloEndereco() {
    var alvo = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    var item = alvo && alvo.closest(".acc__it");
    if (item) abrir(item);
  }

  window.addEventListener("hashchange", abrirPeloEndereco);
  abrirPeloEndereco();
})();
