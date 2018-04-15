// Constructeur du jeu pong, prend en paramètre :
//  - un élément HTML (élément DOM ou Id d'un élément DOM) qui sera remplacé par la zone de jeu
//  - et optionnellement, une fonction qui sera appelée à chaque changement de score,
//    avec pour paramètres le score du joueur gauche puis celui du joueur droite
function Pong(noeud, fonctionScore, IA, service) {
	// **********************
	// Propriétés privées
	// **********************
	var _zoneDeJeu, // la zone de jeu
		_raquetteGauche, // la raquette du joueur de gauche
		_raquetteDroite, // la raquette du joueur de droite
		_boucleActive, // la boucle active du jeu
		_balle, // la balle de notre pong
		_score, // le score de la partie, il s'agit d'un objet avec deux propriétés : g et d tenant le score des joueurs respectivement gauche et droite
		_fonctionScore = function() {}, // Fonction appelée à chaque changement de score, doit être initialisé avec une fonction ne faisant rien par défaut
		_IA,
		_raquetteService;

	// **********************
	// Fonctions privées
	// **********************
	// Gestion des paramètres du constructeur :
	// teste le type du paramètre pour transformer le paramètre noeud en une référence sur un élément DOM valide,
	// jette une exception si le paramètre ne référence ou n'identifie pas un élément DOM valide.
	// le deuxième paramètre (optionnel) doit être une fonction s'il est fourni
	var gestionParametre = function() {
		// Vérification du type de l'élément identifié par noeud
		// Si noeud est l'identifiant d'un noeud DOM, le remplacer par le noeud DOM
		if(document.getElementById(noeud) != undefined)
			noeud = document.getElementById(noeud);
		// Sinon, initialise noeud à null si noeud ne référence pas un objet ou alors pas un noeud DOM
		if(typeof noeud != "object" || noeud.nodeType != 1)
			noeud = null;
		// Si le paramètre noeud est null, jeter une exception
		if(noeud == null)
			throw "Invalid argument Exception : noeud";

		// Si le second paramètre est défini
		if(fonctionScore != "undefined") {
			// Si le paramètre options n'est pas une fonction, jeter une exception
			if(typeof fonctionScore != "function")
				throw "Invalid argument Exception : fonctionScore";
			_fonctionScore = fonctionScore;
		}

		_IA = {g: true, d: false, l: 1};
		if(IA == "undefined" || typeof IA != "object")
			throw "Invalid argument Exception : IA";
		_IA = IA;

		if(service == "undefined" || isNaN(service))
			throw "Invalid argument Exception : service";
	}

	// Création de la zone de jeux,
	// on supposera que le paramètre noeud référence un noeud DOM valide.
	var creerZoneDeJeux = function() {
		// Création de la zone de jeu
		_zoneDeJeu = document.createElement('div');
		// Si la zone de jeu n'est pas créée, on jette une exception
		if(_zoneDeJeu == null)
			throw "Error 404 : zone_de_jeu not found";
		// On remplace l'élément DOM noeud par la zone de jeux
		noeud.parentNode.replaceChild(_zoneDeJeu, noeud);
		// On recopie les propriétés CSS de l'élément DOM noeud dans l'élément DOM de la zone de jeu
		for(var i in noeud.style) {
			_zoneDeJeu.style[i] = noeud.style[i];
		}
		// On recopie l'identifiant de l'élément DOM noeud dans l'élément DOM de la zone de jeu
		_zoneDeJeu.id = noeud.id;
		// On calcule la largeur et la hauteur de la zone de jeu en prenant en compte les éventuels bords de l'élément
		// On réactualise les propriété viewportWidth et viewportHeight de la zone de jeu
		_zoneDeJeu.viewportWidth = 
		// Initialise la propriété CSS position à relative pour la gestion des raquettes
		_zoneDeJeu.style.position = "relative";
		
		// Transfère des enfants du noeuf vers la zone de jeu
		var goods = new Array();
		for(var i = 0 ; i < noeud.children.length ; i++) {
			if(noeud.children[i].nodeType == 1 && noeud.children[i].className == "score")
				goods.push(noeud.children[i]);
		}
		for(var i in goods)
			_zoneDeJeu.appendChild(goods[i]);
	}

	// Création des raquettes et de la balle,
	// on supposera que _zoneDeJeu a été créé.
	var creerRaquettesEtBalle = function() {
		// Création de la raquette gauche
		_raquetteGauche = new RaquetteG(_zoneDeJeu);
			if(_IA.g) gestionIA(_raquetteGauche);
		// Création de la raquette droite
		_raquetteDroite = new RaquetteD(_zoneDeJeu);
			if(_IA.d) gestionIA(_raquetteDroite);

		// Création de la balle
		_balle = new Balle(_zoneDeJeu);

		// On choisit aléatoirement la raquette gauche ou droite, pour préparer le service
		service = ( service == -1 ? Math.floor(Math.random()*2) : service );
		_raquetteService = ( service == 1 ? _raquetteGauche : _raquetteDroite );
		_raquetteService.prepareService(_balle);
	}

	// Gestion des touches du clavier (touche enfoncées)
	var boucleDeJeu = function() {
		// Création des points supérieur gauche et inférieur droit de la zone de jeu en tenant compte du padding de la zone de jeu
		var dim = elementLargeurHauteur(_zoneDeJeu);
		var bords = largeurBords(_zoneDeJeu);
		var min = {x: 0, y: 0};
		var max = {x: dim.l-bords.g-bords.d, y: dim.h-bords.h-bords.b};

		var balleY = ( _balle.elementHTML().style.position == "absolute" ? _balle.position().y : _balle.position().y+_raquetteService.position().y );
		// Déplace la raquette gauche
		_raquetteGauche.testeEtDeplace(min, max, balleY);
		// Déplace la raquette droite
		_raquetteDroite.testeEtDeplace(min, max, balleY);
		// Déplace la balle et récupère la nouvelle position p de la balle
		var p = _balle.testeEtDeplace(min, max,[_raquetteGauche,_raquetteDroite]);
		// Si la balle a bougée (si p est défini), on test si un des joueurs a gagné
		if (!!p) {
			// Si la balle sort à gauche
			if (p.x>max.x)
				// C'est droite qui marque
				gagne(_raquetteGauche);
			// Sinon, si on sort à droite
			if (p.x<min.x)
				// C'est gauche qui gagne
				gagne(_raquetteDroite);
		}
	}

	// Gain de l'échange par le joueur qui tient la raquette passée en paramètre
	var gagne = function(raquette) {
		// On stop la boucle de jeu le temps de positionner la balle pour le prochain service
		window.clearInterval(_boucleActive);
		// Selon que raquette est egale à _raquetteGauche ou _raquetteDroite, on augmente le score du joueur ayant gagné l'échange
		( raquette==_raquetteGauche ? _score.g++ : _score.d++ );
		// On appelle la fonction de gestion du score
		_fonctionScore(_score.g, _score.d);
		// Le joueur ayant gagné l'échange se prépare au service
		raquette.prepareService(_balle);
		// On relance la boucle de jeu
		_boucleActive = window.setInterval(boucleDeJeu, 40);
	}

	// Démarre le jeu
	var demarrer = function() {
		// initialise le score
		_score = {g:0, d:0};
		// Lance la boucle de jeu
		_boucleActive = window.setInterval(boucleDeJeu, 40);
	}

	var gestionIA = function(raquette) {
		raquette.setIA(true);
		/* var SPEED = {
			1: 10,
			2: 15,
			3: 20,
		} */
		//raquette.setVitesseMax(SPEED[_IA.l]);
		raquette.setVitesseMax(5 + _IA.l * 5);
	}

	// **********************
	// Corps du constructeur
	// **********************
	// Gestion du paramètre du constructeur
	gestionParametre();
	// Création de la zone de jeu
	creerZoneDeJeux();
	// Création des raquettes et de la balle
	creerRaquettesEtBalle();
	// On lance le jeu
	demarrer();
}