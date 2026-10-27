/**
 * Mantém as páginas internas iguais ao index.html no que é comum a todas.
 *
 *   node tools/paginas.mjs              → atualiza as páginas
 *   node tools/paginas.mjs --verificar  → só confere (sai com erro se algo
 *                                         estiver desatualizado ou faltando)
 *
 * Cada endereço do site é uma pasta com um index.html (credito-pessoal/,
 * governanca/, category/categoria/…), exatamente como no site antigo em
 * WordPress — é isso que preserva o SEO já conquistado. Como não há build,
 * cabeçalho, rodapé e afins ficam repetidos em cada página. Este script copia
 * do index.html, que é a fonte da verdade:
 *
 *   - no <head>, entre <!-- comum:head --> e <!-- /comum:head -->:
 *     theme-color, o script que aplica o tema escuro, ícones, fontes e o CSS
 *     de fundação, componentes e blocos comuns (tudo menos o CSS das seções
 *     que só existem na página inicial);
 *   - no <body>, os blocos AVISO, TOP RAIL, HEADER e FOOTER — só os que a
 *     página tiver (a página do aviso, por exemplo, não repete a faixa AVISO) —
 *     e o banner COOKIES, que entra logo depois do rodapé se a página não o tiver;
 *   - antes de </body>, entre <!-- comum:scripts --> e <!-- /comum:scripts -->,
 *     os scripts comuns.
 *
 * Os caminhos são ajustados à profundidade de cada página ("#ajuda" vira
 * "../#ajuda", "assets/…" vira "../assets/…") e os links absolutos para
 * páginas que existem aqui (https://hsfinanceira.com.br/credito-pessoal/)
 * viram relativos, para o site navegar entre as próprias páginas também em
 * homologação. JSON-LD, canonical e og:url continuam absolutos. Em todas as
 * páginas, inclusive no <main>, os links para outros sites ganham
 * target="_blank" rel="noopener" e abrem em nova aba.
 *
 * O --verificar também confere o básico de SEO de cada página: canonical e
 * og:url iguais ao endereço da pasta, <title>, description, um único <h1> e a
 * presença no sitemap.xml.
 *
 * Sem dependências: só Node 18+.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = "https://hsfinanceira.com.br/";
const VERIFICAR = process.argv.includes("--verificar");

/* Pastas do projeto que não são páginas. */
const FORA = new Set(["assets", "css", "js", "docs", "tools", "compartilhar", "reference", "node_modules", "wp-content"]);

/* Blocos copiados do index.html, pelo nome do comentário de seção. */
const BLOCOS = ["AVISO", "TOP RAIL", "HEADER", "FOOTER", "COOKIES"];

/* Blocos que toda página com o bloco de referência recebe, logo depois dele,
   mesmo que ainda não os tenha. */
const INSERIR_DEPOIS = { COOKIES: "FOOTER" };

/* CSS e JS das seções que só existem na página inicial ficam de fora do comum. */
const SO_DA_HOME = /(?:css\/sections\/(?!(?:aviso|rail|header|cta-final|footer)\.css)[^"]+|js\/(?:simulador|accordion)\.js)"/;

/* 404.html é servida em qualquer endereço inexistente: precisa de caminhos
   absolutos a partir da raiz, e não relativos. */
const PAGINAS_NA_RAIZ = ["404.html"];

const ler = (rel) => readFile(join(RAIZ, rel), "utf8");

/* ── Descoberta ── */

async function listarPaginas(pasta = "") {
  const encontradas = [];
  for (const item of await readdir(join(RAIZ, pasta), { withFileTypes: true })) {
    if (!item.isDirectory() || item.name.startsWith(".")) continue;
    if (!pasta && FORA.has(item.name)) continue;
    const sub = pasta ? `${pasta}/${item.name}` : item.name;
    if (existsSync(join(RAIZ, sub, "index.html"))) encontradas.push(`${sub}/index.html`);
    encontradas.push(...(await listarPaginas(sub)));
  }
  return encontradas;
}

/* "credito-pessoal/index.html" → "credito-pessoal/"; "404.html" → "404.html" */
const enderecoDe = (arquivo) => arquivo.replace(/index\.html$/, "");

/* ── Leitura do index.html ── */

/* Um bloco vai do comentário de seção até antes do próximo comentário de
   primeiro nível, de <main>, </main> ou de <script>. */
function acharBloco(html, nome) {
  const marca = `<!-- ══════════════ ${nome} ══════════════ -->`;
  const inicio = html.indexOf(marca);
  if (inicio === -1) return null;
  const resto = html.slice(inicio + marca.length);
  const fim = resto.search(/\n(?=<!--|<main|<\/main|<script)/);
  const corpo = (fim === -1 ? resto : resto.slice(0, fim)).replace(/\s+$/, "");
  return { inicio, fim: inicio + marca.length + corpo.length, texto: marca + corpo };
}

function lerComum(index) {
  const head = index.slice(0, index.indexOf("</head>"));
  const corpo = index.slice(index.indexOf("<body"));

  /* Scripts do <head> só os inline de uma linha (o do tema); o JSON-LD é de
     cada página e começa com <script type=…>. */
  const tagsHead = [...head.matchAll(/^[ \t]*(<meta name="theme-color"[^>]*>|<link [^>]*>|<script>[^<]*<\/script>)[ \t]*$/gm)]
    .map((m) => m[1])
    .filter((tag) => !/rel="canonical"/.test(tag) && !SO_DA_HOME.test(tag));

  const scripts = [...corpo.matchAll(/^[ \t]*(<script src="[^"]+"[^>]*><\/script>)[ \t]*$/gm)]
    .map((m) => m[1])
    .filter((tag) => !SO_DA_HOME.test(tag));

  const blocos = {};
  for (const nome of BLOCOS) {
    const bloco = acharBloco(index, nome);
    if (!bloco) throw new Error(`bloco "${nome}" não encontrado no index.html`);
    blocos[nome] = bloco.texto.replace(/ aria-current="page"/g, "");
  }
  return { tagsHead, scripts, blocos };
}

/* ── Ajuste de caminhos ── */

function ajustarCaminhos(html, prefixo, enderecosLocais, proprio) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (tudo, attr, valor) => {
    let alvo = valor;
    const absoluto = valor.match(/^https?:\/\/(?:www\.)?hsfinanceira\.com\.br\/([^?#"]*)(.*)$/);
    if (absoluto && (absoluto[1] === "" || enderecosLocais.has(absoluto[1]))) {
      alvo = prefixo + absoluto[1] + absoluto[2] || "./";
    } else if (valor === "#") {
      alvo = prefixo || "./";
    } else if (valor.startsWith("#")) {
      alvo = prefixo + valor;
    } else if (!/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(valor)) {
      alvo = prefixo + valor;
    }
    if (proprio !== null && attr === "href" && alvo === prefixo + proprio) {
      return `${attr}="${alvo}" aria-current="page"`;
    }
    return `${attr}="${alvo}"`;
  });
}

/* Nos links do index.html, só os <a href> do corpo: JSON-LD, canonical e
   og:url precisam continuar absolutos. */
function relativizarIndex(index, enderecosLocais) {
  const inicioCorpo = index.indexOf("<body");
  const corpo = index.slice(inicioCorpo).replace(/<a\b[^>]*>/g, (tag) =>
    tag.replace(/href="(https?:\/\/(?:www\.)?hsfinanceira\.com\.br\/([^?#"]*)[^"]*)"/, (attr, url, caminho) =>
      enderecosLocais.has(caminho) ? attr.replace(url, url.replace(/^https?:\/\/(?:www\.)?hsfinanceira\.com\.br\//, "")) : attr
    )
  );
  return index.slice(0, inicioCorpo) + corpo;
}

/* Links do corpo para outros sites abrem em nova aba, como no site antigo; o
   rel="noopener" impede que a aba nova controle esta pelo window.opener. Os
   links para hsfinanceira.com.br (páginas e PDFs) seguem na mesma aba. */
function abrirExternosEmNovaAba(html) {
  const inicioCorpo = html.indexOf("<body");
  if (inicioCorpo === -1) return html;
  const corpo = html.slice(inicioCorpo).replace(/<a\b[^>]*>/g, (tag) => {
    const href = tag.match(/\shref="(https?:\/\/[^"]*)"/);
    if (!href || /^https?:\/\/(?:www\.)?hsfinanceira\.com\.br(?:[/?#]|$)/.test(href[1])) return tag;
    let novos = "";
    if (/\starget="/.test(tag)) tag = tag.replace(/\starget="[^"]*"/, ' target="_blank"');
    else novos += ' target="_blank"';
    if (/\srel="/.test(tag)) tag = tag.replace(/\srel="([^"]*)"/, (attr, rel) => (/\bnoopener\b/.test(rel) ? attr : ` rel="${rel} noopener"`));
    else novos += ' rel="noopener"';
    return tag.replace(href[0], () => href[0] + novos);
  });
  return html.slice(0, inicioCorpo) + corpo;
}

/* ── Montagem de uma página ── */

function trocarRegiao(html, abre, fecha, recuo, linhas) {
  const i = html.indexOf(abre);
  const f = html.indexOf(fecha);
  if (i === -1 || f === -1 || f < i) return { html, achou: false };
  const meio = linhas.map((l) => recuo + l).join("\n");
  return { html: html.slice(0, i + abre.length) + "\n" + meio + "\n" + recuo + html.slice(f), achou: true };
}

function montar(pagina, html, comum, enderecosLocais) {
  const endereco = enderecoDe(pagina);
  const naRaiz = PAGINAS_NA_RAIZ.includes(pagina);
  const prefixo = naRaiz ? "/" : "../".repeat(endereco.split("/").length - 1);
  const proprio = naRaiz ? null : endereco;
  const ajustar = (texto) => ajustarCaminhos(texto, prefixo, enderecosLocais, proprio);
  const avisos = [];

  const head = trocarRegiao(html, "<!-- comum:head -->", "<!-- /comum:head -->", "  ", comum.tagsHead.map(ajustar));
  if (!head.achou) avisos.push("sem a região <!-- comum:head --> … <!-- /comum:head -->");
  html = head.html;

  for (const nome of BLOCOS) {
    const atual = acharBloco(html, nome);
    if (atual) {
      html = html.slice(0, atual.inicio) + ajustar(comum.blocos[nome]) + html.slice(atual.fim);
      continue;
    }
    const referencia = INSERIR_DEPOIS[nome] && acharBloco(html, INSERIR_DEPOIS[nome]);
    if (referencia) html = html.slice(0, referencia.fim) + "\n\n" + ajustar(comum.blocos[nome]) + html.slice(referencia.fim);
  }

  const scripts = trocarRegiao(html, "<!-- comum:scripts -->", "<!-- /comum:scripts -->", "", comum.scripts.map(ajustar));
  if (!scripts.achou) avisos.push("sem a região <!-- comum:scripts --> … <!-- /comum:scripts -->");
  return { html: abrirExternosEmNovaAba(scripts.html), avisos };
}

/* ── Conferência de SEO ── */

function conferirSeo(pagina, html, sitemap, enderecosLocais) {
  const problemas = [];
  const url = SITE + enderecoDe(pagina);
  const valor = (re) => (html.match(re) || [])[1];
  if (PAGINAS_NA_RAIZ.includes(pagina)) {
    if (!/<meta name="robots" content="noindex/.test(html)) problemas.push("404 sem robots noindex");
    return problemas;
  }
  // O canonical pode apontar para outra página do site quando o endereço é uma
  // duplicata mantida só para não quebrar links (ex.: solicitacao_credito_pessoal/).
  const canonical = valor(/<link rel="canonical" href="([^"]*)"/);
  const duplicata = canonical !== url && canonical?.startsWith(SITE) && enderecosLocais.has(canonical.slice(SITE.length));
  if (canonical !== url && !duplicata) problemas.push(`canonical diferente de ${url}`);
  if (valor(/<meta property="og:url" content="([^"]*)"/) !== canonical) problemas.push("og:url diferente do canonical");
  if (!valor(/<title>([^<]+)<\/title>/)) problemas.push("sem <title>");
  const descricao = valor(/<meta name="description" content="([^"]+)"/);
  if (!descricao) problemas.push("sem meta description");
  else if (descricao.length > 160) problemas.push(`meta description com ${descricao.length} caracteres (o Google corta perto de 155)`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problemas.push(`${h1} <h1> (deve ter exatamente um)`);
  if (sitemap !== null && canonical === url && !sitemap.includes(`<loc>${url}</loc>`)) problemas.push("fora do sitemap.xml");
  return problemas;
}

/* ── Execução ── */

async function executar() {
  const paginas = [...(await listarPaginas()), ...PAGINAS_NA_RAIZ.filter((p) => existsSync(join(RAIZ, p)))];
  const enderecosLocais = new Set(paginas.filter((p) => !PAGINAS_NA_RAIZ.includes(p)).map(enderecoDe));
  const sitemap = existsSync(join(RAIZ, "sitemap.xml")) ? await ler("sitemap.xml") : null;

  const indexOriginal = await ler("index.html");
  const index = abrirExternosEmNovaAba(relativizarIndex(indexOriginal, enderecosLocais));
  const comum = lerComum(index);

  const desatualizadas = [];
  const problemas = [];

  if (index !== indexOriginal) {
    desatualizadas.push("index.html (links absolutos para páginas locais ou externos sem nova aba)");
    if (!VERIFICAR) await writeFile(join(RAIZ, "index.html"), index, "utf8");
  }

  for (const pagina of paginas.sort()) {
    const original = await ler(pagina);
    const { html, avisos } = montar(pagina, original, comum, enderecosLocais);
    for (const a of [...avisos, ...conferirSeo(pagina, html, sitemap, enderecosLocais)]) problemas.push(`${pagina}: ${a}`);
    if (html !== original) {
      desatualizadas.push(pagina);
      if (!VERIFICAR) await writeFile(join(RAIZ, pagina), html, "utf8");
    }
  }

  console.log(`\nHS Financeira — páginas internas (${paginas.length})\n`);
  if (desatualizadas.length) {
    console.log(VERIFICAR ? "  Desatualizadas em relação ao index.html:" : "  Atualizadas:");
    for (const p of desatualizadas) console.log(`    ${p}`);
  } else {
    console.log("  Todas em dia com o index.html.");
  }
  if (problemas.length) {
    console.log("\n  Conferência de SEO:");
    for (const p of problemas) console.log(`    ✗ ${p}`);
  }
  console.log("");
  if (VERIFICAR && (desatualizadas.length || problemas.length)) process.exit(1);
  if (problemas.length) process.exitCode = 1;
}

try {
  await executar();
} catch (erro) {
  console.error(`\n  Falhou: ${erro.message}\n`);
  process.exit(1);
}
