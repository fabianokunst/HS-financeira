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
arquivos de configuração) para o servidor, **incluindo o `.htaccess`, o
`404.html` e a pasta `api/`** (o registro dos consentimentos de cookies e os
formulários, que precisam de PHP — ver "Registro dos consentimentos" e
"Formulários"), ou aponte Netlify/Vercel/S3/nginx para a raiz do repositório e
reproduza nele as regras do `.htaccess`. Não há etapa de build. Publique
também a pasta `wp-content/uploads/`: é a cópia de todos os arquivos que o
WordPress servia (contratos, políticas, relatórios, demonstrações financeiras,
imagens), nos mesmos endereços, para os links das páginas e os PDFs indexados
no Google continuarem funcionando depois que o WordPress for apagado.

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
├── api/consentimento.php      # registro dos consentimentos de cookies (PHP)
├── api/formulario.php         # Fale Conosco e pedidos da LGPD → Emarsys e e-mail (PHP)
├── css/
│   ├── base/
│   │   ├── tokens.css          # cores, fontes, espaçamento, tema claro/escuro
│   │   └── reset.css           # elementos base e utilitários (.wrap, .lede, .eyebrow)
│   ├── layout/
│   │   └── section.css         # casca de seção (.sec, .sec__head, .sec__h2)
│   ├── components/             # reutilizáveis: buttons, tag, field, chips, chat, cookies,
│   │                           #   formulario (só envie-nos-uma-mensagem/ e lgpd/)
│   └── sections/               # um arquivo por seção, mesmo nome da seção
│       ├── aviso.css  rail.css  header.css  hero.css  facts.css  produtos.css
│       ├── simulador.css  split.css  empresas.css  parceiros.css  investimentos.css
│       ├── governanca.css  novidades.css  ajuda.css  cta-final.css  footer.css
│       ├── pagina.css          # blocos das páginas internas (abertura, texto, etapas, arquivos…)
│       └── aviso-pagina.css    # só da aviso/
├── js/
│   ├── config.js               # taxa do simulador, contas do GA e do Emarsys, parâmetros
│   ├── utils/format.js         # formatação de números em pt-BR
│   ├── cookies.js              # banner de consentimento por categoria (LGPD) e Google Analytics 4
│   ├── emarsys.js              # Emarsys (categoria "Publicidade") e os eventos de clique
│   ├── aviso.js                # cartão de aviso contra golpes, uma vez por dia
│   ├── nav.js                  # menu mobile
│   ├── tema.js                 # seletor de modo escuro (o site abre sempre claro)
│   ├── accordion.js            # FAQ
│   ├── simulador.js            # cálculo da parcela
│   ├── formulario.js           # Fale Conosco e pedidos da LGPD: confere, envia e confirma
│   └── chat.js                 # inicia o chat de atendimento (Ubots)
├── assets/
│   ├── img/                    # as 5 fotos da página inicial
│   │   └── paginas/            # foto de pessoa das páginas internas (a mesma do site atual)
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
├── wp-content/uploads/         # todos os arquivos do WordPress, nos mesmos endereços (ver "Cópia do WordPress")
└── reference/                  # não publicado: cópia das páginas e do conteúdo do WordPress, versão original
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

**Trocar o WhatsApp da simulação** — [`js/config.js`](js/config.js), campo
`whatsappSimulacao` (DDI + DDD + número, só dígitos). No `index.html`, troque
também o `href` de `id="simCta"` e o número escrito logo abaixo (`.sim__fine`).

**Mudar texto** — direto no `index.html`, na seção correspondente. Nenhum texto
da página está em JS.

**Trocar uma foto** — substitua o JPEG em `assets/img/` mantendo o nome (ou
troque o nome também no `index.html` e no `sitemap.xml`). Vale recomprimir antes:
as imagens são ~70% do peso do arquivo único. Foto de banco de imagens: anote a
origem aqui. `empresas-executivos.jpg` (faixa Para empresas) é do Unsplash, de
Rodrigo Rodrigues | WOLF ΛRT — https://unsplash.com/photos/dGrDvseyRhs — sob a
Licença Unsplash (uso comercial livre, crédito não obrigatório).
`cartao-hoje.jpg` (seção Cartão Hoje) é a foto do site atual — a mulher com o
cartão Hoje e o app aberto (`/wp-content/uploads/2022/10/c4f95e0b-…png`) —,
recomposta em 5:4 com o fundo rosado à esquerda; a anterior, de banco de
imagens, mostrava um cartão de outro banco.

**Fotos das páginas internas** — as páginas que no site atual têm foto de
pessoa usam a mesma foto aqui, discreta, no topo do quadro-resumo da abertura
(`.resumo__foto` em [`css/sections/pagina.css`](css/sections/pagina.css)):
Crédito Pessoal, Consignado INSS, Cartão Hoje, CDC, Investimentos, Antecipação
de recebíveis, CDC PJ e Nossa história. Os arquivos em `assets/img/paginas/`
saem dos PNGs recortados do WordPress (`/wp-content/uploads/2022/…`, mesma
pessoa, sem retoque): recortados na altura do peito numa tela transparente de
768×320, em WebP (11–22 KB cada; o original do Cartão Hoje tem 23 MB). O fundo
rosado vem do CSS (`--brand-wash`), por isso acompanha o tema escuro. Para
trocar, gere um WebP no mesmo formato, com a pessoa encostada na base, e mude
também o `sitemap.xml`. Páginas sem foto de pessoa no site atual (políticas,
governança, contato…) ficam sem foto.

**Mudar o aviso contra golpes** — o texto aparece em dois lugares: no cartão
de aviso do `index.html` (seção `AVISO`) e no comunicado da `aviso/index.html`.
Mantenha os dois iguais. O cartão fica no canto inferior esquerdo — o direito é
do botão do chat — (no celular, encostado na base da tela) e aparece **uma vez por dia**:
na primeira página aberta no dia. A data fica no `localStorage`
(`hs-aviso-dia`); para ver o cartão de novo no mesmo dia, apague essa chave no
DevTools. Na primeira visita o cartão espera a escolha de cookies, cuja barra
ocupa a base da tela.

**Cookies e ferramentas de terceiros** — o site usa as mesmas ferramentas do
site atual, com as mesmas contas (em [`js/config.js`](js/config.js)), e cada
uma só carrega com a sua categoria aceita no banner (seção `COOKIES`, copiada
para todas as páginas pelo `npm run paginas`):

| Categoria | Ferramenta | O que faz |
|---|---|---|
| Necessários (sempre) | escolha de cookies, aviso de golpes, chat da Ubots | só `localStorage`/`sessionStorage` do próprio site e do chat |
| Analíticos | Google Analytics 4 (`analyticsId`) | visitas e páginas vistas; sinais de anúncio do Google sempre negados |
| Publicidade | Emarsys/SAP (`emarsysId`, [`js/emarsys.js`](js/emarsys.js)) | rastreamento e campanhas no site; os mesmos eventos do site atual: `menu_click`, `menu_links`, `social_click` e `ubots_form` (nome e e-mail do chat) |

O banner segue o formato do CookieYes do site atual: barra na base da tela com
os mesmos textos, "Aceitar" (liga tudo), "Recusar" e o X (só os necessários) e
"Personalizar", que abre o painel com a relação acima e uma chave por
categoria — o mesmo painel abre em "Preferências de cookies", no rodapé.
Antes da escolha nada de terceiros carrega, e os cookies que o site antigo
gravava sem pedir (`_ga`, `scarab.*`) são apagados. Ao desligar uma categoria,
os cookies dela somem e o que já rodava na página para de enviar na hora.

A escolha fica no `localStorage` (`hs-cookies`) por `cookiesValidadeDias`.
**Ao incluir ou tirar uma ferramenta**, atualize a relação no painel (bloco
`COOKIES` do `index.html`, depois `npm run paginas`) e a data de
`cookiesVersao`: todo mundo é perguntado de novo. Em homologação, no
`localhost`, aberto do disco e no arquivo único o banner funciona, mas nenhuma
ferramenta carrega fora de `dominiosOficiais`. Para ver o banner de novo,
apague a chave `hs-cookies` no DevTools ou use "Preferências de cookies".
Diferença em relação ao site atual: lá o banner não bloqueia nada e tudo mede
todo mundo, então os números do GA e do Emarsys vão cair depois da troca —
passam a contar só quem aceita.

**Registro dos consentimentos** — a LGPD pede que quem coleta consiga provar o
consentimento (art. 8º, § 2º). A cada escolha, o `js/cookies.js` manda para
[`api/consentimento.php`](api/consentimento.php) o identificador aleatório do
navegador, a versão do banner, a ação e cada categoria; o PHP grava uma linha
por escolha, com data, página, IP sem o último bloco e navegador, em
`consentimentos-AAAA-MM.jsonl`, numa pasta **fora** da área pública:
`consentimentos-cookies/`, ao lado da pasta do site (ou onde a variável de
ambiente `HS_CONSENTIMENTOS_DIR` indicar). Precisa de PHP 8, que a hospedagem
atual já tem (LiteSpeed, PHP 8.5). Para consultar um caso, procure o
identificador (fica no `hs-cookies` do navegador da pessoa) nesses arquivos.
O site atual não guarda registro nenhum: o CookieYes de lá é a versão gratuita,
que só guarda a escolha no navegador. Para testar localmente:
`php -S 127.0.0.1:8099 -t .` (o `python -m http.server` não roda PHP).

**Formulários** — o Fale Conosco (`envie-nos-uma-mensagem/`) e os três pedidos
da LGPD (`lgpd/`: excluir dados, opor-se ao tratamento, denunciar tratamento
irregular) são os mesmos do site atual, com os mesmos campos. No WordPress
eram formulários do Elementor (os da LGPD em popups) e um script mandava cada
envio ao Emarsys por um iframe oculto, com nome, CPF, e-mail e telefone na URL.
Aqui o [`js/formulario.js`](js/formulario.js) confere os campos (CPF pelos
dígitos verificadores, telefone com DDD) e manda por POST para
[`api/formulario.php`](api/formulario.php), que confere de novo e repassa:

- ao **Emarsys**, de servidor para servidor, com a mesma chamada de hoje
  (`link.cartaohoje.com.br/u/register.php`, CID 1093070733, um formulário por
  tipo: Fale Conosco f=1413, exclusão 1414, oposição 1415, denúncia 1416). O
  CPF vai só com os dígitos; o telefone, com 55 na frente; a pergunta do nome
  social (exclusão e oposição) vai como S/N em `inp_17061`. Duas correções em
  relação ao script atual: ele não mandava o nome social na oposição, que o
  formulário 1415 do Emarsys exige, e não punha o 55 em telefones do DDD 55;
- por **e-mail**, para `contato@` (Fale Conosco) ou `lgpd@` (LGPD), com
  "Responder" indo para a pessoa e um número de protocolo, que ela também vê
  na tela.

Basta um dos dois dar certo; se os dois falham, a pessoa é avisada para usar o
e-mail ou o telefone. Nada do envio fica gravado no servidor. Contra robôs, em
vez do reCAPTCHA do site atual: um campo invisível que só robô preenche, um
tempo mínimo de preenchimento e no máximo 5 envios por IP em 15 minutos (20
por dia), contados num arquivo por IP embaralhado em `formularios-site/`, ao
lado da pasta do site (ou em `HS_FORMULARIOS_DIR`). São um serviço que a pessoa
pediu: não dependem do banner de cookies. Sem JavaScript, o formulário vai
direto para o PHP, que responde com uma página simples.

Fora de `hsfinanceira.com.br` (homologação, localhost) nada sai: o envio é
conferido e respondido, mas sem Emarsys nem e-mail. Para testar o repasse,
aponte `HS_FORMULARIOS_EMARSYS_URL` para um servidor de teste e
`HS_FORMULARIOS_EMAIL_PARA` para uma caixa de teste (valem também no ar).
O e-mail sai pela função `mail()` do PHP, de `nao-responda@hsfinanceira.com.br`
(ou `HS_FORMULARIOS_REMETENTE`): **depois de publicar, mande um envio de teste
de cada página e confira que chegou a `contato@` e a `lgpd@` e ao Emarsys** —
se a hospedagem não entregar e-mail pelo `mail()`, o endereço remetente
precisa estar autorizado no SPF do domínio ou é preciso usar SMTP.

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
`--brand-deep`. O tema escuro é o mesmo conjunto de tokens redefinido no bloco
`[data-theme="dark"]`; ali `--brand` clareia (é cor de texto), e por isso os
fundos cheios — botões, chips, "Aceitar" dos cookies, chat — usam
`--brand-fill`, que continua o vermelho `#D3363B` com texto branco nos dois
temas. O cabeçalho é branco (`--paper`, escurece no tema escuro) e o rodapé
fica vermelho nos dois temas.

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
- **Conferir com a HS:** o telefone da Cobrança na página do CDC (o site antigo
  dizia 3564-7374; o resto do site diz (51) 3564-8374, que foi o usado); o
  WhatsApp de investimentos sem o 55 (`phone=5140426468`), como no site antigo;
  e os comentários `Conferir` em `governanca/` e `divulgacao-de-resultados/`,
  onde o site antigo ligava dois períodos diferentes ao mesmo PDF.

### Cópia do WordPress

O WordPress (hospedado na Hostinger) vai ser apagado, e só o que está neste
projeto fica. Em 27/10/2026 foi copiado, pelo próprio site, tudo o que ele
publica:

- **`wp-content/uploads/`** — 1.120 arquivos, 377 MB: os 279 itens da
  biblioteca de mídia com todos os tamanhos gerados pelo WordPress (116 PDFs,
  imagens, SVGs, um ZIP), as imagens dos modelos do Elementor e o CSS e as
  fontes que ele gerava. Mesmos caminhos do servidor, byte a byte (ver
  `.gitattributes`). Os 47 links do site novo para essa pasta têm o arquivo.
- **`reference/wordpress/`** — o HTML dos 27 endereços, o conteúdo da API REST
  (páginas, posts, mídia) e os sitemaps antigos. Detalhes no
  [`LEIA-ME`](reference/LEIA-ME.md).

O que não sai pelo site e só existe no painel da hospedagem: o **banco de
dados** (com as mensagens recebidas pelos formulários de contato, LGPD e
denúncia), o tema, os plugins, as configurações e 10 itens da biblioteca que
pertencem a modelos não publicados do Elementor. Antes de apagar, baixe o
backup completo (arquivos e banco) no painel da Hostinger e guarde-o em
`backup-wordpress/`, na raiz: a pasta está no `.gitignore`, porque o banco tem
dados pessoais e as senhas do `wp-config.php`, que não devem ir para o GitHub.

---

## Notas técnicas

- **Tema claro/escuro**: o site abre sempre claro, mesmo com o sistema no
  escuro. O escuro é opcional, num seletor discreto — ícone de lua no fim da
  faixa de telefones no computador; no celular e no tablet, a chave "Modo
  escuro" no fim do menu. O [`js/tema.js`](js/tema.js) põe
  `data-theme="dark"` na tag `<html>` e guarda a escolha no localStorage
  (`hs-tema`, listado nos cookies necessários); uma linha de script no `<head>`
  aplica o escuro antes da primeira pintura, para não piscar o claro.
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
  "Continuar com esta simulação" abre o WhatsApp do SAC (`whatsappSimulacao` no
  `js/config.js`) com valor, prazo, parcela e forma de recebimento já escritos;
  a pessoa confere e envia. Sem JS, o botão abre o mesmo WhatsApp sem o texto.
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
