# GitHub : des modifications réelles, un historique conservé

Le dossier reçu ne contenait pas `.git`. La correction livrée ne prétend pas reconstituer votre historique antérieur.

## 1. Intégrer dans l’ancien projet

Utiliser `scripts/integrer-corrections.sh` depuis le projet original. Le script sauvegarde le code et préserve `.git`.

## 2. Relire les changements

```bash
git status
git diff --stat
git diff
```

Vérifier que les fichiers d’environnement privés ne sont pas suivis :

```bash
git ls-files '.env*'
```

Seul `.env.example` est prévu pour être suivi : il contient l’URL et la clé publishable publiques, aucun secret administrateur.

## 3. Enregistrer cette vraie étape

Après revue et vérification locale :

```bash
git add app components data lib public supabase types docs scripts tests package.json pnpm-lock.yaml skills-lock.json AGENTS.md README.md next.config.ts .gitignore .env.example proxy.ts
# Le chemin .agents doit également être suivi :
git add .agents
# Enregistrer la suppression de l’ancien middleware si Git la signale :
git add -u
git diff --cached --stat
git commit -m "feat: integrate original Scentia design with secure Supabase commerce"
```

Ces commandes préparent les changements : ne les exécuter qu’après avoir vérifié le contenu. Elles ne fabriquent aucun auteur, date ou travail d’équipe.

## 4. Relier GitHub

Créer un dépôt VIDE (sans README ajouté par GitHub). Copier son URL exacte. Vérifier d’abord :

```bash
git remote -v
git branch --show-current
```

Si aucun remote `origin` n’existe : `git remote add origin URL_DU_DEPOT`.
Si `origin` existe déjà, garder son URL si c’est le bon dépôt ; ne pas le remplacer sans vérifier.
Pousser la branche affichée : `git push -u origin NOM_DE_LA_BRANCHE`.
Ne pas utiliser de force-push.

## 5. Travail restant en binôme

Chaque membre doit réellement effectuer des améliorations et les committer avec sa propre identité : tester l’inscription et corriger un problème constaté, améliorer un écran mobile, finaliser le déploiement ou documenter le schéma. Ne pas se partager fictivement des changements déjà produits.

L’examen vérifie le travail et la régularité des commits, pas seulement le nombre de commits. Aucun script ne peut remplacer cette implication réelle.
