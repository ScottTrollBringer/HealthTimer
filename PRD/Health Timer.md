# Objectif
- Application pour me rappeler fréquemment les bons gestes santé à effectuer lorsque je travaille sur ordinateur.
- Nom du projet : Health timer.
- Application pour mon usage personnel, je ne compte pas la mettre sur le Playstore ni sur l'App store.
- Application mono utilisateur : pas de gestion de comptes ni de profils.
- Pas de besoin d'historisation de données ni de reporting.
- Aucune données à caractère personnel.

# Stack technique
- Le choix du langage, du framework et des bibliothèques est laissé à l'appréciation de l'IA qui développera ce projet. Critères de sélection par ordre de priorité : (1) compatibilité macOS et Windows 11 sans émulation, (2) composants 100% open source et gratuits, (3) stack avec laquelle l'IA est la plus efficace pour produire du code maintenable.

# Charge graphique
- Utiliser un thème sombre.
- Sur un écran en résolution 1080p, doit faire environ 20% de la largeur de l'écran, et 20% de la hauteur.
- Il faut réserver de la place pour une fonctionnalité future, qu'il ne faut pas développer pour le moment, qui servira à afficher mon rythme cardiaque, avec un bouton ON/OFF qui servira à activer ou désactiver cette fonctionnalité lorsqu'elle sera implémentée. Cette zone doit être visible, mais grisée pour l'utilisateur, avec la mention WIP à la place de l'affichage du rythme cardiaque.

# Fonctionnalités
- Afficher un timer à côté d'un pictogramme désignant l'hydratation, les étirements et la respiration. Ce timer démarre à la valeur 59 minutes et 59 secondes par défaut.
- Afficher un timer à côté d'un pictogramme désignant une pause longue. Ce timer démarre à la valeur 1 heure 59 minutes et 59 secondes par défaut.
- Afficher un timer à côté du pictogramme d'un œil, pour me rappeler de me reposer les yeux. Ce timer démarre à la valeur 19 minutes et 59 secondes par défaut.
- Afficher un timer à côté du pictogramme d'une personne assise, pour me rappeler de m'asseoir. Ce timer démarre à la valeur 29 minutes et 59 secondes par défaut.

# Expérience utilisateur
- Pour démarrer les timers et faire en sorte qu'ils commencent à décrémenter le temps, il y a un bouton "lancer" à côté de chaque timer.
- Une fois qu'ils ont été démarré, les timers décrémentent progressivement, seconde après seconde, jusqu'à atteindre 0 secondes. En arrivant à 0, le pictogramme associé au timer doit clignoter de manière très visible. Le clignotement persiste jusqu'à ce que l'utilisateur appuie sur le pictogramme pour l'arrêter, ce qui remet le timer à sa valeur initiale et arrêté.
- Il y a également des boutons permettant de mettre en pause chaque timer individuellement, ainsi que des boutons permettant de les réinitialiser.
- L'application ne doit pas être trop intrusive : il faut un bouton qui permet à l'appli de rester au premier plan, mais cette fonctionnalité doit être désactivable en 1 clic. L'état choisi ne doit pas être persisté entre 2 utilisations de l'appli.
- Pas de notification système. Si l'appli n'est pas au premier plan et qu'elle est cachée par une autre fenêtre, alors l'utilisateur ne voit pas les clignotements de fin de timer.
- Si l'utilisateur ferme l'application avec des timers en cours, les timers repartent de zéro, c'est à dire de leur valeur par défaut.
- Tous les timers doivent avoir une valeur par défaut, modifiable individuellement. Il est possible de cliquer sur le timer pour changer sa valeur par défaut, pour une valeur comprise entre 11 heures 59 minutes 59 secondes maximum, et 5 secondes minimum.
- Si l'utilisateur ferme l'application, les valeurs personnalisées qui auraient été configuré lors de l'utilisation précédente ne doivent pas être gardé. Il faut toujours démarrer avec les valeurs par défaut citées précédemment.
- Les timers ne commencent pas à décrémenter lorsque l'application démarre. Il faut que l'utilisateur démarre chaque timer individuellement. L'utilisateur peut choisir d'en démarrer 0, 1 ou plusieurs. 