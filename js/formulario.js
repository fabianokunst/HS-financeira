/* Formulários do site: Fale Conosco (envie-nos-uma-mensagem/) e os pedidos da
   LGPD (lgpd/). Confere os campos com as mesmas regras do api/formulario.php,
   envia por POST e mostra na própria página a confirmação, com o protocolo.
   Sem este script, o formulário vai direto para o PHP, que responde com uma
   página simples.
   É um serviço que a pessoa pediu: não depende do banner de cookies e não
   carrega nada de terceiros. */
(function () {
  "use strict";

  var formularios = document.querySelectorAll("form[data-formulario]");
  if (!formularios.length) return;

  var aberto = Date.now();

  function digitos(valor) { return valor.replace(/\D/g, ""); }

  function cpfValido(cpf) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
      if (Number(cpf[t]) !== (soma * 10) % 11 % 10) return false;
    }
    return true;
  }

  /* DDD + número, sem o 55 do país (que vem junto se a pessoa digitou +55). */
  function telefoneNacional(d) {
    return (d.length === 12 || d.length === 13) && d.slice(0, 2) === "55" ? d.slice(2) : d;
  }

  /* Cada regra devolve a mensagem de erro, ou "" se o valor está certo. */
  var regras = {
    nome: function (v) { return /\p{L}/u.test(v) && v.length <= 60 ? "" : "Informe o seu nome (até 60 letras)."; },
    sobrenome: function (v) { return /\p{L}/u.test(v) && v.length <= 60 ? "" : "Informe o seu sobrenome (até 60 letras)."; },
    cpf: function (v) {
      if (!v) return "Informe o seu CPF.";
      return cpfValido(digitos(v)) ? "" : "Confira o CPF: os números não formam um CPF válido.";
    },
    telefone: function (v) {
      return /^[1-9]{2}(?:[2-8]\d{7}|9\d{8})$/.test(telefoneNacional(digitos(v)))
        ? "" : "Informe o telefone com DDD, como (51) 99999-9999.";
    },
    email: function (v) {
      return v.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Confira o e-mail, como nome@exemplo.com.br.";
    },
    mensagem: function (v) {
      if (!v) return "Escreva a sua mensagem.";
      return v.length <= 1000 ? "" : "A mensagem passou de 1.000 caracteres.";
    }
  };

  /* Ao sair do campo, CPF e telefone ganham a pontuação: só para leitura, o PHP
     trabalha com os dígitos. */
  var formatos = {
    cpf: function (d) {
      return d.length === 11 ? d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") : null;
    },
    telefone: function (d) {
      d = telefoneNacional(d);
      return d.length === 10 || d.length === 11 ? "(" + d.slice(0, 2) + ") " + d.slice(2, -4) + "-" + d.slice(-4) : null;
    }
  };

  function iniciar(form) {
    var aviso = form.querySelector(".form__aviso");
    var botao = form.querySelector("button[type=submit]");
    var textoBotao = botao.textContent;
    var confirmacao = document.getElementById(form.getAttribute("data-ok"));
    var tentou = false;
    var enviando = false;

    form.noValidate = true;

    /* Lugar da mensagem de erro de cada campo (ou grupo de opções). */
    function caixaErro(alvo) {
      var id = (alvo.id || alvo.name) + "-erro";
      var caixa = document.getElementById(id);
      if (!caixa) {
        caixa = document.createElement("p");
        caixa.className = "form__erro";
        caixa.id = id;
        caixa.hidden = true;
        alvo.closest(".form__campo, .form__grupo, .opcoes").appendChild(caixa);
        var descrito = alvo.getAttribute("aria-describedby");
        alvo.setAttribute("aria-describedby", descrito ? descrito + " " + id : id);
      }
      return caixa;
    }

    function marcar(alvo, mensagem) {
      var caixa = caixaErro(alvo);
      caixa.textContent = mensagem;
      caixa.hidden = !mensagem;
      if (mensagem) alvo.setAttribute("aria-invalid", "true");
      else alvo.removeAttribute("aria-invalid");
    }

    /* Grupo de opções (tipo de pedido, nome social): o erro fica no fieldset. */
    function grupo(nome) {
      var opcao = form.querySelector("input[type=radio][name='" + nome + "']");
      var fieldset = opcao && opcao.closest("fieldset");
      return fieldset && !fieldset.disabled ? fieldset : null;
    }

    function conferir(campo) {
      var regra = regras[campo.name];
      if (!regra) return "";
      var mensagem = regra(campo.value.trim());
      marcar(campo, mensagem);
      return mensagem;
    }

    function conferirTudo() {
      var primeiro = null;
      Object.keys(regras).forEach(function (nome) {
        var campo = form.elements[nome];
        if (campo && conferir(campo) && !primeiro) primeiro = campo;
      });
      [["formulario", "Escolha o que deseja fazer."],
       ["nome_social", "Responda se conquistou o nome social ou mudou de sobrenome."]].forEach(function (par) {
        var fieldset = grupo(par[0]);
        if (!fieldset) return;
        var marcado = fieldset.querySelector("input:checked");
        marcar(fieldset, marcado ? "" : par[1]);
        if (!marcado && !primeiro) primeiro = fieldset.querySelector("input");
      });
      return primeiro;
    }

    form.addEventListener("focusout", function (e) {
      var campo = e.target;
      if (!regras[campo.name]) return;
      var formato = formatos[campo.name] && formatos[campo.name](digitos(campo.value));
      if (formato) campo.value = formato;
      if (tentou || campo.value.trim()) conferir(campo);
    });

    form.addEventListener("input", function (e) {
      var campo = e.target;
      if (campo.getAttribute("aria-invalid") === "true") conferir(campo);
      if (campo.name === "mensagem") contar(campo);
    });

    /* Contador da mensagem: o Emarsys guarda até 1.000 caracteres. */
    var conta = form.querySelector(".form__conta");
    function contar(campo) {
      if (conta) conta.textContent = campo.value.length + "/1000";
    }

    /* LGPD: a pergunta do nome social só existe nos pedidos de exclusão e de
       oposição, como no site atual. Fora deles o grupo fica escondido e
       desligado (não é conferido nem enviado). */
    var nomeSocial = form.querySelector("[data-so]");
    function ajustarNomeSocial() {
      if (!nomeSocial) return;
      var tipo = form.querySelector("input[name=formulario]:checked");
      var vale = !!tipo && nomeSocial.getAttribute("data-so").split(" ").indexOf(tipo.value) >= 0;
      nomeSocial.hidden = !vale;
      nomeSocial.disabled = !vale;
    }

    form.addEventListener("change", function (e) {
      var campo = e.target;
      if (campo.name === "formulario") ajustarNomeSocial();
      if (campo.type === "radio" && tentou) {
        var fieldset = grupo(campo.name);
        if (fieldset) marcar(fieldset, "");
      }
    });
    ajustarNomeSocial();

    function avisar(html) {
      aviso.innerHTML = html;
      aviso.hidden = !html;
    }

    function falhou(mensagem) {
      var email = form.getAttribute("data-email");
      avisar((mensagem ? escapar(mensagem) : "Não foi possível enviar agora. Verifique a sua conexão e tente de novo.")
        + " Se preferir, escreva para <a href=\"mailto:" + email + "\">" + email + "</a>.");
    }

    function escapar(texto) {
      return texto.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando) return;
      tentou = true;
      avisar("");

      var primeiro = conferirTudo();
      if (primeiro) {
        avisar("Confira os campos marcados.");
        primeiro.focus();
        return;
      }

      var dados = new URLSearchParams(new FormData(form));
      dados.set("tempo", String(Math.round((Date.now() - aberto) / 1000)));

      enviando = true;
      botao.disabled = true;
      botao.textContent = "Enviando…";

      fetch(form.action, {
        method: "POST",
        body: dados,
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      })
        .then(function (resposta) {
          return resposta.json().catch(function () { return {}; });
        })
        .then(function (r) {
          if (r.ok) {
            confirmacao.querySelector("[data-protocolo]").textContent = r.protocolo;
            form.hidden = true;
            confirmacao.hidden = false;
            confirmacao.focus();
            return;
          }
          if (r.erros) {
            var foco = null;
            Object.keys(r.erros).forEach(function (nome) {
              var alvo = form.elements[nome];
              if (!alvo) return;
              if (!alvo.tagName || alvo.type === "radio") alvo = grupo(nome);
              if (!alvo) return;
              marcar(alvo, r.erros[nome]);
              if (!foco) foco = alvo.tagName === "FIELDSET" ? alvo.querySelector("input") : alvo;
            });
            avisar("Confira os campos marcados.");
            if (foco) foco.focus();
            return;
          }
          falhou(r.mensagem);
        })
        .catch(function () { falhou(""); })
        .then(function () {
          enviando = false;
          botao.disabled = false;
          botao.textContent = textoBotao;
        });
    });
  }

  formularios.forEach(iniciar);
})();
