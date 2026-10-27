/* Faixa de aviso contra golpes: o "x" fecha a faixa só na página aberta.
   Nada é guardado no navegador, então ela volta sempre que o site é aberto. */
(function () {
  "use strict";

  var aviso = document.getElementById("aviso");
  if (!aviso) return;

  var fechar = aviso.querySelector(".aviso__x");

  fechar.addEventListener("click", function () {
    aviso.hidden = true;
    /* O botão sumiu junto com a faixa: o foco vai para a marca no cabeçalho. */
    var marca = document.querySelector(".mark");
    if (marca) marca.focus();
  });
})();
