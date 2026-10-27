/* Entrada animada do topo da página — a parte que o CSS não faz sozinho
   (a cena inteira está em css/components/entrada.css):

   - quebra o <h1> em palavras (.palavra), que sobem uma a uma de trás de uma
     máscara; terminada a subida, o título volta a ser o texto do HTML;
   - conta de 0 até o número do selo da foto da inicial ("+20 anos") enquanto
     ele salta para o lugar.

   Com "reduzir movimento" ligado no sistema, não faz nada: o CSS também não
   anima, e a página aparece pronta. */
(function () {
  "use strict";

  if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var DURACAO_CONTAGEM = 1100;

  var titulo = document.querySelector(".hero__h1, .pg__h1");
  if (titulo && !jaComecou(titulo)) palavraAPalavra(titulo);

  var selo = document.querySelector(".hero__badge");
  if (selo) contarAoEntrar(selo);

  /* O título entra inteiro pelo CSS até o script quebrá-lo. Se o script chegou
     tarde e o título já começou a aparecer, deixa como está: quebrar agora
     faria o texto sumir e voltar. */
  function jaComecou(el) {
    if (!el.getAnimations) return false;
    return el.getAnimations().some(function (animacao) {
      var t = animacao.effect && animacao.effect.getComputedTiming();
      return t && t.localTime > t.delay;
    });
  }

  function palavraAPalavra(h1) {
    var original = Array.prototype.map.call(h1.childNodes, function (no) { return no.cloneNode(true); });
    var palavras = [];

    /* Desce pelos filhos (o <i> do destaque, por exemplo) e troca cada trecho
       de texto por palavras embrulhadas, mantendo os espaços como estavam. O
       espaço inseparável (&nbsp;) fica dentro da palavra: não vira quebra. */
    (function quebrar(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
        if (filho.nodeType === 1) return quebrar(filho);
        if (filho.nodeType !== 3) return;
        var trechos = filho.nodeValue.split(/([ \t\n\r\f]+)/);
        var pacote = document.createDocumentFragment();
        trechos.forEach(function (trecho, i) {
          if (!trecho) return;
          if (i % 2) { pacote.appendChild(document.createTextNode(trecho)); return; }
          var mascara = document.createElement("span");
          var palavra = document.createElement("span");
          mascara.className = "palavra";
          palavra.className = "palavra__in";
          palavra.style.setProperty("--n", palavras.length);
          palavra.textContent = trecho;
          mascara.appendChild(palavra);
          pacote.appendChild(mascara);
          palavras.push(palavra);
        });
        no.replaceChild(pacote, filho);
      });
    })(h1);

    if (!palavras.length) return;
    h1.classList.add("is-palavras");

    /* A última palavra assentou: devolve o texto original (seleção, leitores
       de tela e quebra de linha voltam ao normal). O .is-palavras fica, para o
       CSS não reiniciar a entrada do título inteiro. */
    palavras[palavras.length - 1].addEventListener("animationend", function () {
      while (h1.firstChild) h1.removeChild(h1.firstChild);
      original.forEach(function (no) { h1.appendChild(no); });
    });
  }

  /* Só começa quando o selo começa a aparecer: no celular ele fica escondido e
     o número nunca é tocado. */
  function contarAoEntrar(caixa) {
    var numero = caixa.querySelector(".num");
    var partes = numero && numero.textContent.match(/^(\D*)(\d+)([\s\S]*)$/);
    if (!partes) return;
    var alvo = Number(partes[2]);

    caixa.addEventListener("animationstart", function iniciar(e) {
      if (e.target !== caixa) return;
      caixa.removeEventListener("animationstart", iniciar);
      var inicio = null;
      numero.textContent = partes[1] + "0" + partes[3];
      window.requestAnimationFrame(function passo(agora) {
        if (inicio === null) inicio = agora;
        var t = Math.min((agora - inicio) / DURACAO_CONTAGEM, 1);
        numero.textContent = partes[1] + Math.round(alvo * (1 - Math.pow(1 - t, 3))) + partes[3];
        if (t < 1) window.requestAnimationFrame(passo);
      });
    });
  }
})();
