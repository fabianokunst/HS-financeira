<?php
/* Formulários do site: o Fale Conosco (envie-nos-uma-mensagem/) e os três
   pedidos da LGPD (lgpd/). O js/formulario.js manda cada envio para cá por
   POST; aqui ele é conferido e repassado para os mesmos destinos do site atual:

   - ao Emarsys, o mesmo cadastro que o WordPress faz hoje (um formulário do
     Emarsys por tipo, f=1413 a 1416), mas de servidor para servidor: nome,
     CPF, e-mail e telefone nunca vão numa URL do navegador;
   - por e-mail, para contato@ (Fale Conosco) ou lgpd@ (LGPD), com a pessoa
     no Reply-To e um número de protocolo, que ela também vê na tela.

   Basta um dos dois dar certo para o envio valer; se os dois falham, a pessoa
   é avisada para usar o e-mail ou o telefone. Nada do envio é gravado aqui:
   o único arquivo é o limite de envios por IP (com o IP embaralhado), numa
   pasta FORA da área pública, ao lado da do site (ou em HS_FORMULARIOS_DIR).

   Contra robôs, sem reCAPTCHA: um campo-armadilha invisível ("recado"), um
   tempo mínimo de preenchimento e o limite por IP.

   Fora dos domínios oficiais (homologação, localhost) nada sai: o envio é
   conferido e respondido como no ar, mas sem Emarsys e sem e-mail, para não
   misturar testes com pedidos reais. Para testar o repasse, aponte
   HS_FORMULARIOS_EMARSYS_URL para um servidor de teste e/ou
   HS_FORMULARIOS_EMAIL_PARA para uma caixa de teste (essa troca vale também
   no ar). O remetente é nao-responda@hsfinanceira.com.br, ou
   HS_FORMULARIOS_REMETENTE.
   Requer PHP 8 (a hospedagem atual roda PHP 8.5), com curl ou allow_url_fopen. */

declare(strict_types=1);

const DOMINIOS_OFICIAIS = ['hsfinanceira.com.br', 'www.hsfinanceira.com.br'];
const EMARSYS_URL = 'https://link.cartaohoje.com.br/u/register.php';
const EMARSYS_CID = '1093070733';
const REMETENTE = 'nao-responda@hsfinanceira.com.br';
const TAMANHO_MAXIMO = 16384;
const TEMPO_MINIMO = 3;           // segundos entre abrir a página e enviar
const LIMITES = [900 => 5, 86400 => 20];  // janela em segundos => envios por IP

/* Um por formulário. "emarsys" é o f do formulário no Emarsys; "nomeSocial"
   diz se ele tem a pergunta do nome social (vai ao Emarsys como S/N); "texto"
   é o nome do campo livre no e-mail, o mesmo da página. */
const FORMULARIOS = [
    'fale-conosco' => [
        'titulo' => 'Fale conosco',
        'emarsys' => '1413',
        'email' => 'contato@hsfinanceira.com.br',
        'pagina' => '/envie-nos-uma-mensagem/',
        'nomeSocial' => false,
        'texto' => 'Mensagem',
    ],
    'lgpd-exclusao' => [
        'titulo' => 'LGPD: excluir meus dados',
        'emarsys' => '1414',
        'email' => 'lgpd@hsfinanceira.com.br',
        'pagina' => '/lgpd/',
        'nomeSocial' => true,
        'texto' => 'Descrição detalhada',
    ],
    'lgpd-oposicao' => [
        'titulo' => 'LGPD: oposição ao tratamento de dados',
        'emarsys' => '1415',
        'email' => 'lgpd@hsfinanceira.com.br',
        'pagina' => '/lgpd/',
        'nomeSocial' => true,
        'texto' => 'Descrição detalhada',
    ],
    'lgpd-denuncia' => [
        'titulo' => 'LGPD: denúncia de tratamento irregular de dados',
        'emarsys' => '1416',
        'email' => 'lgpd@hsfinanceira.com.br',
        'pagina' => '/lgpd/',
        'nomeSocial' => false,
        'texto' => 'Descrição detalhada',
    ],
];

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

$querJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
$formulario = FORMULARIOS[$_POST['formulario'] ?? ''] ?? null;

/* Com o js/formulario.js a resposta é JSON; sem JS (o formulário vai direto
   para cá), uma página simples com o resultado e o caminho de volta. */
function responder(int $status, array $dados = []): never
{
    global $querJson, $formulario;
    http_response_code($status);
    if ($querJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $status === 200] + $dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $voltar = htmlspecialchars($formulario['pagina'] ?? '/', ENT_QUOTES);
    if ($status === 200) {
        $titulo = 'Recebemos o seu envio';
        $texto = '<p>Protocolo <b>' . htmlspecialchars($dados['protocolo'] ?? '', ENT_QUOTES) . '</b>. Guarde este número.</p>';
    } else {
        $titulo = 'Não foi possível enviar';
        $itens = array_map(fn ($m) => '<li>' . htmlspecialchars($m, ENT_QUOTES) . '</li>', $dados['erros'] ?? []);
        $texto = $itens ? '<ul>' . implode('', $itens) . '</ul>' : '<p>' . htmlspecialchars($dados['mensagem'] ?? 'Tente de novo em alguns minutos.', ENT_QUOTES) . '</p>';
    }
    echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>' . $titulo . ' — HS Financeira</title>'
        . '<body style="font:16px/1.6 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem">'
        . '<h1>' . $titulo . '</h1>' . $texto
        . '<p><a href="' . $voltar . '">Voltar para o site</a> · SAC 0800 602 2202</p></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, ['mensagem' => 'Use o formulário da página.']);
}

/* Só aceita envios do próprio site: o navegador manda a origem em todo POST. */
$origem = parse_url($_SERVER['HTTP_ORIGIN'] ?? '');
$hostOrigem = ($origem['host'] ?? '') . (isset($origem['port']) ? ':' . $origem['port'] : '');
if ($hostOrigem === '' || strcasecmp($hostOrigem, $_SERVER['HTTP_HOST'] ?? '') !== 0) {
    responder(403, ['mensagem' => 'Envie pelo formulário do site.']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > TAMANHO_MAXIMO) {
    responder(413, ['mensagem' => 'O envio ficou grande demais. Encurte a mensagem.']);
}
if ($formulario === null) {
    responder(422, ['erros' => ['formulario' => 'Escolha o que deseja fazer.']]);
}

/* Robô: preencheu o campo invisível ou enviou rápido demais. Recebe a mesma
   resposta de sucesso, para não aprender a contornar, e nada é repassado. */
$tempo = $_POST['tempo'] ?? '';
if (trim((string) ($_POST['recado'] ?? '')) !== ''
    || (is_string($tempo) && ctype_digit($tempo) && (int) $tempo < TEMPO_MINIMO)) {
    responder(200, ['protocolo' => protocolo()]);
}

function protocolo(): string
{
    $agora = new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
    return $agora->format('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
}

/* ── Conferência dos campos (as mesmas regras do js/formulario.js) ── */

function linha(string $campo): string
{
    $valor = $_POST[$campo] ?? '';
    return is_string($valor) ? trim(preg_replace('/\s+/u', ' ', preg_replace('/[\x00-\x1F\x7F]/u', ' ', $valor) ?? '') ?? '') : '';
}

function soDigitos(string $valor): string
{
    return preg_replace('/\D/', '', $valor) ?? '';
}

function cpfValido(string $cpf): bool
{
    if (!preg_match('/^\d{11}$/', $cpf) || preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }
    for ($t = 9; $t < 11; $t++) {
        $soma = 0;
        for ($i = 0; $i < $t; $i++) {
            $soma += (int) $cpf[$i] * ($t + 1 - $i);
        }
        if ((int) $cpf[$t] !== ($soma * 10) % 11 % 10) {
            return false;
        }
    }
    return true;
}

/* DDD + número, sem o 55 do país (que vem junto se a pessoa digitou +55). */
function telefoneNacional(string $digitos): string
{
    $tamanho = strlen($digitos);
    return ($tamanho === 12 || $tamanho === 13) && str_starts_with($digitos, '55') ? substr($digitos, 2) : $digitos;
}

$erros = [];
$nome = linha('nome');
$sobrenome = linha('sobrenome');
$cpf = soDigitos(linha('cpf'));
$telefone = telefoneNacional(soDigitos(linha('telefone')));
$email = linha('email');
$mensagem = is_string($_POST['mensagem'] ?? null)
    ? trim(preg_replace('/[\x00-\x08\x0B-\x1F\x7F]/u', '', str_replace("\r\n", "\n", $_POST['mensagem'])) ?? '')
    : '';
$nomeSocial = $_POST['nome_social'] ?? '';

if (!preg_match('/\p{L}/u', $nome) || mb_strlen($nome) > 60) {
    $erros['nome'] = 'Informe o seu nome (até 60 letras).';
}
if (!preg_match('/\p{L}/u', $sobrenome) || mb_strlen($sobrenome) > 60) {
    $erros['sobrenome'] = 'Informe o seu sobrenome (até 60 letras).';
}
if (!cpfValido($cpf)) {
    $erros['cpf'] = 'Confira o CPF: os números não formam um CPF válido.';
}
if (!preg_match('/^[1-9]{2}(?:[2-8]\d{7}|9\d{8})$/', $telefone)) {
    $erros['telefone'] = 'Informe o telefone com DDD, como (51) 99999-9999.';
}
if (mb_strlen($email) > 255 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $erros['email'] = 'Confira o e-mail, como nome@exemplo.com.br.';
}
if ($mensagem === '' || mb_strlen($mensagem) > 1000) {
    $erros['mensagem'] = $mensagem === '' ? 'Escreva a sua mensagem.' : 'A mensagem passou de 1.000 caracteres.';
}
if ($formulario['nomeSocial'] && !in_array($nomeSocial, ['Sim', 'Não'], true)) {
    $erros['nome_social'] = 'Responda se conquistou o nome social ou mudou de sobrenome.';
}
if ($erros) {
    responder(422, ['erros' => $erros]);
}

/* ── Limite de envios por IP ── */

$pasta = getenv('HS_FORMULARIOS_DIR') ?: dirname(__DIR__, 2) . '/formularios-site';

/* Falhar aqui não pode impedir um pedido da LGPD: sem a pasta, segue sem limite. */
function dentroDoLimite(string $pasta): bool
{
    if (!is_dir($pasta) && !@mkdir($pasta, 0750, true) && !is_dir($pasta)) {
        error_log('formulario.php: não foi possível criar ' . $pasta);
        return true;
    }
    if (!is_file($pasta . '/.htaccess')) {
        @file_put_contents($pasta . '/.htaccess', "Require all denied\n");
    }
    /* Chave aleatória da instalação: sem ela, o hash de um IPv4 se desfaz por tentativa. */
    $chave = @file_get_contents($pasta . '/.chave');
    if ($chave === false || strlen($chave) !== 32) {
        $chave = random_bytes(32);
        @file_put_contents($pasta . '/.chave', $chave, LOCK_EX);
    }
    $arquivo = $pasta . '/limite-' . substr(hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', $chave), 0, 32) . '.txt';
    $agora = time();
    $janelaMaior = max(array_keys(LIMITES));

    $h = @fopen($arquivo, 'c+');
    if ($h === false) {
        error_log('formulario.php: não foi possível abrir ' . $arquivo);
        return true;
    }
    flock($h, LOCK_EX);
    $envios = array_filter(
        array_map('intval', preg_split('/\s+/', stream_get_contents($h) ?: '', -1, PREG_SPLIT_NO_EMPTY)),
        fn ($t) => $t > $agora - $janelaMaior
    );
    foreach (LIMITES as $janela => $maximo) {
        if (count(array_filter($envios, fn ($t) => $t > $agora - $janela)) >= $maximo) {
            flock($h, LOCK_UN);
            fclose($h);
            return false;
        }
    }
    $envios[] = $agora;
    ftruncate($h, 0);
    rewind($h);
    fwrite($h, implode("\n", $envios));
    flock($h, LOCK_UN);
    fclose($h);

    /* De vez em quando, apaga os arquivos de quem não envia há mais de um dia. */
    if (random_int(1, 50) === 1) {
        foreach (glob($pasta . '/limite-*.txt') ?: [] as $velho) {
            if (filemtime($velho) < $agora - $janelaMaior) {
                @unlink($velho);
            }
        }
    }
    return true;
}

if (!dentroDoLimite($pasta)) {
    responder(429, ['mensagem' => 'Recebemos muitos envios deste endereço. Tente de novo mais tarde ou fale com o SAC pelo 0800 602 2202.']);
}

/* ── Repasse ── */

$protocolo = protocolo();
$oficial = in_array(strtolower($_SERVER['HTTP_HOST'] ?? ''), DOMINIOS_OFICIAIS, true);
$emarsysUrl = getenv('HS_FORMULARIOS_EMARSYS_URL') ?: ($oficial ? EMARSYS_URL : '');
$emailPara = getenv('HS_FORMULARIOS_EMAIL_PARA') ?: ($oficial ? $formulario['email'] : '');

/* Os mesmos parâmetros, na mesma ordem, que o script do site atual manda pelo
   iframe: o Emarsys recebe exatamente a chamada que já funciona hoje (GET; os
   formulários do próprio Emarsys também usam GET). Telefone com o 55 na frente. */
function enviarEmarsys(string $url, array $formulario, array $campos): bool
{
    $parametros = [
        'CID' => EMARSYS_CID, 'SID' => '', 'UID' => '', 'f' => $formulario['emarsys'], 'p' => '2', 'a' => 'r',
        'el' => '', 'llid' => '', 'c' => '', 'counted' => '', 'RID' => '', 'mailnow' => '',
        'inp_1' => $campos['nome'],
        'inp_2' => $campos['sobrenome'],
        'inp_12968' => $campos['cpf'],
        'inp_3' => $campos['email'],
        'inp_37' => '55' . $campos['telefone'],
        'inp_13487' => $campos['mensagem'],
    ];
    if ($formulario['nomeSocial']) {
        $parametros['inp_17061'] = $campos['nomeSocial'] === 'Sim' ? 'S' : 'N';
    }
    $endereco = $url . '?' . http_build_query($parametros, '', '&', PHP_QUERY_RFC3986);

    if (function_exists('curl_init')) {
        $c = curl_init($endereco);
        curl_setopt_array($c, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'hsfinanceira.com.br/api/formulario.php',
        ]);
        $ok = curl_exec($c) !== false;
        $status = (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE);
        $erro = curl_error($c);
    } else {
        $contexto = stream_context_create(['http' => [
            'timeout' => 10, 'ignore_errors' => true, 'max_redirects' => 3,
            'user_agent' => 'hsfinanceira.com.br/api/formulario.php',
        ]]);
        $ok = @file_get_contents($endereco, false, $contexto) !== false;
        /* Com redirecionamentos vêm os cabeçalhos de todas as respostas: vale a última. */
        $status = 0;
        foreach (http_get_last_response_headers() ?? [] as $h) {
            if (preg_match('/^HTTP\/\S+ (\d{3})/', $h, $m)) {
                $status = (int) $m[1];
            }
        }
        $erro = $ok ? '' : 'falha na conexão';
    }
    if ($ok && $status >= 200 && $status < 400) {
        return true;
    }
    error_log("formulario.php: Emarsys f={$formulario['emarsys']} respondeu {$status} {$erro}");
    return false;
}

function cabecalho(string $texto): string
{
    return mb_encode_mimeheader($texto, 'UTF-8', 'Q', "\r\n");
}

function enviarEmail(string $para, array $formulario, array $campos, string $protocolo): bool
{
    $remetente = getenv('HS_FORMULARIOS_REMETENTE') ?: REMETENTE;
    $agora = new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
    $cpf = preg_replace('/^(\d{3})(\d{3})(\d{3})(\d{2})$/', '$1.$2.$3-$4', $campos['cpf']);
    $tel = $campos['telefone'];
    $telefone = '(' . substr($tel, 0, 2) . ') ' . substr($tel, 2, -4) . '-' . substr($tel, -4);
    $nomeCompleto = $campos['nome'] . ' ' . $campos['sobrenome'];

    $linhas = [
        $formulario['titulo'] . ' — enviado pelo site',
        '',
        'Protocolo: ' . $protocolo,
        'Data: ' . $agora->format('d/m/Y H:i'),
        '',
        'Nome: ' . $campos['nome'],
        'Sobrenome: ' . $campos['sobrenome'],
    ];
    if ($formulario['nomeSocial']) {
        $linhas[] = 'Conquistou o nome social ou mudou de sobrenome: ' . $campos['nomeSocial'];
    }
    array_push($linhas,
        'CPF: ' . $cpf,
        'Telefone: ' . $telefone,
        'E-mail: ' . $campos['email'],
        '',
        $formulario['texto'] . ':',
        $campos['mensagem'],
        '',
        '—',
        'Página: https://hsfinanceira.com.br' . $formulario['pagina'],
        'Para responder, use "Responder": o e-mail vai para ' . $campos['email'] . '.',
    );
    $corpo = str_replace("\n", "\r\n", implode("\n", $linhas));

    $cabecalhos = implode("\r\n", [
        'From: ' . cabecalho('HS Financeira (site)') . ' <' . $remetente . '>',
        'Reply-To: ' . $campos['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: hsfinanceira.com.br/api/formulario.php',
    ]);
    $assunto = cabecalho('[Site] ' . $formulario['titulo'] . ' — ' . $nomeCompleto . ' (' . $protocolo . ')');

    if (@mail($para, $assunto, $corpo, $cabecalhos, '-f' . $remetente)) {
        return true;
    }
    error_log("formulario.php: e-mail para {$para} não saiu (protocolo {$protocolo})");
    return false;
}

$campos = [
    'nome' => $nome, 'sobrenome' => $sobrenome, 'cpf' => $cpf, 'telefone' => $telefone,
    'email' => $email, 'mensagem' => $mensagem, 'nomeSocial' => $nomeSocial,
];

if ($emarsysUrl === '' && $emailPara === '') {
    error_log("formulario.php: teste fora do domínio oficial, nada repassado ({$_POST['formulario']}, protocolo {$protocolo})");
    responder(200, ['protocolo' => $protocolo]);
}

$foiEmarsys = $emarsysUrl !== '' && enviarEmarsys($emarsysUrl, $formulario, $campos);
$foiEmail = $emailPara !== '' && enviarEmail($emailPara, $formulario, $campos, $protocolo);

if (!$foiEmarsys && !$foiEmail) {
    responder(502, ['mensagem' => 'Não conseguimos registrar o seu envio agora. Escreva para '
        . $formulario['email'] . ' ou ligue para o SAC, 0800 602 2202.']);
}

responder(200, ['protocolo' => $protocolo]);
