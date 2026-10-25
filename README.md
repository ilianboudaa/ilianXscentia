# SCENTIA — Boutique de parfumerie

Projet pédagogique Next.js + Supabase, préparé pour un déploiement Vercel.
Les commandes sont des démonstrations, sans paiement ni livraison réels.

## Démarrer sur Mac

Ouvrir ce dossier dans Antigravity. Dans son terminal :

```bash
cp -n .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir http://localhost:3000. Node.js 22 ou 24 est recommandé.
`.env.example` contient uniquement l’URL et la clé **publique publishable** du projet Supabase Scentia déjà connecté. Aucun secret serveur n’est nécessaire.
Ne jamais mettre de clé service_role dans une variable NEXT_PUBLIC_.

**Si vous remplacez les fichiers de votre ancien projet : conservez son dossier `.git` et son historique.** L’archive reçue ne contenait pas cet historique, nous ne l’avons pas reconstruit. Ne supprimez pas votre ancien dossier.

## Fonctionnalités

- Catalogue original de 20 parfums (50 ml) lu dans Supabase, filtres et tri.
- Fiches produit, sélection du format, gravure (24 caractères), favoris.
- Inscription / connexion / déconnexion avec Supabase Auth et session SSR par cookies.
- Confirmation d’adresse par callback PKCE si cette option est activée dans Supabase.
- Panier visiteur local ; panier connecté en base ; modifications sérialisées ; quantités et gravures distinctes.
- Commande transactionnelle : prix relus en base, stock verrouillé et décrémenté, détail figé, panier vidé.
- UUID d’idempotence : une même tentative ne génère pas une seconde commande.
- Profil client, historique des commandes, favoris et résultats de diagnostic.
- Administration autorisée côté serveur et par RLS : KPIs SQL, activité, produits les plus commandés et gestion du stock.
- Distinction explicite entre volume de démonstration et CA encaissé (zéro sans paiement réel).
- Skill officiel Vercel installé et appliqué ; consulter `docs/SKILLS.md`.

## État de la base

Le projet Supabase **Ilian X SCENTIA** a déjà été initialisé pendant cette intervention : 20 parfums actifs du HTML original, politiques RLS et fonctions ; les anciens produits sont archivés.
**Ne pas réexécuter la migration sur ce projet déjà installé.**
Le fichier `supabase/migrations/20261023_init_scentia.sql` est un instantané d’installation pour une NOUVELLE base vide. Les migrations distantes contiennent l’installation, les corrections de validation et la reprise du catalogue original. Ne pas lancer `supabase db push` sans réconcilier l’historique distant.

## Compte administrateur dédié (à terminer)

Aucun compte réel n’a été créé automatiquement et aucun mot de passe par défaut n’existe.

1. Dans Supabase, Authentication → Users → Add user → Create new user.
2. Choisir une adresse dédiée et un mot de passe fort ; confirmer l’adresse avec l’option de création prévue à cet effet.
3. Dans SQL Editor, promouvoir uniquement ce compte avec cette requête, après avoir remplacé l’adresse :

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ADRESSE_ADMIN_A_REMPLACER');
```

Vérifier ensuite :

```sql
select email, role from public.profiles where role = 'admin';
```

Se connecter avec ce compte sur le site, puis ouvrir `/admin`.
Un client ne peut pas modifier son rôle ; le rôle fourni lors de l’inscription est ignoré.
Transmettre les identifiants de démonstration au correcteur par le canal privé demandé, jamais dans GitHub.

## Déploiement Vercel (à terminer)

1. Conserver l’historique Git de votre projet et intégrer les fichiers corrigés.
2. Créer le dépôt GitHub et y pousser les sources, le lockfile et les dossiers de skills.
3. Vercel → Add New Project → Import Git Repository → sélectionner ce dépôt.
4. Framework : Next.js. Racine : dossier contenant `package.json`. Laisser les commandes automatiques.
5. Ajouter les deux variables de `.env.example` dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Déployer et conserver l’URL HTTPS.
7. Dans Supabase Authentication → URL Configuration : mettre cette URL comme Site URL ; ajouter `https://VOTRE-DOMAINE.vercel.app/auth/callback` aux Redirect URLs, ainsi que `http://localhost:3000/auth/callback` pour le développement.
8. Refaire le parcours inscription → confirmation e-mail → connexion → panier → commande → historique → admin sur la version Vercel.

Les réglages d’authentification, le compte administrateur et la publication Vercel nécessitent encore votre intervention dans les comptes concernés. Le site n’est pas déclaré déployé.

## Vérification

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

`pnpm test` démarre temporairement le serveur de production sur le port 3100 puis teste les routes HTTP. Faire `pnpm build` avant.
`tests/database.sql` teste les permissions, les commandes, le stock et l’idempotence sur Supabase dans une transaction entièrement annulée par ROLLBACK. Il ne laisse aucun compte ni commande d’essai.
Ce test doit être exécuté avant de créer des commandes réelles car ses assertions supposent la base de démonstration encore vide de commandes.

Les tests HTTP vérifient les réponses serveur ; ils ne remplacent pas une vérification visuelle ni les clics d’un utilisateur connecté dans un navigateur.

## Limites assumées

- Pas de paiement bancaire : Stripe n’est pas implémenté. Ne pas présenter une commande démo comme payée.
- Aucune newsletter ni envoi marketing n’est activé.
- Les parfums et leurs descriptions sont des éléments de démonstration ; aucun faux avis client n’est affiché sur la nouvelle boutique.
- Les visuels de flacons sont locaux (SVG et CSS), inspirés de votre HTML original. Les polices DM Sans et Playfair Display sont également servies localement.
- Le diagnostic est un algorithme de recommandation basé sur les réponses, sans appel à un modèle IA.
- L’administration gère les stocks ; elle ne gère pas encore les remboursements ni l’expédition.
- Les données de diagnostic sont privées et persistées uniquement pour les clients connectés.

## Équipe et rendu

Voir `docs/RENDU.md` pour la grille de démonstration et les livrables. Chaque membre réalise ses propres contributions, avec son identité Git, sans inventer d’historique.

## Intégration en conservant votre historique Git

Gardez votre ancien dossier. Depuis le terminal de ce projet original, lancez :

```bash
bash /CHEMIN/DU/DOSSIER/DECOMPRESSE/scentia/scripts/integrer-corrections.sh .
```

Remplacez le chemin par celui du fichier téléchargé. Le script fait une sauvegarde du code, conserve `.git`, remplace les fichiers corrigés et fusionne uniquement les variables publiques Supabase. Il n’effectue aucun commit ni push. Il retire l’ancien `middleware.ts` au profit de `proxy.ts`, comme requis par Next.js 16.

Puis : `pnpm install --frozen-lockfile`, `pnpm dev`, et test du site. Pour GitHub, voir `docs/GITHUB.md`.
## Site déployé

https://ilian-xscentia.vercel.app

## Vérifications manuelles — 25 octobre 2026

Tests réalisés sur le site déployé :
- Connexion avec un compte client.
- Conservation du panier après actualisation.
- Création d’une commande de démonstration.
- Consultation de la commande dans l’historique client.
- Accès au tableau de bord avec le compte administrateur.
- Affichage des indicateurs et des dernières commandes.
- Refus d’accès à /admin avec un compte client.

Les commandes sont des démonstrations : aucun paiement réel
n’est encaissé.

## Skill utilisé

Le skill vercel-react-best-practices est installé dans
.agents/skills/. Son utilisation et les améliorations appliquées
sont détaillées dans docs/SKILLS.md.