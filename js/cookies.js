/* Consentimento de cookies (LGPD), por categoria, como o CookieYes do site
   oficial: "Necessários" (sempre ativos), "Analíticos" (Google Analytics 4)
   e "Publicidade" (Emarsys). "Aceitar" liga tudo; "Recusar" e o X deixam só
   os necessários; "Personalizar" (e "Preferências de cookies", no rodapé)
   abre o painel com a relação das ferramentas e uma chave por categoria.
   Nada de terceiros carrega antes da escolha. Ao desligar uma categoria, os
   cookies dela são apagados — inclusive os que o site antigo gravava sem
   pedir — e o que já rodava na página para de enviar na hora.
   A escolha fica no localStorage ("hs-cookies") por cookiesValidadeDias e é
   perguntada de novo quando cookiesVersao muda. Cada escolha também vai para
   o servidor (consentimentoUrl), que guarda o registro como prova.
   Fora de HS.config.dominiosOficiais (localhost, homologação, file://, o
   arquivo de compartilhar/) o banner funciona, mas nenhuma ferramenta carrega.
   Para os outros scripts: HS.cookies.permitido("publicidade") e o evento
   "hs:cookies" no document a cada escolha (detail.categorias). O aviso contra
   golpes espera por ele para não ficar por baixo da barra; o js/emarsys.js
   liga e desliga o Emarsys com ele. */
(function () {
  "use strict";

  var banner = document.getElementById("cookies");
  var painel = document.getElementById("cookies-pref");
  if (!banner || !painel) return;

  var cfg = (window.HS && HS.config) || {};
  var CHAVE = "hs-cookies";
  var CATEGORIAS = ["analiticos", "publicidade"];
  var DIA = 864e5;
  var oficial = (cfg.dominiosOficiais || []).indexOf(location.hostname) !== -1;
  var categorias = null;
  var gaCarregado = false;
  var origemDoFoco = null;

  window.HS = window.HS || {};
  HS.cookies = {
    pendente: false,
    oficial: oficial,
    permitido: function (categoria) { return !!(categorias && categorias[categoria]); },
    abrir: abrirPainel
  };

  /* ── Escolha guardada ── */

  function lerGuardado() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || null; } catch (e) { return null; }
  }

  function escolhaValida(salvo) {
    var validade = (cfg.cookiesValidadeDias || 365) * DIA;
    return salvo && salvo.categorias && salvo.versao === cfg.cookiesVersao && Date.now() - salvo.em < validade;
  }

  /* Identificador aleatório deste navegador: liga a escolha guardada aqui ao
     registro no servidor, sem dado pessoal nenhum. */
  function idDoNavegador() {
    var salvo = lerGuardado();
    if (salvo && /^[0-9a-f]{32}$/.test(salvo.id)) return salvo.id;
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return (b + 256).toString(16).slice(1); }).join("");
  }

  function guardar(id) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ id: id, versao: cfg.cookiesVersao, em: Date.now(), categorias: categorias }));
    } catch (e) { /* vale só para esta página */ }
  }

  function registrar(id, acao) {
    if (!cfg.consentimentoUrl || !/^https?:$/.test(location.protocol) || !navigator.sendBeacon) return;
    var dados = { id: id, versao: cfg.cookiesVersao, acao: acao, categorias: categorias, pagina: location.pathname };
    try {
      navigator.sendBeacon(cfg.consentimentoUrl, new Blob([JSON.stringify(dados)], { type: "text/plain" }));
    } catch (e) { /* o registro falhou, mas a escolha vale do mesmo jeito */ }
  }

  /* ── Ferramentas ── */

  function apagarCookies(padrao) {
    var dominio = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (par) {
      var nome = par.split("=")[0].trim();
      if (!padrao.test(nome)) return;
      ["", "; domain=" + dominio, "; domain=." + dominio].forEach(function (d) {
        document.cookie = nome + "=; Max-Age=0; path=/" + d;
      });
    });
  }
  HS.cookies.apagarCookies = apagarCookies;

  function ligarAnalytics() {
    if (!oficial || !cfg.analyticsId) return;
    /* Quem desligou e religou nesta mesma página volta a ser medido. */
    window["ga-disable-" + cfg.analyticsId] = false;
    if (gaCarregado) {
      gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    gaCarregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    /* O Analytics é só para análise: os sinais de anúncio do Google ficam
       sempre negados (a categoria "Publicidade" é a do Emarsys). */
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

  function desligarAnalytics() {
    /* Só o "denied" não basta: o Analytics continuaria mandando pings sem
       cookie; a trava ga-disable- corta qualquer envio. */
    if (gaCarregado) {
      gtag("consent", "update", { analytics_storage: "denied" });
      window["ga-disable-" + cfg.analyticsId] = true;
    }
    apagarCookies(/^_ga(_|$)/);
  }

  function aplicar() {
    if (categorias.analiticos) ligarAnalytics(); else desligarAnalytics();
  }

  /* ── Banner e painel ── */

  function abrirBanner() {
    HS.cookies.pendente = true;
    banner.hidden = false;
  }

  function abrirPainel(origem) {
    origemDoFoco = origem || document.activeElement;
    painel.querySelectorAll("[data-categoria]").forEach(function (chave) {
      chave.checked = HS.cookies.permitido(chave.getAttribute("data-categoria"));
    });
    if (painel.showModal) painel.showModal(); else painel.setAttribute("open", "");
  }

  function fecharPainel() {
    if (painel.open) {
      if (painel.close) painel.close(); else painel.removeAttribute("open");
    }
  }

  function escolher(acao) {
    var novas = {};
    CATEGORIAS.forEach(function (c) {
      if (acao === "aceitar") novas[c] = true;
      else if (acao === "salvar") novas[c] = !!painel.querySelector('[data-categoria="' + c + '"]:checked');
      else novas[c] = false;
    });
    categorias = novas;
    var id = idDoNavegador();
    guardar(id);
    registrar(id, acao);
    aplicar();

    banner.hidden = true;
    fecharPainel();
    var eraPendente = HS.cookies.pendente;
    HS.cookies.pendente = false;
    if (origemDoFoco && document.contains(origemDoFoco) && !banner.contains(origemDoFoco)) origemDoFoco.focus();
    origemDoFoco = null;
    document.dispatchEvent(new CustomEvent("hs:cookies", {
      detail: { categorias: categorias, acao: acao, eraPendente: eraPendente }
    }));
  }

  function alternarCategoria(botao) {
    var lista = document.getElementById(botao.getAttribute("aria-controls"));
    var abrir = botao.getAttribute("aria-expanded") !== "true";
    botao.setAttribute("aria-expanded", String(abrir));
    botao.closest(".ck-cat").classList.toggle("is-aberta", abrir);
    if (lista) lista.hidden = !abrir;
  }

  document.addEventListener("click", function (e) {
    var alvo = e.target.closest("[data-cookies]");
    if (!alvo) return;
    var acao = alvo.getAttribute("data-cookies");
    if (acao === "abrir" || acao === "personalizar") {
      abrirPainel(alvo);
    } else if (acao === "voltar") {
      fecharPainel();
    } else if (acao === "detalhes") {
      alternarCategoria(alvo);
    } else if (acao === "aceitar" || acao === "recusar" || acao === "salvar" || acao === "fechar") {
      /* O X da barra vale como "Recusar", como no CookieYes do site oficial. */
      escolher(acao);
    }
  });

  /* Fechar o painel sem escolher (X, Esc) devolve o foco a quem o abriu;
     se ainda não houve escolha, o banner continua lá. */
  painel.addEventListener("close", function () {
    if (origemDoFoco && document.contains(origemDoFoco)) origemDoFoco.focus();
    origemDoFoco = null;
  });

  var salvo = lerGuardado();
  if (escolhaValida(salvo)) {
    categorias = {};
    CATEGORIAS.forEach(function (c) { categorias[c] = !!salvo.categorias[c]; });
    aplicar();
  } else {
    /* Sem escolha (ou de uma versão anterior do banner): nada liga, e o que
       o site antigo gravou sem pedir é apagado. */
    categorias = { analiticos: false, publicidade: false };
    apagarCookies(/^_ga(_|$)/);
    abrirBanner();
  }
})();
