#!/usr/bin/env bash
# Mantém o projeto sincronizado com https://github.com/fabianokunst/HS-financeira
#   sync-github.sh pull  -> traz as novidades do GitHub (início de sessão)
#   sync-github.sh push  -> commita e envia o que mudou localmente (fim de cada resposta)
# Acionado pelos hooks de .claude/settings.local.json; nunca bloqueia o Claude.
set -u

REMOTE=origin
BRANCH=main
export GIT_TERMINAL_PROMPT=0

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ "$(git symbolic-ref --short -q HEAD)" = "$BRANCH" ] || exit 0

aviso() { printf '{"systemMessage": "GitHub: %s"}\n' "$1"; }

sincroniza_com_remoto() {
  if ! git fetch -q "$REMOTE" "$BRANCH" 2>/dev/null; then
    aviso "não foi possível acessar o repositório remoto"
    return 1
  fi
  if ! git rebase -q --autostash "$REMOTE/$BRANCH" >/dev/null 2>&1; then
    git rebase --abort >/dev/null 2>&1
    aviso "conflito ao integrar alterações do remoto; resolva manualmente"
    return 1
  fi
}

case "${1:-}" in
  pull)
    antes=$(git rev-parse HEAD)
    sincroniza_com_remoto || exit 0
    if [ "$antes" != "$(git rev-parse HEAD)" ]; then
      aviso "projeto atualizado com as novidades de $REMOTE/$BRANCH"
    fi
    ;;
  push)
    git add -A
    if ! git diff --cached --quiet; then
      arquivos=$(git diff --cached --name-only | head -20)
      git commit -q -F - <<EOF
Atualização automática ($(date '+%Y-%m-%d %H:%M'))

$arquivos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
    fi
    # Nada novo em relação ao último estado conhecido do remoto: sai sem usar a rede.
    [ "$(git rev-list --count "$REMOTE/$BRANCH..HEAD" 2>/dev/null || echo 1)" -gt 0 ] || exit 0
    sincroniza_com_remoto || exit 0
    if git push -q "$REMOTE" "$BRANCH" 2>/dev/null; then
      aviso "alterações enviadas para $REMOTE/$BRANCH"
    else
      aviso "falha ao enviar alterações; serão reenviadas no próximo ciclo"
    fi
    ;;
esac
exit 0
