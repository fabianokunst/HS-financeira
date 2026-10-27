# Referência

Nada aqui é publicado (o `.htaccess` responde 404 para `/reference/`).

## `wordpress/` — cópia do site antigo (não apague)

O WordPress de hsfinanceira.com.br vai ser apagado; esta é a cópia do que ele
publicava, baixada em 27/10/2026 pelo próprio site (HTTP e API REST). Os
arquivos de mídia (PDFs, imagens, fontes e CSS do Elementor) não estão aqui:
ficam em `/wp-content/uploads/`, na raiz do projeto, porque o site novo os
serve nos mesmos endereços.

- `paginas/` — o HTML de cada um dos 27 endereços do sitemap do WordPress
  (`home.html` é a página inicial; `category__categoria.html` é
  `/category/categoria/`).
- `conteudo/` — o que a API REST (`/wp-json/wp/v2/`) devolve: páginas, posts,
  categoria e a biblioteca de mídia (título, texto alternativo, data e página
  de cada arquivo).
- `texto/` — o conteúdo principal de cada página, em texto, sem o layout.
- `raiz/` — `robots.txt` e os sitemaps do WordPress.

O que esta cópia não tem, porque só sai do painel da hospedagem: o banco de
dados (inclusive mensagens recebidas pelos formulários), o tema, os plugins,
as configurações e 10 itens da biblioteca de mídia que pertencem a modelos não
publicados do Elementor e que a API não mostra.

## `proposta-hs-financeira.v1.html`

O arquivo único original, de antes da organização em projeto, guardado só para
comparação. Pode ser apagado depois de conferir que a página nova está igual.
