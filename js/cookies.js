/* Consentimento de cookies (LGPD) e Google Analytics 4.
   O Analytics só é carregado depois do "Aceitar": antes da escolha, e se a
   pessoa recusar, nenhuma requisição vai para o Google. A escolha fica no
   localStorage ("hs-cookies") por HS.config.cookiesValidadeDias e pode ser
   mudada a qualquer momento em "Preferências de cookies", no rodapé.
   Ao recusar, os cookies do Analytics (_ga, _ga_…) são apagados — inclusive
   os que o site antigo gravava sem pedir.
   Fora dos domínios de HS.config.analyticsDominios — localhost, homologação,
   o site aberto direto do disco (file://) e o arquivo de compartilhar/ — o
   banner funciona igual, mas o Analytics não é carregado.
   Enquanto o banner está aberto, HS.cookies.pendente é true; ao escolher,
   dispara o evento "hs:cookies" no document (o aviso contra golpes espera
   por ele para não ficar por baixo da barra). */
(function () {
  "use strict";

  var banner = document.getElementById("cookies");
  if (!banner) return;

  var cfg = (window.HS && HS.config) || {};
  var CHAVE = "hs-cookies";
  var DIA = 864e5;
  var carregado = false;
  var origemDoFoco = null;

  window.HS = window.HS || {};
  HS.cookies = { pendente: false, abrir: abrir };

  function lerEscolha() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      var validade = (cfg.cookiesValidadeDias || 365) * DIA;
      if (salvo && /^(aceito|recusado)$/.test(salvo.escolha) && Date.now() - salvo.em < validade) return salvo.escolha;
    } catch (e) { /* sem localStorage: pergunta de novo a cada página */ }
    return null;
  }

  function salvarEscolha(escolha) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ escolha: escolha, em: Date.now() })); } catch (e) { /* vale só para esta página */ }
  }

  function carregarAnalytics() {
    if (!cfg.analyticsId) return;
    if ((cfg.analyticsDominios || []).indexOf(location.hostname) === -1) return;
    /* Quem recusou e aceitou de novo nesta mesma página volta a ser medido. */
    window["ga-disable-" + cfg.analyticsId] = false;
    if (carregado) {
      gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    /* Consentimento só para análise: nada de anúncios nem personalização. */
    gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    gtag("js", new Date());
    gtag("config", cfg.analyticsId);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.analyticsId);
    document.head.appendChild(s);
  }

  function apagarCookiesAnalytics() {
    var dominio = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (par) {
      var nome = par.split("=")[0].trim();
      if (!/^_ga(_|$)/.test(nome)) return;
      ["", "; domain=" + dominio, "; domain=." + dominio].forEach(function (d) {
        document.cookie = nome + "=; Max-Age=0; path=/" + d;
      });
    });
  }

  function abrir() {
    HS.cookies.pendente = true;
    banner.hidden = false;
  }

  function escolher(escolha) {
    salvarEscolha(escolha);
    banner.hidden = true;
    var eraPendente = HS.cookies.pendente;
    HS.cookies.pendente = false;
    if (escolha === "aceito") {
      carregarAnalytics();
    } else {
      /* Quem aceitou e mudou de ideia nesta mesma página para de ser medido
         já. Só o "denied" não basta: o Analytics continuaria mandando pings
         sem cookie; a trava ga-disable- corta qualquer envio. */
      if (carregado) {
        gtag("consent", "update", { analytics_storage: "denied" });
        window["ga-disable-" + cfg.analyticsId] = true;
      }
      apagarCookiesAnalytics();
    }
    if (origemDoFoco) { origemDoFoco.focus(); origemDoFoco = null; }
    if (eraPendente) document.dispatchEvent(new CustomEvent("hs:cookies", { detail: { escolha: escolha } }));
  }

  document.addEventListener("click", function (e) {
    var alvo = e.target.closest("[data-cookies]");
    if (!alvo) return;
    var acao = alvo.getAttribute("data-cookies");
    if (acao === "abrir") {
      origemDoFoco = alvo;
      abrir();
      banner.querySelector("[data-cookies]").focus();
    } else if (acao === "aceitar") {
      escolher("aceito");
    } else if (acao === "recusar" || acao === "fechar") {
      /* O X vale como "Recusar", como no CookieYes do site oficial. */
      escolher("recusado");
    }
  });

  var escolha = lerEscolha();
  if (escolha === "aceito") carregarAnalytics();
  else if (escolha === "recusado") apagarCookiesAnalytics();
  else abrir();
})();
