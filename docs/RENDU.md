# Préparation du rendu — lundi 26 octobre 2026 avant 23 h 59, heure de Paris

## À fournir

- URL Vercel finale, testée dans une fenêtre privée.
- Lien GitHub avec l’historique réel des contributions de chaque membre.
- Identifiants du compte admin dédié, transmis au correcteur de façon privée.
- README, schéma SQL, tests et document SKILLS.md présents dans le dépôt.
- Une capture du tableau de bord avec des commandes de démonstration réellement enregistrées, si demandée.

## Démonstration en 5 minutes

1. Mobile : catalogue, filtre par famille, fiche et format.
2. Créer un compte, confirmer l’e-mail si requis, se connecter.
3. Ajouter deux fois un parfum, changer sa quantité et sa gravure. Recharger : la base retrouve le panier.
4. Faire le diagnostic connecté ; vérifier son résultat dans l’espace personnel.
5. Confirmer une commande démo ; montrer son numéro et l’historique.
6. Ouvrir /admin avec le compte client : accès réservé. Se connecter avec le compte admin : vrais KPIs, volume démo distinct du CA.
7. Ajuster un stock, recharger, vérifier sa persistance.
8. Montrer le skill et les modifications qu’il a guidées.

## Collaboration

Exemple de répartition pour le travail restant :

- Membre 1 : configuration Vercel et callback e-mail ; vérification du parcours client et correction des problèmes constatés.
- Membre 2 : compte administrateur, essais des stocks et KPIs ; accessibilité et revue mobile.
- Ensemble : revue du schéma, documentation et démonstration orale.

Chaque tâche doit produire de vraies modifications ou preuves et des commits à mesure du travail. Ne pas antidater, inventer d’auteur ni transformer artificiellement un même changement en contributions fictives.

## Modèle de données

- auth.users → profiles (1:1).
- products → product_variants (1:N, prix et stock par format).
- auth.users → cart_items (1:N, clé unique produit + format + gravure + client).
- auth.users → favorites et quiz_results (1:N).
- auth.users → orders → order_items (1:N:N).
- order_items conserve le nom, le prix et le format au moment de la commande.
- reviews est réservée à une évolution ; aucune publication d’avis n’est annoncée.

## Points à expliquer

Le navigateur n’a aucun droit d’écrire un total ou de se promouvoir admin.
La commande est créée dans une transaction ; si une ligne manque de stock, aucune ligne n’est débitée.
La clé d’idempotence empêche un double clic ou une relance réseau de créer deux commandes.
Le chiffre d’affaires encaissé exclut toutes les commandes pédagogiques.

## À terminer avant remise

- Création et test du compte administrateur dédié.
- Import des sources dans le dépôt en conservant l’historique local existant.
- Déploiement Vercel et ajout des deux variables publiques.
- Configuration des URL Auth Supabase et test d’inscription par e-mail réel.
- Vérification visuelle du parcours complet sur mobile et ordinateur : pas encore réalisée dans cette intervention.

## Validation réalisée pendant l’intervention

- TypeScript : sans erreur.
- ESLint : sans erreur ni avertissement.
- Compilation Next.js de production : réussie.
- Suites HTTP et catalogue : 10 tests réussis, dont les 20 fiches produit et les refus d’accès anonymes.
- Suite SQL transactionnelle : rôle non falsifiable, isolation clients, prix serveur, stock, idempotence, rollback et KPIs validés ; données de test annulées.
- Analyse de sécurité Supabase : aucune alerte à la dernière exécution.
- Restent non validés : parcours connecté dans un navigateur réel, e-mails de confirmation, responsive visuel et déploiement Vercel.
