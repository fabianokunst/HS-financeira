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

  perguntas.forEach(function (pergunta) {
    pergunta.addEventListener("click", function () {
      var estavaAberto = pergunta.getAttribute("aria-expanded") === "true";
      fecharTodos();
      if (!estavaAberto) {
        pergunta.closest(".acc__it").classList.add("is-open");
        pergunta.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
