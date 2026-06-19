# PRD Quality Review — Health Timer

## Overall verdict
Pour un outil personnel/hobby, ce PRD est honnête, direct et couvre bien son périmètre. Les non-objectifs sont explicites, les décisions clés sont posées. Il a deux faiblesses majeures : (1) une ambiguïté sur le regroupement du premier timer (hydratation + étirements + respiration = 1 timer ou 3 ?) qui pourrait provoquer une implémentation incorrecte ; (2) des descriptions comportementales qui s'appuient sur des adjectifs ("très visible", "trop intrusive") plutôt que sur des conditions testables, rendant la *done-ness* floue. Ces deux points doivent être résolus avant de passer à l'implémentation.

---

## Decision-readiness — strong

Toutes les décisions de périmètre produit sont posées explicitement : pas de distribution externe, pas de comptes utilisateurs, pas de persistance inter-sessions, pas de notifications système. La délégation du choix de stack à l'IA est une décision assumée avec des critères de sélection classés par priorité — ce n'est pas une omission. La fonctionnalité future rythme cardiaque est correctement bornée comme WIP-only avec un comportement placeholder spécifié.

### Findings
- **medium** Ambiguïté sur le regroupement du premier timer (§ Fonctionnalités) — "un timer à côté d'un pictogramme désignant l'hydratation, les étirements et la respiration" : est-ce 1 timer couvrant 3 rappels différents, ou 3 timers séparés ? Si c'est 1 timer unique, il faut le confirmer explicitement car c'est un choix de conception non évident. *Fix :* Préciser "1 timer combiné pour les 3 gestes (hydratation, étirements, respiration)" ou "3 timers distincts, un par geste".

---

## Substance over theater — strong

Aucune persona theater (outil solo, pas de personas nécessaires). Pas de NFR boilerplate — les NFRs sont produit-spécifiques (cross-platform sans émulation, open source, contrainte de taille d'écran). Pas de section "Innovation" ou "Différentiation" — correct pour un outil personnel. Le document est dense et honnête.

---

## Strategic coherence — adequate

La thèse est claire : un petit rappeleur santé desktop non-intrusif couvrant 4 catégories de gestes. Les fonctionnalités découlent logiquement du problème. Pas de métriques de succès — approprié pour un outil personnel sans parties prenantes externes.

---

## Done-ness clarity — thin

Les valeurs par défaut, le cycle d'état des timers (démarré / en pause / arrêté / réinitialisé) et les règles de non-persistance sont bien spécifiés. Mais plusieurs comportements restent définis par des adjectifs.

### Findings
- **high** "Clignoter de manière très visible" (§ Expérience utilisateur) — "très visible" n'est pas une condition testable. Un développeur doit interpréter. *Fix :* Définir le clignotement concrètement, ex. "le pictogramme alterne entre 100% et 0% d'opacité à une fréquence de 2 Hz".
- **medium** Interaction "cliquer sur le timer pour changer sa valeur par défaut" — aucune description de l'UI de cette interaction. Dialog modal ? Champ inline éditable ? Picker ? *Fix :* Décrire l'interaction : "un clic sur la valeur du timer affiche un champ éditable (ou une dialog) permettant de saisir HH:MM:SS dans les bornes autorisées".
- **medium** Zone WIP rythme cardiaque (§ Charge graphique) — "réserver de la place" sans préciser la position dans la layout, les dimensions relatives, ni l'état du bouton ON/OFF dans la version actuelle (grisé ? cliquable mais inactif ?). *Fix :* Préciser la position (ex. : bande inférieure, panneau latéral droit), et clarifier si le bouton ON/OFF est désactivé/grisé ou simplement sans effet.

---

## Scope honesty — strong

Les non-objectifs sont explicites et précis : pas d'App Store, pas de comptes, pas d'historique, pas de données personnelles, pas de notifications système, pas de persistance des timers ni des valeurs personnalisées entre sessions. La WIP section borne correctement une fonctionnalité future. Adéquat pour les enjeux de ce projet.

---

## Downstream usability — adequate

Pas d'IDs FR, pas de glossaire, pas de références croisées — mais pour un projet solo allant directement vers l'implémentation IA, c'est acceptable. Le document est assez plat pour être lu de bout en bout sans perdre le contexte.

### Findings
- **low** Pas d'identifiants FR stables — rend plus difficile de référencer des exigences spécifiques lors de la revue de code ou de la création de stories. *Fix :* Ajouter des labels FR-01 à FR-N pour chaque comportement.

---

## Shape fit — strong

Outil hobby/solo, opérateur unique, pas de User Journeys nécessaires, faible rigueur formelle appropriée. La forme correspond au produit.

---

## Mechanical notes

- Pas de dérive de glossaire (peu de termes métier, tous cohérents).
- Les hypothèses sont implicites (ex. "mono-utilisateur" implique pas de sync) mais non taguées `[ASSUMPTION]` — acceptable vu les enjeux.
- Pas d'Assumptions Index requis à ce niveau de stakes.
