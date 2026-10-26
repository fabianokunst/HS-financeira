/* Chat de atendimento (Ubots), o mesmo do site oficial hsfinanceira.com.br.
   O widget (ubots.min.js) vem do CDN com defer, então só existe a partir do
   DOMContentLoaded. Sem internet ele não carrega e o chat simplesmente não
   aparece; o resto da página segue normal. */
(function () {
  "use strict";

  /* Configuração do Grupo Herval na Ubots (título, formulário de nome e
     e-mail, fila de atendimento). Fica no S3 da Ubots e é mantida lá. */
  var CONFIG = "https://ubots-webchat.s3.amazonaws.com/prod/config/GrupoHerval-00362852-cc3a-416a-b2c5-cf44c60217e2.json";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.UbotsWC) return;
    UbotsWC.init({ remoteConfiguration: CONFIG });
  });
})();
