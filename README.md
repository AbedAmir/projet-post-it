# Bienvenu au Post-it

## Mode d'emploi

- Choisir une position et cliquer deux fois pour créer votre [post-it](https://projet-post-it.glitch.me). Votre [post-it](https://projet-post-it.glitch.me) sera vu par tout le monde.

- Attention après avoir cliqué sur le button vert de sauvegarde, vous ne pouver plus modifier ce [post-it](https://projet-post-it.glitch.me).

- Si vous avez les droits nécessaires pour modifier un post-it, vous pouvez cliquer sur la zone de text et modifier.

- Si vous avez les droits nécessaires pour supprimer un post-it, vous pouvez cliquez sur le button rouge du post-it.

- Vous pouvez nous contacter pour les droits de changer et de supprimer votre [post-it](https://projet-post-it.glitch.me).

Amusez-vous et essayez de ne pas publier les mêmes choses que les autres.

### Structure du projet

   *Fichiers statiques :* 

    index.html : Où s'affichent les post-its.
    formInscription.html : Page d'inscription. 
    login.html : Page de login. Par défaut : guest.
    admin.html : Un seul admin compte qui peut modifier les droits des utilisateurs.
    s/Message.js : Format du post-it.
    s/carousel.js : Effet de la page principale.
    s/prototype.js : Format des requêtes AJAX.
    s/style.css : Style de la page principale.
    s/style2.css : Style de la page administration.
    s/carousel.css : Style de l'effet carousel.
    telecharge : README.md
   
   *Routes :* 
    
    Route / : présentant la page principale.  
    Route /signup : permettant de créer un nouvel utilisateur.
    Route /login : permettant de se connecter. 
    Route /logout : permettant de se déconnecter. 
    Route /ajouter : permettant d’ajouter un post-it.
    Route /modifier : permettant de modifier un post-it.
    Route /effacer : permettant d’éliminer un post-it.
    Route /liste : renvoyant la liste des post-its au format JSON, pour un traitement chez le client. 
    Route /user : renvoyant l'utilisateur en courant.
    Route /query : permettant d'indiquer si l'un post-it existe.
    Route /userAll : renvoyant tous utilisateurs.
    Route /:authorname : renvoyant les post-its de certain utilisateur.
    Route /telecharge : permettant de télécharger le fichier README.md.
    Route /up : permettant de contrôler les droits des utilisateurs.
    Route /formInscription : présentant la page d'inscription. 
    Route /adminpage : présentant la page d'administration. 
    Route /flag : permettant aux clients de synchroniser. 

### Message récent

Quelques bogues rencontrés :

Il faut toucher 3 fois en même temps pour créer un post-it sur un système IOS similaire.

Pour synchroniser, la suppression a normalement besoin d'un rafraichissement d'écran.

*24/05/2019*

Mise à jour de base de données [MongoDB](https://cloud.mongodb.com/v2/5cd2a00ccf09a21ee6a45a8a) et [Mongoose](https://mongoosejs.com/docs).

*08/05/2019*

Pour nous rejoindre, merci de laisser votre [post-it](https://projet-post-it.glitch.me) sur tableau *10*.

Nous vous souhaitons une bonne journée !

*06/05/2019* 

---------------------------
### Administration

Allez-vous à la [page d'administration](https://projet-post-it.glitch.me/adminpage). Il y a 4 niveaux possibles, cliquer pour modifier les droits des utilisateurs.

- *Couleur : Droit maximal*
- Vert : Création
- Bleu : Modification
- Jaune : Effacement
- Rouge : Administration
