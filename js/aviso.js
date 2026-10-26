/* Faixa de aviso contra golpes: o "x" fecha a faixa até o fim da visita. */
(function () {
  "use strict";

  var aviso = document.getElementById("aviso");
  if (!aviso) return;

  var fechar = aviso.querySelector(".aviso__x");
  var CHAVE  = "hs-aviso-fechado";

  /* sessionStorage pode estar bloqueado (aba anônima, alguns navegadores em
     file://). Sem ele a faixa volta a cada página — o que é aceitável. */
  function fechadoNestaVisita() {
    try { return sessionStorage.getItem(CHAVE) === "1"; } catch (e) { return false; }
  }

  function lembrar() {
    try { sessionStorage.setItem(CHAVE, "1"); } catch (e) { /* segue sem lembrar */ }
  }

  if (fechadoNestaVisita()) aviso.hidden = true;

  fechar.addEventListener("click", function () {
    aviso.hidden = true;
    lembrar();
    /* O botão sumiu junto com a faixa: o foco vai para a marca no cabeçalho. */
    var marca = document.querySelector(".mark");
    if (marca) marca.focus();
  });
})();
