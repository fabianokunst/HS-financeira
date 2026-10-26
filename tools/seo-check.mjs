/**
 * Conferência de SEO da página inicial.
 *
 *   node tools/seo-check.mjs                  → só confere
 *   node tools/seo-check.mjs --corrigir-faq   → refaz o FAQPage do JSON-LD a
 *                                               partir do FAQ visível e confere
 *   (ou: npm run seo  /  npm run seo -- --corrigir-faq)
 *
 * O que mais quebra em silêncio é o FAQ: o Google exige que o JSON-LD repita
 * exatamente as perguntas e respostas que aparecem na página, e é fácil mudar
 * uma resposta no HTML e esquecer da outra. O resto são conferências baratas
 * do <head>, dos títulos, das imagens e dos arquivos de rastreamento
 * (robots.txt, sitemap.xml, llms.txt).
 *
 * Sem dependências: só Node 18+. Sai com código 1 se houver erro; avisos não
 * bloqueiam.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const PAGINA = "index.html";
const CORRIGIR_FAQ = process.argv.includes("--corrigir-faq");

const erros = [], avisos = [], oks = [];
const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);
const ok = (m) => oks.push(m);

const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", mdash: "—", ndash: "–", middot: "·", rarr: "→" };

/* HTML → texto corrido, do jeito que um robô lê: tags de bloco viram espaço,
   tags de linha somem (para "e-mail</a>, e" não virar "e-mail , e"). */
const texto = (html) => html
  .replace(/<svg[\s\S]*?<\/svg>/g, "")
  .replace(/<\/?(p|div|br|li|ul|ol|h[1-6])\b[^>]*>/g, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/&(#\d+|[a-z]+);/g, (e, n) => (n[0] === "#" ? String.fromCharCode(+n.slice(1)) : ENTIDADES[n] ?? e))
  .replace(/\s+/g, " ")
  .trim();

const meta = (html, atributo, nome) =>
  html.match(new RegExp(`<meta ${atributo}="${nome}" content="([^"]*)"`))?.[1];

/* JSON legível e estável: objetos e listas curtos ficam numa linha só. */
function formatar(valor, recuo) {
  const linha = JSON.stringify(valor);
  if (valor === null || typeof valor !== "object" || recuo.length + linha.length <= 110) return linha;
  const dentro = recuo + "  ";
  const itens = Array.isArray(valor)
    ? valor.map((v) => dentro + formatar(v, dentro))
    : Object.entries(valor).map(([k, v]) => `${dentro}${JSON.stringify(k)}: ${formatar(v, dentro)}`);
  const [abre, fecha] = Array.isArray(valor) ? ["[", "]"] : ["{", "}"];
  return `${abre}\n${itens.join(",\n")}\n${recuo}${fecha}`;
}

function conferirHead(html) {
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  if (!titulo) erro("página sem <title>");
  else if (titulo.length > 65) aviso(`<title> com ${titulo.length} caracteres — o Google corta perto de 60`);
  else ok(`<title> com ${titulo.length} caracteres`);

  const descricao = meta(html, "name", "description") ?? "";
  if (!descricao) erro("página sem meta description");
  else if (descricao.length > 160) aviso(`meta description com ${descricao.length} caracteres — o Google corta perto de 155`);
  else ok(`meta description com ${descricao.length} caracteres`);

  const canonica = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!canonica?.startsWith("https://")) erro('falta <link rel="canonical"> com URL absoluta https://');
  else ok(`canonical: ${canonica}`);

  if (meta(html, "property", "og:url") !== canonica) aviso("og:url diferente do canonical");
  if (!meta(html, "name", "twitter:card")) aviso("falta twitter:card");

  const imagemOg = meta(html, "property", "og:image");
  if (!imagemOg) erro("falta og:image (a página sai sem imagem no WhatsApp e nas redes)");
  else if (canonica && imagemOg.startsWith(canonica)) {
    const local = imagemOg.slice(canonica.length);
    if (!existsSync(join(RAIZ, local))) erro(`og:image aponta para "${local}", que não existe no projeto`);
    else ok(`og:image: ${local}`);
  }
  return canonica;
}

function conferirCorpo(html) {
  const niveis = [...html.matchAll(/<h([1-6])\b/g)].map((m) => +m[1]);
  const h1 = niveis.filter((n) => n === 1).length;
  if (h1 !== 1) erro(`a página tem ${h1} <h1>; deve ter exatamente um`);
  const saltos = niveis.filter((n, i) => i > 0 && n > niveis[i - 1] + 1).length;
  if (saltos) aviso(`${saltos} salto(s) de nível nos títulos (ex.: h2 seguido de h4)`);
  else ok(`${niveis.length} títulos em ordem, um <h1>`);

  const imagens = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  imagens.forEach((img, i) => {
    const nome = img.match(/src="([^"]+)"/)?.[1] ?? "?";
    if (!/\balt="[^"]+"/.test(img)) erro(`imagem sem alt: ${nome}`);
    if (!/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) erro(`imagem sem width/height: ${nome}`);
    if (i > 0 && !/\bloading="lazy"/.test(img)) aviso(`imagem abaixo da dobra sem loading="lazy": ${nome}`);
  });
  ok(`${imagens.length} imagens com alt, width e height`);

  for (const [, rel] of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
    if (!existsSync(join(RAIZ, rel))) erro(`arquivo referenciado não existe: ${rel}`);
  }

  const vazios = (html.match(/href="#"/g) ?? []).length;
  if (vazios) aviso(`${vazios} link(s) ainda apontam para "#" — robôs não os seguem`);
}

/* Lê o FAQ visível e compara (ou sincroniza) com o FAQPage do JSON-LD. */
function conferirFaq(html) {
  const perguntas = [...html.matchAll(/<button class="acc__q"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => texto(m[1]));
  const respostas = [...html.matchAll(/<div class="acc__a"><div>([\s\S]*?)<\/div><\/div>/g)].map((m) => texto(m[1]));
  if (perguntas.length !== respostas.length) {
    erro(`FAQ com ${perguntas.length} perguntas e ${respostas.length} respostas — markup quebrado?`);
    return html;
  }
  const visivel = perguntas.map((p, i) => ({
    "@type": "Question", name: p, acceptedAnswer: { "@type": "Answer", text: respostas[i] }
  }));

  const bloco = html.match(/(<script type="application\/ld\+json">)([\s\S]*?)(\n[ \t]*<\/script>)/);
  if (!bloco) { erro("página sem JSON-LD"); return html; }
  let dados;
  try { dados = JSON.parse(bloco[2]); } catch (e) { erro(`JSON-LD inválido: ${e.message}`); return html; }

  const nos = dados["@graph"] ?? [dados];
  const faq = nos.find((n) => n["@type"] === "FAQPage");
  if (!faq) { erro("JSON-LD sem nó FAQPage"); return html; }

  const igual = JSON.stringify(faq.mainEntity) === JSON.stringify(visivel);
  if (CORRIGIR_FAQ && !igual) {
    faq.mainEntity = visivel;
    const novo = `${bloco[1]}\n  ${formatar(dados, "  ")}${bloco[3]}`;
    ok(`FAQPage refeito a partir do FAQ visível (${visivel.length} perguntas)`);
    return html.replace(bloco[0], () => novo);
  }
  if (igual) ok(`FAQPage igual ao FAQ visível (${visivel.length} perguntas)`);
  else {
    const i = visivel.findIndex((q, n) => JSON.stringify(q) !== JSON.stringify(faq.mainEntity?.[n]));
    erro(`FAQPage diferente do FAQ visível a partir da pergunta ${i + 1} ("${perguntas[i] ?? "—"}")` +
      ` — rode: npm run seo -- --corrigir-faq`);
  }
  return html;
}

async function conferirArquivos(canonica) {
  const ler = async (rel) => (existsSync(join(RAIZ, rel)) ? readFile(join(RAIZ, rel), "utf8") : null);

  const robots = await ler("robots.txt");
  if (robots === null) erro("falta robots.txt na raiz");
  else if (canonica && !robots.includes(`Sitemap: ${canonica}sitemap.xml`)) aviso("robots.txt não aponta para o sitemap.xml");
  else ok("robots.txt com sitemap");

  const sitemap = await ler("sitemap.xml");
  if (sitemap === null) erro("falta sitemap.xml na raiz");
  else if (canonica && !sitemap.includes(`<loc>${canonica}</loc>`)) erro("sitemap.xml não lista a URL canônica");
  else ok(`sitemap.xml com ${(sitemap.match(/<loc>/g) ?? []).length} URL(s)`);

  const llms = await ler("llms.txt");
  if (llms === null) aviso("falta llms.txt na raiz");
  else if (!llms.startsWith("# ")) aviso("llms.txt deve começar com um título markdown (# Nome)");
  else ok("llms.txt presente");
}

async function main() {
  const caminho = join(RAIZ, PAGINA);
  const original = await readFile(caminho, "utf8");

  const canonica = conferirHead(original);
  conferirCorpo(original);
  const html = conferirFaq(original);
  await conferirArquivos(canonica);
  if (html !== original) await writeFile(caminho, html, "utf8");

  console.log(`\nHS Financeira — conferência de SEO (${PAGINA})\n`);
  for (const m of oks) console.log(`  ✓ ${m}`);
  for (const m of avisos) console.log(`  ! ${m}`);
  for (const m of erros) console.log(`  ✗ ${m}`);
  console.log(`\n  ${erros.length} erro(s), ${avisos.length} aviso(s)\n`);
  process.exit(erros.length ? 1 : 0);
}

await main();
