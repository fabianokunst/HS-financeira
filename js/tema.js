/* Modo claro/escuro. O site abre sempre no claro; o seletor discreto da faixa
   de telefones (no celular e no tablet, a chave "Modo escuro" do menu) liga o
   escuro com data-theme="dark" na tag <html>. A escolha fica no localStorage
   ("hs-tema") e vale para todas as páginas; o script inline do <head> a aplica
   antes da primeira pintura. Voltar ao claro apaga a chave. */
(function () {
  "use strict";

  var CHAVE  = "hs-tema";
  var raiz   = document.documentElement;
  var botoes = document.querySelectorAll("[data-tema]");
  if (!botoes.length) return;

  function estaEscuro() {
    return raiz.getAttribute("data-theme") === "dark";
  }

  function aplicar(escuro) {
    if (escuro) raiz.setAttribute("data-theme", "dark");
    else raiz.removeAttribute("data-theme");
    botoes.forEach(function (botao) {
      botao.setAttribute("aria-pressed", escuro ? "true" : "false");
      /* Só o botão da faixa, que é só ícone, tem dica ao passar o mouse. */
      if (botao.hasAttribute("title")) botao.title = escuro ? "Voltar ao modo claro" : "Ativar modo escuro";
    });
  }

  function guardar(escuro) {
    try {
      if (escuro) localStorage.setItem(CHAVE, "escuro");
      else localStorage.removeItem(CHAVE);
    } catch (e) { /* segue sem lembrar: vale só para esta página */ }
  }

  botoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      var escuro = !estaEscuro();
      aplicar(escuro);
      guardar(escuro);
    });
  });

  /* Outra aba do site trocou o tema: acompanha. */
  window.addEventListener("storage", function (e) {
    if (e.key === CHAVE) aplicar(e.newValue === "escuro");
  });

  aplicar(estaEscuro());
})();
