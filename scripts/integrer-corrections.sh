#!/usr/bin/env bash
# Run from the original Antigravity project terminal.
set -euo pipefail
source_dir="$(cd "$(dirname "$0")/.." && pwd)"
target_dir="$(cd "${1:-.}" && pwd)"
if [ "$source_dir" = "$target_dir" ]; then
  echo 'Ce dossier contient déjà les corrections. Relancez ce script depuis le terminal de votre ANCIEN projet.'
  exit 1
fi
if [ ! -f "$target_dir/package.json" ] || [ ! -d "$target_dir/app" ]; then
  echo 'Arrêt : le dossier cible ne ressemble pas à votre projet Next.js. Aucun fichier modifié.'
  exit 1
fi
if [ ! -d "$target_dir/.git" ] && [ ! -f "$target_dir/.git" ]; then
  echo 'Arrêt : aucun historique Git trouvé. Vérifiez que vous avez choisi votre projet original.'
  exit 1
fi
backup_path="$(dirname "$target_dir")/scentia-avant-corrections-$(date +%Y%m%d-%H%M%S).zip"
(cd "$target_dir" && zip -qr "$backup_path" . -x 'node_modules/*' '.next/*' '.git/*' '.env*' '*/.env*')
# No --delete: Git history, dependencies and private configuration are preserved.
rsync -a --exclude '/.git/' --exclude '/node_modules/' --exclude '/.next/' --exclude '/.env.local' --exclude '/.env' --exclude '/*.tsbuildinfo' "$source_dir/" "$target_dir/"
# Next.js 16 must not keep both conventions. The original file is in the backup.
if [ -f "$target_dir/proxy.ts" ] && [ -f "$target_dir/middleware.ts" ]; then rm "$target_dir/middleware.ts"; fi
node - "$target_dir" <<'JS'
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2],file=path.join(dir,'.env.local');
let text=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
for(const line of fs.readFileSync(path.join(dir,'.env.example'),'utf8').trim().split('\n')){
 const key=line.split('=')[0];if(!/^NEXT_PUBLIC_SUPABASE_(URL|PUBLISHABLE_KEY)$/.test(key))continue;
 const re=new RegExp('^'+key+'=.*$','m');text=re.test(text)?text.replace(re,line):text.trimEnd()+'\n'+line+'\n';
}
fs.writeFileSync(file,text.trimStart());
JS
printf '\nCorrections intégrées. Historique Git conservé.\nSauvegarde : %s\n\n' "$backup_path"
printf 'À lancer ensuite :\npnpm install --frozen-lockfile\npnpm dev\n\nPuis git status pour vérifier vos modifications. Aucun commit ni push effectué automatiquement.\n'
