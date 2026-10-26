# HS Financeira — site institucional

Site estático da página de crédito, cartão e investimentos da HS Financeira.
HTML, CSS e JavaScript puros: **sem build, sem framework, sem dependências**.
Abra o `index.html` no navegador e está rodando; suba a pasta em qualquer
hospedagem estática e está no ar.

Junto dele, um único arquivo HTML autocontido em
[`compartilhar/proposta-hs-financeira.html`](compartilhar/proposta-hs-financeira.html)
— com CSS, JS e imagens embutidos — para mandar por e-mail, WhatsApp ou Teams
e o time abrir com dois cliques, offline.

---

## Como trabalhar

**Para editar e ver o resultado:** abra `index.html` no navegador, edite os
arquivos em `css/`, `js/` ou o próprio `index.html`, e recarregue a página.
Nada para instalar, nada para compilar.

Se preferir servir por HTTP (URLs absolutas, DevTools mais completo):

```bash
python -m http.server 8080     # ou: npm run serve
# → http://localhost:8080
```

**Para publicar:** copie a pasta (menos `tools/`, `reference/` e os arquivos de
configuração) para o servidor, ou aponte Netlify/Vercel/S3/nginx para a raiz do
repositório. Não há etapa de build.

**Para atualizar o arquivo único** depois de mexer no site:

```bash
node tools/bundle.mjs          # ou: npm run bundle
```

Requer Node 18+, e só para isso — o site nunca depende dele.

---

## Estrutura

```
HS-Financeira/
├── index.html                 # a página inteira: <head>, 14 seções, dados estruturados
├── css/
│   ├── base/
│   │   ├── tokens.css          # cores, fontes, espaçamento, tema claro/escuro
│   │   └── reset.css           # elementos base e utilitários (.wrap, .lede, .eyebrow)
│   ├── layout/
│   │   └── section.css         # casca de seção (.sec, .sec__head, .sec__h2)
│   ├── components/             # reutilizáveis: buttons, tag, field, chips
│   └── sections/               # um arquivo por seção, mesmo nome da seção
│       ├── rail.css  header.css  hero.css  facts.css  produtos.css
│       ├── simulador.css  split.css  empresas.css  parceiros.css
│       └── investimentos.css  governanca.css  ajuda.css  cta-final.css  footer.css
├── js/
│   ├── config.js               # taxa do simulador e parâmetros de negócio
│   ├── utils/format.js         # formatação de números em pt-BR
│   ├── nav.js                  # menu mobile
│   ├── accordion.js            # FAQ
│   └── simulador.js            # cálculo da parcela
├── assets/img/                 # as 5 fotos da página
├── tools/bundle.mjs            # gera o arquivo único (opcional)
├── compartilhar/
│   └── proposta-hs-financeira.html   # o arquivo para enviar ao time (751 KB)
└── reference/                  # versão original, antes da organização
```

A ordem de carregamento mora no `index.html`: os `<link>` do `<head>` definem a
cascata do CSS (fundação → componentes → seções) e os `<script>` no fim do
`<body>` definem a ordem do JS. Ao criar um arquivo novo em `css/` ou `js/`,
registre-o ali — é o único lugar.

As seções do `index.html` são separadas por comentários (`<!-- ═══ HERO ═══ -->`)
e o nome bate com o CSS e com a âncora: `HERO` ↔ `css/sections/hero.css` ↔
`#para-voce` e afins.

---

## Tarefas do dia a dia

**Trocar a taxa do simulador** — [`js/config.js`](js/config.js), campo
`taxaMensal` (`0.0399` = 3,99% a.m.). O texto "3,99% a.m." na tela sai desse
valor. Atualize também os números iniciais no `index.html` (`id="pmt"` e
`id="rTot"`), que aparecem antes do JS rodar.

**Mudar texto** — direto no `index.html`, na seção correspondente. Nenhum texto
da página está em JS.

**Trocar uma foto** — substitua o JPEG em `assets/img/` mantendo o nome (ou
troque o nome também no `index.html`). Vale recomprimir antes: as imagens são
~70% do peso do arquivo único.

**Adicionar uma pergunta no FAQ** — copie um bloco `.acc__it` na seção `FAQ`. O
primeiro item tem `is-open` e `aria-expanded="true"`; os demais, não.

**Criar uma seção** — adicione o markup no `index.html` entre os comentários de
seção, crie `css/sections/nova.css` e registre o `<link>` no `<head>`.

**Cores e tipografia** — tudo em [`css/base/tokens.css`](css/base/tokens.css). O
tema escuro é o mesmo conjunto de tokens redefinido em três blocos
(`prefers-color-scheme`, `[data-theme="dark"]` e `[data-theme="light"]`); mexer
só no primeiro deixa o tema inconsistente.

---

## Notas técnicas

- **Tema claro/escuro** acompanha o sistema e pode ser forçado com
  `data-theme="light"` ou `data-theme="dark"` na tag `<html>`.
- **Acessibilidade**: menu navegável por teclado (Esc fecha), `aria-expanded` no
  FAQ e no hambúrguer, `aria-pressed` nos chips, `prefers-reduced-motion`
  respeitado nas transições e na rolagem suave.
- **JS**: cada arquivo é um IIFE que sai silenciosamente se a seção não existir
  na página, e compartilha estado só pelo namespace `HS` (`HS.config`,
  `HS.format`). Nada de módulos ES, para o site funcionar também em `file://`.
- **Fontes** (Newsreader e Archivo) vêm do Google Fonts por CDN, inclusive no
  arquivo único — sem internet, o navegador cai no fallback serif/sans-serif.
- **Simulador**: Tabela Price (`pmt = pv · i / (1 − (1 + i)⁻ⁿ)`), cálculo 100%
  local, sem envio de dados e sem consulta a CPF, como diz o texto da seção.
- **Dados estruturados** (schema.org `FinancialService`) inline no `<head>`.

### Como o gerador do arquivo único funciona

[`tools/bundle.mjs`](tools/bundle.mjs) (~120 linhas, sem dependências) lê o
`index.html` como fonte da verdade e faz três trocas: junta os `<link>` locais
em um `<style>`, junta os `<script>` locais em um `<script>` inline (ambos na
ordem em que aparecem, preservando a cascata) e converte cada `assets/…` em
`data:` URI. Nada de minificação — o HTML gerado continua legível. Links de CDN
seguem como link. Caminho errado quebra o gerador com o nome do arquivo
faltando, em vez de gerar uma página torta.

## O que mudou em relação ao arquivo original

O original está em `reference/proposta-hs-financeira.v1.html` (pode apagar
depois de conferir). Verifiquei que o markup do `index.html` e o do arquivo
único são idênticos ao dele, as regras de CSS são as mesmas e as 5 imagens têm
o mesmo conteúdo, byte a byte. Fora isso:

- O documento ganhou `<!doctype>`, `<html lang="pt-BR">` e `<head>` completo
  (`charset`, `viewport`, `description`, `theme-color`, Open Graph) — o arquivo
  original começava direto no `<title>`.
- `scroll-behavior: smooth`, aplicado por JS, virou CSS com exceção para
  `prefers-reduced-motion`.
- No `render()` do simulador havia uma linha morta (a taxa era formatada e logo
  sobrescrita por um texto fixo); agora sai de `HS.config.taxaMensal`.
- Os valores iniciais do simulador no HTML estavam defasados em relação ao que o
  JS calcula (R$ 231,44 contra R$ 236,79) e apareciam por um instante ao abrir a
  página. Foram sincronizados.
- Botões, tags, chips e campos estavam declarados no meio do CSS das seções e
  foram isolados em `css/components/`.
