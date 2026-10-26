# SEO da HS Financeira — Google e assistentes de IA

Diagnóstico da página inicial (`index.html`) e do que foi feito em 26/10/2026.
"LLMs" aqui são os assistentes que respondem perguntas citando sites:
ChatGPT, Claude, Perplexity, Gemini e Copilot. Para eles, o trabalho é o mesmo
do SEO clássico, com três diferenças: leem o HTML cru (quase nenhum executa
JavaScript), preferem frases curtas que se sustentam sozinhas e usam muito
dados estruturados e fontes externas (Wikidata, Bing) para confirmar fatos.

Para conferir tudo depois de qualquer mudança: `npm run seo`.

---

## 1. Diagnóstico

| Ponto | Antes | Impacto | Situação agora |
|---|---|---|---|
| URL canônica | ausente | Google pode indexar cópias (com `?utm=`, `/index.html`, o arquivo de `compartilhar/`) e dividir a relevância | `<link rel="canonical">` para `https://hsfinanceira.com.br/` |
| robots.txt | ausente | sem orientação a robôs; pastas internas expostas | criado, libera buscadores e IA, bloqueia `compartilhar/`, `reference/`, `tools/` |
| sitemap.xml | ausente | descoberta mais lenta | criado, com as imagens da página e o `/aviso/` |
| Imagem de compartilhamento | ausente | link sem imagem no WhatsApp, LinkedIn e Facebook | `assets/og/hs-financeira-og.jpg` (1200×630) + `og:url`, `og:site_name`, `twitter:card` |
| Favicon | ausente | sem ícone no resultado do Google | feito pela sessão "Favicon" em `assets/favicon/`; `favicon.ico` copiado para a raiz |
| Dados estruturados | um `FinancialService` mínimo | Google e IA com pouca informação sobre a empresa | grafo com organização, site, página, FAQ e catálogo de 9 produtos (ver seção 3) |
| Hierarquia de títulos | nomes de produtos em `<b>`; rodapé pulava de `h2` para `h4` | página "sem índice" para robôs; IA não separa os produtos | produtos, cards PJ, LC/CDB, governança e perguntas do FAQ viraram `h3`; rodapé `h2` — visual idêntico |
| `<s>` na tabela de produtos | "sem juros", "Sujeito a análise" etc. marcados como texto **riscado** | ao converter para texto, IA lê "até 15x ~~sem juros~~" — o oposto do que a página diz | trocado por `<small>` |
| Rótulos da tabela | cabeçalho oculto para leitores de tela | robôs e leitores de tela liam "até 24x Lojas taQi" sem saber o que é cada valor | rótulos "Prazo:" e "Onde contratar:" só para leitores e robôs (`.sr-only`) |
| Palavra "empréstimo" | não aparecia na página | é como a maioria pesquisa ("empréstimo pessoal", "empréstimo consignado") | na meta description, na tabela, no FAQ e no JSON-LD |
| Perguntas de marca | sem resposta direta | "HS Financeira é confiável?", "telefone da HS Financeira" estão entre as buscas mais comuns de marca | 3 perguntas novas no FAQ (confiabilidade, telefone, consignado INSS), só com fatos já publicados na página |
| Telefones | texto solto | no celular não dava para tocar e ligar | links `tel:` na faixa do topo, no rodapé e no FAQ |
| Imagens | todas carregadas de uma vez | pior LCP (Core Web Vitals, fator de ranqueamento) | foto do topo com `fetchpriority="high"`; as outras com `loading="lazy"` |
| Links `#` | 30+ links vazios | robôs não seguem; sem ligação interna | a sessão "Verificação de conteúdo" trocou quase todos pelos endereços reais; sobraram 2 (logo e "Continuar com esta simulação") |
| Link direto para uma pergunta | `#renegociacao` levava ao FAQ fechado | quem chega de busca ou do menu não vê a resposta | o acordeão abre a pergunta indicada no endereço |

## 2. Google

**Técnico.** Canonical, `robots` com `max-image-preview:large` (libera
imagem grande no Discover), robots.txt, sitemap com imagens, favicon,
`lang="pt-BR"` (já existia), conteúdo todo no HTML sem depender de JS (já
existia — ótimo para robôs).

**Na página.** Título (55 caracteres) e descrição (153) dentro do que o Google
mostra sem cortar. Um único `h1`, títulos em ordem, `h3` em cada produto.
Textos alternativos das imagens já eram bons.

**Desempenho.** Imagens com prioridade correta. Larguras e alturas das
imagens já estavam declaradas (sem salto de layout).

**Confiança (E-E-A-T).** Para sites financeiros o Google é mais exigente
("Your Money or Your Life"). A página já tinha o essencial: razão social,
CNPJ, endereço, autorização do Banco Central, CET, Ouvidoria e aviso contra
golpes. A sessão de conteúdo acrescentou os documentos de governança; o FAQ
"A HS Financeira é confiável?" junta esses sinais numa resposta só.

## 3. Assistentes de IA

- **JSON-LD como ficha da empresa.** O `<head>` descreve a HS como um grafo:
  `FinancialService` (nome, razão social, CNPJ, endereço, Grupo Herval, redes
  sociais, logo, 6 canais de atendimento com horários) + catálogo de produtos
  (prazos máximos, valores e links) + `WebSite` + `WebPage` + `FAQPage`. É a
  fonte que buscadores e IA usam para responder "qual o telefone", "qual o
  CNPJ", "em quantas vezes" sem adivinhar.
- **`llms.txt`** na raiz: resumo em markdown com dados institucionais,
  produtos, canais oficiais, avisos de golpe e links. É uma proposta aberta
  (llmstxt.org), ainda não um padrão que Google ou OpenAI prometam ler — custa
  pouco e já é usado por ferramentas de IA e agentes.
- **robots.txt explícito para IA.** Robôs que buscam para citar (OAI-SearchBot,
  ChatGPT-User, Claude-SearchBot, PerplexityBot…) e robôs de treinamento
  (GPTBot, ClaudeBot, Google-Extended…) estão liberados e listados por nome.
  Bloquear os de treinamento não afeta Google nem Bing — é uma decisão do
  jurídico/marketing, e o arquivo explica como fazer.
- **Texto que se lê sem o layout.** Fim do texto "riscado", rótulos nas
  colunas da tabela e respostas do FAQ que se sustentam sozinhas (começam com
  "Sim." / "Não." e repetem o nome da HS).

> Observação: desde 2023 o Google só mostra o FAQ como "resultado
> enriquecido" para sites de governo e saúde. O `FAQPage` continua valendo
> para Bing, IA e para o entendimento da página — só não espere o acordeão no
> resultado do Google.

## 4. Como manter

| Quando | O que fazer |
|---|---|
| Mudou uma pergunta ou resposta do FAQ | `npm run seo -- --corrigir-faq` (refaz o FAQPage do JSON-LD a partir do FAQ visível) |
| Mudou produto, prazo, telefone ou horário | atualizar o mesmo dado no JSON-LD do `index.html` e no `llms.txt` |
| Mudou o conteúdo da página de verdade | atualizar `<lastmod>` no `sitemap.xml` |
| Mudou a identidade visual | refazer `assets/og/hs-financeira-og.jpg` (1200×630) e `assets/marca/hs-financeira-logo-512.png` |
| Antes de publicar | `npm run seo` — sai com erro se faltar canonical, og:image, alt de imagem, arquivo referenciado, ou se o FAQPage divergir |

## 5. Próximos passos (fora do código)

Em ordem de impacto:

1. **Migração sem perder posição.** O site novo vai substituir o WordPress no
   mesmo domínio: toda URL antiga precisa responder no mesmo endereço ou com
   redirecionamento 301 (a sessão "Manutenção da estrutura de páginas para
   SEO" está recriando as 26 páginas e o `.htaccess`). Incluir 301 de
   `http://` e de `www.` para `https://hsfinanceira.com.br/`.
2. **Google Search Console e Bing Webmaster Tools.** Verificar o domínio,
   enviar o `sitemap.xml` e acompanhar a cobertura na semana da troca. O Bing
   é a base de busca do ChatGPT e do Copilot — sem ele, a HS aparece menos nas
   respostas de IA. Ativar o IndexNow no Bing acelera a reindexação.
3. **Validar após publicar:** [Teste de resultados
   avançados](https://search.google.com/test/rich-results),
   [validator.schema.org](https://validator.schema.org/) e o inspetor de
   links do LinkedIn/Facebook para a imagem de compartilhamento.
4. **Wikidata.** Criar (ou completar) o item "HS Financeira" com CNPJ,
   fundação, sede, empresa-mãe (Grupo Herval), site e redes. IA e o painel de
   conhecimento do Google confirmam fatos por lá.
5. **Perfil da Empresa no Google** para a sede em Dois Irmãos, com o mesmo
   nome, endereço e telefone da página.
6. **Reputação.** Responder no Reclame Aqui e no consumidor.gov.br — "HS
   Financeira é confiável" e "HS Financeira reclame aqui" são buscas de marca
   frequentes, e a IA usa essas fontes.
7. **Conteúdo por produto e por dúvida.** Cada produto com página própria
   (em andamento) e guias que respondam buscas reais ("empréstimo sem conta em
   banco", "consignado INSS em 84x", "LC ou CDB: qual escolher", "como
   identificar golpe do falso empréstimo"), com autor e data.
8. **Título principal.** O `h1` ("Crédito que cabe no seu ritmo — sem
   burocracia.") não tem o termo mais buscado. Sugestão, se o marketing
   aceitar: "Empréstimo e crédito pessoal no seu ritmo — sem burocracia."
9. **Desempenho.** Converter as fotos para WebP/AVIF (≈30–40% menores; exige
   ajustar o `tools/bundle.mjs`) e, em produção, servir os 19 CSS como um só.
10. **Simulador.** Ele mostra "Taxa de referência 3,99% a.m."; vale o jurídico
    confirmar se a exibição de taxa sem CET atende às regras de publicidade de
    crédito.
