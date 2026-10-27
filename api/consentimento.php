<?php
/* Registro dos consentimentos de cookies — a prova que a LGPD pede de quem
   coleta (art. 8º, § 2º: cabe ao controlador provar que o consentimento foi
   obtido). A cada escolha no banner, o js/cookies.js manda para cá um JSON
   pequeno; aqui ele é conferido e gravado como uma linha num arquivo por mês:

     consentimentos-AAAA-MM.jsonl  (uma escolha por linha, em JSON)

   Os arquivos ficam FORA da pasta pública do site, numa pasta irmã dela
   (ex.: /home/conta/public_html → /home/conta/consentimentos-cookies). Para
   usar outro lugar, defina a variável de ambiente HS_CONSENTIMENTOS_DIR.
   Cada linha tem: data e hora, o identificador aleatório do navegador (o
   mesmo que fica guardado nele), a versão do banner, a ação (aceitar,
   recusar, salvar ou fechar), cada categoria, a página, o IP sem o último
   bloco e o navegador. Nenhum dado pessoal além disso.
   Requer PHP 8 (a hospedagem atual roda PHP 8.5). */

declare(strict_types=1);

const TAMANHO_MAXIMO = 2048;
const ACOES = ['aceitar', 'recusar', 'salvar', 'fechar'];
const CATEGORIAS = ['analiticos', 'publicidade'];

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder(int $status): never
{
    http_response_code($status);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405);
}

/* Só aceita envios do próprio site: o navegador manda a origem em todo POST. */
$origem = parse_url($_SERVER['HTTP_ORIGIN'] ?? '');
$hostOrigem = ($origem['host'] ?? '') . (isset($origem['port']) ? ':' . $origem['port'] : '');
if ($hostOrigem === '' || strcasecmp($hostOrigem, $_SERVER['HTTP_HOST'] ?? '') !== 0) {
    responder(403);
}

$corpo = file_get_contents('php://input', false, null, 0, TAMANHO_MAXIMO + 1);
if ($corpo === false || strlen($corpo) > TAMANHO_MAXIMO) {
    responder(413);
}
$dados = json_decode($corpo, true);
if (!is_array($dados)
    || !is_string($dados['id'] ?? null) || !preg_match('/^[0-9a-f]{32}$/', $dados['id'])
    || !is_string($dados['versao'] ?? null) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dados['versao'])
    || !in_array($dados['acao'] ?? null, ACOES, true)
    || !is_array($dados['categorias'] ?? null)) {
    responder(400);
}

/* IP sem o último bloco: basta para a prova e não identifica a pessoa sozinho. */
function ipReduzido(string $ip): string
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return preg_replace('/\.\d+$/', '.0', $ip);
    }
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $bin = inet_pton($ip);
        return inet_ntop(substr($bin, 0, 6) . str_repeat("\0", 10)) ?: '';
    }
    return '';
}

$pagina = is_string($dados['pagina'] ?? null) ? $dados['pagina'] : '';
$pagina = str_starts_with($pagina, '/') ? substr(preg_replace('/[^\x21-\x7E]/', '', $pagina), 0, 200) : '';

$agora = new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
$registro = [
    'data' => $agora->format(DATE_ATOM),
    'id' => $dados['id'],
    'versao' => $dados['versao'],
    'acao' => $dados['acao'],
    'necessarios' => true,
];
foreach (CATEGORIAS as $categoria) {
    $registro[$categoria] = ($dados['categorias'][$categoria] ?? false) === true;
}
$registro['pagina'] = $pagina;
$registro['ip'] = ipReduzido($_SERVER['REMOTE_ADDR'] ?? '');
$registro['navegador'] = mb_substr(preg_replace('/[\x00-\x1F\x7F]/', '', $_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300);

$pasta = getenv('HS_CONSENTIMENTOS_DIR') ?: dirname(__DIR__, 2) . '/consentimentos-cookies';
if (!is_dir($pasta) && !@mkdir($pasta, 0750, true) && !is_dir($pasta)) {
    error_log('consentimento.php: não foi possível criar ' . $pasta);
    responder(500);
}
/* Se um dia a pasta for parar dentro da área pública, ela continua fechada. */
if (!is_file($pasta . '/.htaccess')) {
    @file_put_contents($pasta . '/.htaccess', "Require all denied\n");
}

$linha = json_encode($registro, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
$arquivo = $pasta . '/consentimentos-' . $agora->format('Y-m') . '.jsonl';
if (file_put_contents($arquivo, $linha, FILE_APPEND | LOCK_EX) === false) {
    error_log('consentimento.php: não foi possível gravar em ' . $arquivo);
    responder(500);
}

responder(204);
