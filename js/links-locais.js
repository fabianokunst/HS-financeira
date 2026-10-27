/* Site aberto direto do disco (file://, duplo clique no index.html).
   Fora de um servidor, o navegador não abre o index.html de uma pasta: um link
   como "credito-pessoal/" mostra a lista de arquivos em vez da página. Só
   nesse caso, os links internos que terminam em "/" ganham o "index.html".
   No ar (http/https) o script não faz nada e os endereços continuam os mesmos
   do WordPress. */
(function () {
  "use strict";

  if (location.protocol !== "file:") return;

  document.querySelectorAll("a[href]").forEach(function (link) {
    var href = link.getAttribute("href");
    /* Âncoras, outros sites, tel:, mailto: e caminhos a partir da raiz
       (só a 404.html usa, e ela só existe no servidor) ficam como estão. */
    if (/^(?:#|\/|[a-z][a-z0-9+.-]*:)/i.test(href)) return;

    var url = new URL(href, location.href);
    if (url.pathname.slice(-1) !== "/") return;

    url.pathname += "index.html";
    link.href = url.href;
  });
})();
