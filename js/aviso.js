/* Aviso contra golpes: cartão no canto inferior esquerdo que aparece uma vez
   por dia — na primeira página aberta no dia; nas seguintes, não.
   A data em que apareceu fica no localStorage. Se ele estiver bloqueado (aba
   anônima, alguns navegadores em file://), o aviso aparece em toda página:
   para um alerta de segurança, sobrar é melhor que faltar. */
(function () {
  "use strict";

  var aviso = document.getElementById("aviso");
  if (!aviso) return;

  var fechar = aviso.querySelector(".aviso__x");
  var CHAVE  = "hs-aviso-dia";
  /* Espera a página assentar antes de deslizar o cartão. */
  var ATRASO = 800;

  function hoje() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function jaApareceuHoje() {
    try { return localStorage.getItem(CHAVE) === hoje(); } catch (e) { return false; }
  }

  function marcarHoje() {
    try { localStorage.setItem(CHAVE, hoje()); } catch (e) { /* segue sem lembrar */ }
  }

  function fecharAviso() {
    var focoDentro = aviso.contains(document.activeElement);
    aviso.classList.remove("is-open");
    /* Quem fechou pelo teclado não fica com o foco perdido no cartão sumido. */
    if (focoDentro) {
      var marca = document.querySelector(".mark");
      if (marca) marca.focus();
    }
  }

  fechar.addEventListener("click", fecharAviso);

  aviso.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharAviso();
  });

  if (jaApareceuHoje()) return;

  setTimeout(function () {
    marcarHoje();
    aviso.classList.add("is-open");
  }, ATRASO);
})();
