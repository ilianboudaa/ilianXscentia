# Skills : installation et application effective

## Skill officiel installé dans le projet

Source : https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
Nom : `vercel-react-best-practices`, Vercel Engineering, licence MIT.
Installé avec le CLI Skills, sélection de l’agent Antigravity et copie locale.
Le contenu source figure dans `.agents/skills/vercel-react-best-practices/` ; le fichier `skills-lock.json` conserve sa provenance et son empreinte.
Si votre édition d’Antigravity ne découvre pas automatiquement ce chemin, mentionnez explicitement ce SKILL.md dans la conversation de l’agent ; son application ne dépend pas d’une supposée activation automatique.

## Changements guidés et vérifiables

| Règle                         | Fichiers concernés                                      | Application concrète                                                                                                                          |
| ----------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| bundle-dynamic-imports        | components/layout/GlobalOverlays.tsx, app/layout.tsx    | Les fenêtres compte, panier, recherche et aperçu sont chargées à l’ouverture via next/dynamic. Leur hôte global remplace les copies par page. |
| server-cache-react            | lib/catalog.ts                                          | React.cache déduplique la lecture du même parfum entre les métadonnées et la page dans une seule requête, sans cache global des sessions.     |
| async-parallel                | app/compte/page.tsx, app/admin/page.tsx                 | Les requêtes indépendantes sont exécutées avec Promise.all après vérification de l’identité.                                                  |
| server-auth-actions           | app/api/admin/stock/route.ts, app/api/commande/route.ts | L’identité est vérifiée dans les routes serveur ; les droits admin sont relus et la base applique encore la RLS.                              |
| client-passive-event-listeners | components/home/ScrollToTop.tsx                         | L'écouteur de l'événement scroll utilise `{ passive: true }` pour ne jamais bloquer le fil d'exécution du défilement du navigateur.          |
| rerender-derived-state        | components/home/ScrollToTop.tsx                         | Abonnement à un booléen dérivé (`isVisible`) plutôt qu'à la valeur brute du scroll en pixels, évitant les re-rendus continus.                  |
| rendering-conditional-render  | components/home/ScrollToTop.tsx                         | Rendu conditionnel avec opérateur ternaire explicite pour éviter tout affichage indésirable et préserver l'accessibilité au clavier.           |

Le skill Supabase connecté a également servi pendant l’intervention : documentation SSR et RLS consultée, rôles non modifiables par le client, fonctions privilégiées isolées dans un schéma privé, prix autoritaires et tests de permissions. Ce skill connecté n’est pas prétendu installé dans Antigravity.

## Preuves pour l’oral

1. Ouvrir le SKILL.md officiel et sa règle bundle-dynamic-imports.
2. Montrer le fichier GlobalOverlays.tsx correspondant.
3. Montrer les requêtes parallèles de l’espace compte.
4. Exécuter build, lint et les tests.
5. Expliquer pourquoi une skill est une instruction de travail pour l’agent, et le diagnostic olfactif une fonctionnalité du site : ce sont deux choses différentes.

Aucune amélioration de performance chiffrée n’est annoncée sans mesure avant/après.
