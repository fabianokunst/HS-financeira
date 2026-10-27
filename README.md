# HS Financeira — site institucional

Site estático da página de crédito, cartão e investimentos da HS Financeira.
HTML, CSS e JavaScript puros: **sem build, sem framework, sem dependências**.
Abra o `index.html` no navegador e está rodando; suba a pasta em qualquer
hospedagem estática e está no ar.

O site tem **as mesmas páginas, nos mesmos endereços, do site atual em
WordPress** (`/credito-pessoal/`, `/governanca/`, `/aviso/`…): cada endereço é
uma pasta com um `index.html`. É isso que preserva o SEO já conquistado — não
renomeie, não mova e não apague essas pastas. Veja
[Páginas internas e endereços](#páginas-internas-e-endereços).

Junto dele, um único arquivo HTML autocontido em
[`compartilhar/proposta-hs-financeira.html`](compartilhar/proposta-hs-financeira.html)
— com CSS, JS e imagens embutidos — para mandar por e-mail, WhatsApp ou Teams
e o time abrir com dois cliques, offline.

---

## Como trabalhar

**Para editar e ver o resultado:** abra `index.html` no navegador, edite os
arquivos em `css/`, `js/` ou o próprio `index.html`, e recarregue a página.
Nada para instalar, nada para compilar.

Aberto direto do disco (`file://`), o navegador não abre o `index.html` de uma
pasta: um link como `credito-pessoal/` mostraria a lista de arquivos. O
`js/links-locais.js` cuida disso — só em `file://`, ele completa os links
internos com `index.html`; no ar não faz nada. Para ver o site exatamente como
no servidor (redirecionamentos, 404), sirva por HTTP:

```bash
python -m http.server 8080     # ou: npm run serve
# → http://localhost:8080
```

**Para publicar:** copie a pasta (menos `tools/`, `reference/`, `docs/` e os
arquivos de configuração) para o servidor, **incluindo o `.htaccess` e o
`404.html`**, ou aponte Netlify/Vercel/S3/nginx para a raiz do repositório e
reproduza nele as regras do `.htaccess`. Não há etapa de build. Atenção: as
páginas linkam documentos em `https://hsfinanceira.com.br/wp-content/uploads/…`
(contratos, políticas, relatórios, demonstrações financeiras), que hoje moram
no WordPress — a pasta `wp-content/uploads/` precisa continuar no servidor
depois da troca, ou esses links e os PDFs indexados no Google viram 404.

**Para atualizar o arquivo único** depois de mexer no site:

```bash
node tools/bundle.mjs          # ou: npm run bundle
```

Requer Node 18+, e só para isso — o site nunca depende dele.

---

## Estrutura

```
HS-Financeira/
├── index.html                 # página inicial: <head>, 16 seções, dados estruturados
├── credito-pessoal/index.html # páginas internas: uma pasta por endereço do site atual
├── aviso/index.html           #   (avisos de segurança, destino do "Saiba Mais"),
├── governanca/index.html      #   governança, LGPD, parceiros, posts do blog…
├── …                          #   lista completa em "Páginas internas e endereços"
├── category/categoria/        # lista do blog (endereço herdado do WordPress)
├── 404.html                   # página de endereço inexistente (caminhos absolutos)
├── .htaccess                  # https sem www, 301 dos endereços só do WordPress, 404
├── css/
│   ├── base/
│   │   ├── tokens.css          # cores, fontes, espaçamento, tema claro/escuro
│   │   └── reset.css           # elementos base e utilitários (.wrap, .lede, .eyebrow)
│   ├── layout/
│   │   └── section.css         # casca de seção (.sec, .sec__head, .sec__h2)
│   ├── components/             # reutilizáveis: buttons, tag, field, chips, chat, cookies
│   └── sections/               # um arquivo por seção, mesmo nome da seção
│       ├── aviso.css  rail.css  header.css  hero.css  facts.css  produtos.css
│       ├── simulador.css  split.css  empresas.css  parceiros.css  investimentos.css
│       ├── governanca.css  novidades.css  ajuda.css  cta-final.css  footer.css
│       ├── pagina.css          # blocos das páginas internas (abertura, texto, etapas, arquivos…)
│       └── aviso-pagina.css    # só da aviso/
├── js/
│   ├── config.js               # taxa do simulador, ID do Analytics e parâmetros de negócio
│   ├── utils/format.js         # formatação de números em pt-BR
│   ├── cookies.js              # banner de consentimento (LGPD) e Google Analytics 4
│   ├── aviso.js                # cartão de aviso contra golpes, uma vez por dia
│   ├── nav.js                  # menu mobile
│   ├── accordion.js            # FAQ
│   ├── simulador.js            # cálculo da parcela
│   └── chat.js                 # inicia o chat de atendimento (Ubots)
├── assets/
│   ├── img/                    # as 5 fotos da página
│   ├── favicon/                # favicons oficiais do site atual (.ico, 32, 192 e 180px)
│   ├── og/                     # imagem de compartilhamento (WhatsApp, redes), 1200×630
│   └── marca/                  # logo oficial (branco, vermelho e símbolo) — não alterar
├── robots.txt  sitemap.xml  llms.txt  favicon.ico   # rastreamento, SEO e IA (ver docs/SEO.md)
├── docs/SEO.md                 # diagnóstico de SEO, o que foi feito e próximos passos
├── tools/bundle.mjs            # gera o arquivo único (opcional)
├── tools/paginas.mjs           # copia cabeçalho, rodapé e <head> comum para as páginas internas (npm run paginas)
├── tools/seo-check.mjs         # confere SEO e sincroniza o JSON-LD do FAQ (npm run seo)
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
troque o nome também no `index.html` e no `sitemap.xml`). Vale recomprimir antes:
as imagens são ~70% do peso do arquivo único. Foto de banco de imagens: anote a
origem aqui. `empresas-executivos.jpg` (faixa Para empresas) é do Unsplash, de
Rodrigo Rodrigues | WOLF ΛRT — https://unsplash.com/photos/dGrDvseyRhs — sob a
Licença Unsplash (uso comercial livre, crédito não obrigatório).

**Mudar o aviso contra golpes** — o texto aparece em dois lugares: no cartão
de aviso do `index.html` (seção `AVISO`) e no comunicado da `aviso/index.html`.
Mantenha os dois iguais. O cartão fica no canto inferior esquerdo — o direito é
do botão do chat — (no celular, encostado na base da tela) e aparece **uma vez por dia**:
na primeira página aberta no dia. A data fica no `localStorage`
(`hs-aviso-dia`); para ver o cartão de novo no mesmo dia, apague essa chave no
DevTools. Na primeira visita o cartão espera a escolha de cookies, cuja barra
ocupa a base da tela.

**Analytics e banner de cookies** — o Google Analytics 4 é a mesma propriedade
do site atual (`analyticsId` em [`js/config.js`](js/config.js)) e só é
carregado **depois do "Aceitar"** no banner (seção `COOKIES`, copiada para todas
as páginas pelo `npm run paginas`). O banner é réplica do site atual (plugin
CookieYes): barra na base da tela com os mesmos textos, "Recusar", "Aceitar" e
o X, que vale como "Recusar". Antes da escolha, e com "Recusar", nada vai
para o Google; ao recusar, os cookies `_ga` são apagados e, se o Analytics já
estava rodando na página (quem aceitou e mudou de ideia pelo rodapé), ele para
de enviar na hora, sem esperar recarregar. A escolha fica no
`localStorage` (`hs-cookies`) por `cookiesValidadeDias` e pode ser mudada em
"Preferências de cookies", no rodapé. Em homologação, no `localhost`, aberto
direto do disco e no arquivo único de `compartilhar/` o banner funciona, mas o
Analytics só carrega nos domínios de `analyticsDominios`. Para ver o banner de
novo depois de escolher, apague a chave `hs-cookies` no DevTools ou use
"Preferências de cookies". Diferença em
relação ao site atual: lá o banner não bloqueia nada e o Analytics mede todo
mundo, então os números vão cair depois da troca — passam a contar só quem
aceita.

**Logo e favicon — não alterar** — são os arquivos oficiais do site atual
(hsfinanceira.com.br), copiados sem nenhuma edição. Não redesenhe, recolora,
recorte nem vetorize: se precisar de outro tamanho ou versão, peça o arquivo
original ao marketing.

- `assets/marca/hs-financeira-logo.png` (194×48) — versão vermelha (desenho
  preenchido, "HS" em branco), usada no cabeçalho branco. É a mesma que o site
  oficial usa e não existe em tamanho maior: fica no tamanho natural (144px no
  celular) para não borrar. Se o marketing mandar o vetor (SVG/AI), troque aqui.
- `assets/marca/hs-financeira-logo-branco.png` (500×244) — logo branco com
  "Uma empresa do Grupo Herval", usado no rodapé vermelho. É uma versão vazada
  (só contorno), diferente da vermelha: não pinte este arquivo de vermelho para
  usar em fundo claro.
- Os dois PNGs têm margem transparente; o CSS (`.mark__logo`, `.ft__logo`)
  compensa com margens negativas, sem tocar no arquivo.
- `assets/marca/hs-financeira-simbolo.png` (400×400) — só o símbolo "HS"; é o
  logo dos dados estruturados.
- `assets/favicon/` — `favicon-32.png`, `favicon-192.png` e
  `apple-touch-icon.png` (180px) são os favicons oficiais; o `favicon.ico` (e a
  cópia na raiz) só embrulha o PNG de 32px num `.ico`, sem mudar um pixel.

**Adicionar uma pergunta no FAQ** — copie um bloco `.acc__it` na seção `FAQ`. O
primeiro item tem `is-open` e `aria-expanded="true"`; os demais, não. A pergunta
fica dentro de `<h3 class="acc__h">`. Depois rode `npm run seo -- --corrigir-faq`:
o JSON-LD do `<head>` repete o FAQ para o Google e as IAs, e precisa ficar igual
ao texto visível. Um `id` no `.acc__it` (como `#renegociacao`) permite linkar a
pergunta, que já abre respondida.

**Antes de publicar** — `npm run seo`. Confere canonical, imagem de
compartilhamento, títulos, imagens, arquivos referenciados, robots/sitemap e se o
FAQ do JSON-LD bate com a página. Detalhes e pendências em
[`docs/SEO.md`](docs/SEO.md).

**Criar uma seção** — adicione o markup no `index.html` entre os comentários de
seção, crie `css/sections/nova.css` e registre o `<link>` no `<head>`.

**Mudar cabeçalho, rodapé, faixa de aviso, logo, fontes ou favicon** — edite só
o `index.html` (e o CSS) e rode `npm run paginas`: o
[`tools/paginas.mjs`](tools/paginas.mjs) copia essas partes para todas as
páginas internas, ajustando os caminhos. `npm run paginas -- --verificar` só
confere, sem gravar nada.

**Mudar o texto de uma página interna** — direto no `index.html` da pasta
(`governanca/index.html`…), dentro do `<main>`. Não mexa no endereço, no
`canonical` nem no `og:url`.

**Criar uma página interna** — copie uma pasta parecida (por exemplo
`credito-pessoal/`) com o nome do endereço novo, troque `<title>`, description,
`canonical`, `og:` e JSON-LD, escreva o `<main>` com os blocos de
[`css/sections/pagina.css`](css/sections/pagina.css) e rode `npm run paginas`.
Inclua a URL no `sitemap.xml` e linke a página de algum lugar do site.

**Cores e tipografia** — tudo em [`css/base/tokens.css`](css/base/tokens.css),
seguindo a identidade do site atual: vermelho `#D9222E` nas faixas (rodapé,
`--brand-band`), `#D3363B` em botões e destaques (`--brand`), títulos
em preto, texto em `#5F5C6B`, grafite `#33303E` e fonte Manrope (800 nos
títulos). Todas as combinações de texto passam no contraste WCAG AA nos dois
temas — ao criar uma cor nova, confira (texto normal ≥ 4,5:1). O vermelho
`--brand` sobre o rosado `--brand-wash` não passa em texto pequeno; ali use
`--brand-deep`. O tema escuro é o mesmo conjunto de tokens redefinido em dois
blocos (`prefers-color-scheme` e `[data-theme="dark"]`); mexer só no primeiro
deixa o tema inconsistente. O cabeçalho é branco (`--paper`, escurece no tema
escuro) e o rodapé fica vermelho nos dois temas.

---

## Páginas internas e endereços

O site atual (WordPress) tem 23 páginas, 3 posts de blog e 1 categoria
indexados — a lista vem do sitemap dele (`/wp-sitemap.xml`). Todos continuam
existindo aqui, no mesmo endereço, com o mesmo assunto e o conteúdo
equivalente, agora no visual novo:

| Endereço | Página |
|---|---|
| `/` | Início (`index.html`) |
| `/credito-pessoal/` | Crédito Pessoal |
| `/emprestimo-com-a-menor-taxa-do-mercado/` | Consignado INSS |
| `/um-cartao-cheio-de-vantagens-para-quem-vive-o-hoje/` | Cartão Hoje |
| `/portabilidade-de-credito/` | Portabilidade de crédito |
| `/cdc-credito-direto-ao-consumidor/` | CDC — Crédito Direto ao Consumidor |
| `/investimentos/` | Investimentos (LC e CDB) |
| `/solicitar-credito-pessoal/` | Solicitar Crédito Pessoal (canais de contratação; o formulário de emprestaqi.com.br saiu porque o domínio não existe mais) |
| `/solicitacao_credito_pessoal/` | Duplicata antiga da anterior: mesmo conteúdo, `canonical` para ela |
| `/linhas-de-credito-para-acelerar-as-conquistas-da-sua-empresa/` | CDC PJ |
| `/linha-pj-completa-sem-burocracia-com-as-melhores-taxas/` | Antecipação de recebíveis |
| `/nossos-parceiros-lojas-taqi/` | Parceiro: lojas taQi |
| `/nossos-parceiros-iplace/` | Parceiro: iPlace |
| `/nossos-parceiros-hs-corretora-de-seguros/` | Parceiro: HS Corretora de Seguros |
| `/nossa-historia/` | Nossa história |
| `/governanca/` | Governança (políticas, contratos, tarifas, relatórios) |
| `/divulgacao-de-resultados/` | Demonstrações financeiras por ano |
| `/canal-de-etica-e-denuncia/` | Canal de Ética e Denúncia |
| `/lgpd/` | LGPD |
| `/politicas-de-privacidade-e-transparencia/` | Privacidade e transparência |
| `/cadastro-positivo-2/` | Cadastro Positivo (o "-2" é do endereço original) |
| `/envie-nos-uma-mensagem/` | Atendimento e contato |
| `/aviso/` | Avisos de segurança |
| `/como-escolher-a-contratacao-de-um-servico-financeiro/` | Post do blog |
| `/qual-a-importancia-de-ter-uma-reserva-de-emergencia/` | Post do blog |
| `/especialista-da-5-dicas-para-lidar-melhor-com-seu-dinheiro/` | Post do blog |
| `/category/categoria/` | Lista do blog |

Regras que mantêm o SEO:

- **O endereço é a pasta.** `/governanca/` é `governanca/index.html`. Mudar o
  nome da pasta muda a URL e joga fora o histórico dela no Google; se um dia for
  inevitável, crie um 301 do endereço antigo para o novo no `.htaccess`.
- Cada página tem `canonical` e `og:url` com o próprio endereço absoluto (com a
  barra final), `<title>`, description, um único `<h1>` e JSON-LD (`WebPage` +
  `BreadcrumbList`; posts com `BlogPosting`). `npm run paginas -- --verificar`
  confere tudo isso e se a página está no `sitemap.xml`.
- Links entre páginas são relativos (`../governanca/`), para o site navegar
  também em homologação; o `paginas.mjs` converte os absolutos
  (`https://hsfinanceira.com.br/credito-pessoal/`) que aparecerem no `<body>`
  do `index.html`. JSON-LD, `canonical`, `og:` e `sitemap.xml` ficam absolutos.
  No arquivo único de `compartilhar/`, que abre offline, o `bundle.mjs` aponta
  esses links para o site publicado.
- O [`.htaccess`](.htaccess) (o servidor atual é LiteSpeed, compatível com
  Apache) força `https://hsfinanceira.com.br` sem `www`, tira o `index.html` dos
  endereços e redireciona com 301 o que só existia no WordPress: sitemaps
  (`/wp-sitemap.xml`), feeds, arquivos por data e autor, busca (`?s=`) e os links
  curtos `?p=ID`. Endereços inexistentes caem na `404.html` (`noindex`).
- **Pendente — formulários:** "Fale conosco" (`/envie-nos-uma-mensagem/`),
  denúncia identificada e anônima (`/canal-de-etica-e-denuncia/`) e as três
  solicitações da LGPD (`/lgpd/`) eram formulários do WordPress. O site estático
  ainda não tem para onde enviá-los: as páginas mostram os canais oficiais e um
  comentário `PENDENTE` no HTML lista os campos de cada formulário.
- **Pendente — documentos:** os PDFs e imagens linkados continuam em
  `/wp-content/uploads/…` (ver "Para publicar").
- **Conferir com a HS:** o telefone da Cobrança na página do CDC (o site antigo
  dizia 3564-7374; o resto do site diz (51) 3564-8374, que foi o usado); o
  WhatsApp de investimentos sem o 55 (`phone=5140426468`), como no site antigo;
  e os comentários `Conferir` em `governanca/` e `divulgacao-de-resultados/`,
  onde o site antigo ligava dois períodos diferentes ao mesmo PDF.

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
- **Fonte** (Manrope, a mesma do site atual) vem do Google Fonts por CDN,
  inclusive no arquivo único — sem internet, o navegador cai no fallback
  sans-serif. A Manrope não tem itálico: o `<i>` dos títulos vira só cor.
- **Simulador**: Tabela Price (`pmt = pv · i / (1 − (1 + i)⁻ⁿ)`), cálculo 100%
  local, sem envio de dados e sem consulta a CPF, como diz o texto da seção.
- **Dados estruturados** (schema.org) inline no `<head>`: um `@graph` com a
  empresa (`FinancialService`, canais de atendimento e catálogo de produtos),
  `WebSite`, `WebPage` e `FAQPage`. URLs dele, do canonical, do `og:` e do
  `llms.txt` são absolutas de propósito — não converta para relativas.
- **SEO sem efeito visual**: títulos de produtos e cards são `h3` com
  `font:inherit` (o reset daria a eles a fonte dos títulos); `.sr-only` em
  `reset.css` esconde rótulos que só leitores de tela e robôs precisam.
- **Chat de atendimento** é o mesmo widget da Ubots do site oficial, com a
  mesma configuração do Grupo Herval (as conversas caem na mesma fila). São três
  peças: `ubots.min.css` no `<head>` e `ubots.min.js` no fim do `<body>`, ambos
  do CDN da Ubots, e [`js/chat.js`](js/chat.js), que chama `UbotsWC.init` com a
  URL da configuração. Título, formulário e horário de atendimento vêm dessa
  configuração, mantida pela Ubots, não daqui. As cores da marca e as camadas
  (botão abaixo do cabeçalho, janela acima) ficam em
  [`css/components/chat.css`](css/components/chat.css). O CSS da Ubots tem um
  `*{margin:0;padding:0}` global, por isso margens que antes vinham do padrão
  do navegador (a `<dl>` do simulador, o slider) agora estão explícitas.
  Sem internet o widget não carrega e o resto da página segue normal.

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
- Entre 961 e 1080px o cabeçalho quebrava em duas linhas (menu e botão
  "Contratar agora"). Nessa faixa o atalho "Simular crédito" agora some, como
  já acontecia no mobile, e os espaçamentos encolhem.
- O chip de prazo aceso ao abrir a página vinha fixo do HTML (18x); agora sai
  de `HS.config.prazoPadrao`, como o cálculo.
