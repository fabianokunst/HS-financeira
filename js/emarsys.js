/* Emarsys (SAP), a mesma conta do site atual (HS.config.emarsysId):
   rastreamento de navegação e campanhas no próprio site (Web Channel).
   Só carrega com a categoria "Publicidade" aceita no banner de cookies, e só
   nos domínios oficiais (js/cookies.js). Manda os mesmos eventos que o site
   atual manda:
   - menu_click: links do menu principal (cabeçalho e menu do celular);
   - menu_links: links do rodapé;
   - social_click: redes sociais do rodapé;
   - ubots_form: nome e e-mail informados ao abrir o chat (com setEmail).
   Ao desligar a categoria, para de enviar na hora e apaga os cookies scarab.*
   e o que o Web Channel guardou no navegador (wps-*). */
(function () {
  "use strict";

  var cfg = (window.HS && HS.config) || {};
  if (!cfg.emarsysId || !window.HS || !HS.cookies) return;

  var carregado = false;
  window.ScarabQueue = window.ScarabQueue || [];

  function ativo() {
    return HS.cookies.oficial && HS.cookies.permitido("publicidade");
  }

  function ligar() {
    if (carregado || !ativo()) return;
    carregado = true;
    var s = document.createElement("script");
    s.id = "scarab-js-api";
    s.src = "https://cdn.scarabresearch.com/js/" + cfg.emarsysId + "/scarab-v2.js";
    document.head.appendChild(s);
    ScarabQueue.push(["go"]);
  }

  function desligar() {
    HS.cookies.apagarCookies(/^scarab\./);
    [localStorage, sessionStorage].forEach(function (area) {
      try {
        Object.keys(area).forEach(function (k) { if (/^wps/.test(k)) area.removeItem(k); });
      } catch (e) { /* armazenamento bloqueado: não há o que apagar */ }
    });
  }

  /* Cada evento depois do carregamento precisa de um "go" para ser enviado. */
  function enviar(comandos) {
    if (!ativo()) return;
    comandos.forEach(function (c) { ScarabQueue.push(c); });
    ScarabQueue.push(["go"]);
  }

  function texto(el) {
    return (el.getAttribute("aria-label") || el.textContent).replace(/\s+/g, " ").trim();
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link || !ativo()) return;
    if (link.closest(".nav, .mnav")) {
      enviar([["tag", "menu_click", { texto: texto(link), url: link.href }]]);
    } else if (link.closest(".ft__soc")) {
      enviar([["tag", "social_click", { redeSocial: texto(link), url: link.href }]]);
    } else if (link.closest(".ft")) {
      enviar([["tag", "menu_links", { texto: texto(link), url: link.href }]]);
    }
  });

  /* O formulário do chat é criado pelo widget da Ubots depois do carregamento:
     o envio é capturado no document. */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.matches || !form.matches("#ubots-form-div form.ubots-form") || !ativo()) return;
    var nome = form.querySelector("#ubots-name");
    var email = form.querySelector("#ubots-email");
    nome = nome ? nome.value.trim() : "";
    email = email ? email.value.trim() : "";
    if (!email) return;
    enviar([["setEmail", email], ["tag", "ubots_form", { nome: nome, email: email }]]);
  }, true);

  document.addEventListener("hs:cookies", function () {
    if (ativo()) ligar(); else desligar();
  });

  if (ativo()) ligar(); else desligar();
})();
