/* Menu de navegação mobile (botão hambúrguer do cabeçalho). */
(function () {
  "use strict";

  var burger = document.getElementById("burger");
  var menu   = document.getElementById("mnav");
  if (!burger || !menu) return;

  function abrir(aberto) {
    burger.setAttribute("aria-expanded", aberto ? "true" : "false");
    burger.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
    menu.hidden = !aberto;
  }

  function estaAberto() {
    return burger.getAttribute("aria-expanded") === "true";
  }

  burger.addEventListener("click", function () { abrir(!estaAberto()); });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { abrir(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && estaAberto()) {
      abrir(false);
      burger.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > HS.config.breakpointMenu) abrir(false);
  });
})();
