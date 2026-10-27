/* Menus do cabeçalho: os suspensos do computador (.nav) e o menu mobile
   do botão hambúrguer (.mnav), com os mesmos grupos em sanfona. */
(function () {
  "use strict";

  /* ── Menus suspensos (computador) ── */

  var nav = document.querySelector(".nav");
  var botoes = nav ? [].slice.call(nav.querySelectorAll(".nav__btn")) : [];
  /* Com mouse, abre ao passar por cima; no toque e no teclado, no clique. */
  var comMouse = window.matchMedia("(hover: hover) and (pointer: fine)");
  var timer = null;

  function expandir(botao, aberto) {
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    if (!aberto) botao.removeAttribute("data-hover");
  }

  function fecharTodos(exceto) {
    botoes.forEach(function (b) { if (b !== exceto) expandir(b, false); });
  }

  function aberto(botao) {
    return botao.getAttribute("aria-expanded") === "true";
  }

  if (nav) {
    /* Daqui em diante quem abre os painéis é o script, não o :hover do CSS. */
    nav.classList.add("is-pronto");

    botoes.forEach(function (botao) {
      var item = botao.parentNode;

      botao.addEventListener("click", function () {
        /* Já aberto pelo mouse: o clique confirma, não fecha. */
        if (botao.hasAttribute("data-hover")) { botao.removeAttribute("data-hover"); return; }
        var abrir = !aberto(botao);
        fecharTodos(botao);
        expandir(botao, abrir);
      });

      item.addEventListener("pointerenter", function (e) {
        if (e.pointerType !== "mouse" || !comMouse.matches) return;
        clearTimeout(timer);
        if (aberto(botao)) return;
        fecharTodos(botao);
        expandir(botao, true);
        botao.setAttribute("data-hover", "");
      });

      item.addEventListener("pointerleave", function (e) {
        if (e.pointerType !== "mouse" || !comMouse.matches) return;
        clearTimeout(timer);
        timer = setTimeout(function () { expandir(botao, false); }, 180);
      });

      /* Tab para fora do item fecha o painel. */
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) expandir(botao, false);
      });
    });

    /* Clique fora fecha; clique num link também (os de âncora, como
       "Perguntas frequentes", não trocam de página). */
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) || e.target.closest(".nav__links a")) fecharTodos();
    });
  }

  /* ── Menu mobile ── */

  var burger = document.getElementById("burger");
  var menu   = document.getElementById("mnav");

  function abrir(aberto) {
    burger.setAttribute("aria-expanded", aberto ? "true" : "false");
    burger.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
    menu.hidden = !aberto;
  }

  function estaAberto() {
    return burger && burger.getAttribute("aria-expanded") === "true";
  }

  if (burger && menu) {
    burger.addEventListener("click", function () { abrir(!estaAberto()); });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { abrir(false); });
    });

    menu.querySelectorAll(".mnav__btn").forEach(function (botao) {
      var sub = document.getElementById(botao.getAttribute("aria-controls"));
      if (!sub) return;
      function mostrar(aberto) {
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
        sub.hidden = !aberto;
      }
      botao.addEventListener("click", function () { mostrar(sub.hidden); });
      /* Nas páginas internas, o grupo da página aberta já vem aberto. */
      if (sub.querySelector('[aria-current="page"]')) mostrar(true);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > HS.config.breakpointMenu) abrir(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var botao = botoes.filter(aberto)[0];
    if (botao) {
      expandir(botao, false);
      botao.focus();
    } else if (estaAberto()) {
      abrir(false);
      burger.focus();
    }
  });
})();
