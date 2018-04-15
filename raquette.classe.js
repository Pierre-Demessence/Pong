// Constructeur de raquette, prend en paramètre :
//  - un élément HTML (élément DOM) dans lequel sera ajouté la raquette,
//  - un object qui définie le code des touches (haut, bas et service),
//  - la classe CSS à appliquer à l'élément HTML représentant la raquette
function Raquette(zoneDeJeu, codeTouches, classeCSS) {
	// **********************
	// Héritage
	// **********************
	// Constructeur de la classe parent, Rectangle, avec (0,0) comme position par défaut
	Rectangle.call(this, zoneDeJeu, classeCSS);

	// **********************
	// Propriétés privées
	// **********************
	var _touchesActives = 0, // Un drapeau pour identifier les touches activées, à 0 par défaut
		_balle = null, // Une référence sur la balle, à null par défaut
		_tps, // Dernier temps de jeu
		_acceleration = 100, // Acceleration de la raquette (constante à 100)
		_vitesse = 0, // La vitesse de la raquette
		_vitesseMax = 500, // La vitesse maximum de la raquette
		_coefFriction = .85, // Le coefficient de friction
		TOUCHES = { HAUT : 1, BAS : 2}, // Constante stockant les valeures pour les touches actives
		_IA = false,
		_offset = 0;


	// **********************
	// Fonctions privées
	// **********************
	// référence sur l'instance courante pour les fermeture
	var _this = this;

	var isServiceReady = function() {
		return _balle && _balle.elementHTML().style.position=="relative" && _balle.elementHTML().parentNode == _this.elementHTML();
	}
	// Sert la balle si le service a été préparé
	var service = function() {
		// Si la raquette tient une balle pour le service
		if(isServiceReady()) {

			// On positionne la balle dans le repère du jeu, en lui ajoutant les coordonnées de la raquette dans le repère local du parent (la zone de jeu)
			_balle.positionne({
				x:_balle.position().x,
				y:_balle.position().y+_this.position().y
			});
			// On change le noeud parent (le repère local : la raquette pour le repère global : la zone de jeu)
			_balle.changeNoeudParent(zoneDeJeu);
			// Réinitialise la position de la balle dans le repère absolue
			if(_balle.position().x < 0)
				_balle.positionne({
					x: elementLargeurHauteur(zoneDeJeu).l+_balle.position().x-_this.dimension().l,
					y: _balle.position().y
				});
			
			// On calcule le vecteur vitesse de la balle, à l'aide de l'orientation de la raquette et du deplacement de la raquette
			// Attention, dans le cas ou la raquette ne se déplace pas, il faut choisir une orientation au choix
			// Pour exemple si la raquette gauche se déplace vers le haut, le vecteur vitesse est : {x:VITESSE,y:-VITESSE}
			// On initialise le vecteur vitesse de la balle

			var speed = Math.abs(_vitesse);
			var ySpeed = _vitesse;
			if(speed == 0) {
				speed = rand(10, 15);
				ySpeed = rand(0, 7) * ( Math.floor(Math.random()*2) == 1 ? 1 : -1 );
			} else
				speed = Math.max(10, speed);
			
			if(_this.elementHTML().className == "raquetteG" || _this.elementHTML().className == "raquette")
				var v = {x: speed, y: ySpeed};
			else
				var v = {x: -speed, y: ySpeed};

			_balle.initialiseVitesse(v);
			
			// La raquette libère la balle
			_balle.elementHTML().style.position="absolute";
		}
	}

	// Calcule du déplacement à partir des touches pressées et compte tenue du temps passé depuis le précédent déplacement (en ms)
	var deplacement = function(dt, balleY) {
		var a = (_acceleration * dt) / 1000; // vitesse à ajouter (acceleration courante * dt) / 1000

		if(_IA)// && rand(0, 100) > 42)
			deplacementIA(a, balleY);
		else
			deplacementTouches(a);
		
		// On réduit la vitesse par le coefficient de friction
		_vitesse *= _coefFriction;
		
		// La vitesse est comprise entre -1 et 1
			// On la borne à 0
		if(_vitesse > -1 && _vitesse < 1)
			_vitesse = 0;
		// Sinon, si la vitesse est supérieur à _vitesseMax
			// On la borne à _vitesseMax
		// Sinon, si la vitesse est inférieur à -_vitesseMax
			// On la borne à -_vitesseMax
		_vitesse = Math.max(Math.min(_vitesse, _vitesseMax), -_vitesseMax);

		// on retourne la vitesse
		return _vitesse;
	}

	var deplacementTouches = function(a) {
		// Si la touche haut est enfoncée
		if(_touchesActives & TOUCHES.HAUT)
			// On soustrait la vitesse à ajouter
			_vitesse -= a;
			
		// Si la touche bas est enfoncée
		if(_touchesActives & TOUCHES.BAS)
			// On ajoute la vitesse à ajouter
			_vitesse += a;
	}

	// Calcule du déplacement à partir des touches pressées et compte tenue du temps passé depuis le précédent déplacement (en ms)
	var deplacementIA = function(a, balleY) {
		_vitesse = balleY-_this.position().y-_this.dimension().h/2;
		
		if(_tps % 100 == 0) {
			console.log("to")
			_offset = rand(_this.dimension().h/2*0.15, _this.dimension().h/2*0.95);
			_offset *= ( Math.floor(Math.random()*2) == 1 ? 1 : -1 );
		}

		_vitesse += _offset;
	}

	// Gestion des paramètres du constructeur :
	// teste le type du paramètre zoneDeJeu,
	// teste si codeTouches définit bien des codes pour les touches (haut, bas et service),
	// et teste si le type de classeCSS est une chaîne de caractères.
	// Une exception est générée dés qu'un test échoue.
	var gestionParametres = function() {
		// Vérification du type de l'élément identifié par zoneDeJeu
		// Teste si codeTouches est bien un objet et s'il définit bien des codes pour les touches
		// Teste si le type de classeCSS est différent d'une chaîne de caractères
		if(typeof zoneDeJeu != "object"
		|| zoneDeJeu.nodeType != 1
		|| typeof classeCSS != "string"
		|| typeof codeTouches != "object")
				throw "Invalid argument Exception";
	}

	// Gestion des touches du clavier (touche enfoncées)
	var touchesPressees = function(e) {
		// Si e n'est pas passé en paramétre, l'initialiser avec window.event (IE)
		if(e==undefined) e = window.event;
		
		// Tester la propriété keyCode pour sauver les touches actives
		if(e.keyCode == codeTouches.haut)
			_touchesActives |= TOUCHES.HAUT;
		if(e.keyCode == codeTouches.bas)
			_touchesActives |= TOUCHES.BAS;
		// console.log(_touchesActives);
	}

	// Gestion des touches du clavier (touche enfoncées)
	var touchesLachees = function(e) {
		// Si e n'est pas passé en paramétre, l'initialiser avec window.event (IE)
		if(e==undefined) e = window.event;
		
		// Tester la propriété keyCode pour mettre à jour les touches actives
		if(e.keyCode == codeTouches.haut)
			_touchesActives &= ~TOUCHES.HAUT;
		if(e.keyCode == codeTouches.bas)
			_touchesActives &= ~TOUCHES.BAS;
		
		// console.log(_touchesActives);
		// ou gerer le service
		if(e.keyCode == codeTouches.service)
			service.call(this);
	}


	// **********************
	// Méthodes publiques
	// **********************
	// Fonction de configuration des touches de gestions de la raquette
	//  touches doit définir trois propriétés :
	//   - haut : le code de la touche haut
	//   - bas : le code de la touche bas
	//   - service : le code de la touche de service
	this.configureTouches = function(touches) {
		codeTouches = touches;
	}

	// Redéfinition de la fonction déplace
	// Teste si la raquette ne sort pas de la zone de jeu,
	// définie par le coin supérieur gauche (min) et
	// le coin inférieur droit (max)
	// min et max sont deux objets définissant deux propriétés :
	//  - x abscisse du point
	//  - y ordonnée du point
	this.testeEtDeplace = function(min, max, balleY) {
		if(isServiceReady() && _IA) {
			window.setTimeout(service, 1000);
			return;
		}
		var nt = new Date().getTime(), // On récupére le temps courant (en ms)
			d = deplacement(nt - _tps, balleY), // Calcule le déplacement de la raquette pour le temps qu'il c'est écoulé depuis le dérnier déplacement (_tps)
			p = this.position(), // on récupère la position du rectangle
			t = this.dimension(), // on récupère la dimension du rectangle
			maxy = max.y - t.h; // on calcule le max en y des déplacements (max.y - la taille de la raquette)
		
		// si la position de la raquette après déplacement est à l'extérieur des bornes, on positionne le rectangle contre les bords, sinon on le déplace
		p.y += d;
		p.y = Math.max(Math.min(p.y, maxy), min.y);
		
		this.positionne(p);
		// On sauvegarde le temps du dernier déplacement
		_tps = nt;
	}

	// Place la balle dans le repère de la raquette
	this.prepareService = function(balle) {
		// Mémorise une référence sur la balle
		_balle = balle;
		// Initialise la vitesse de la balle à 0
		_balle.initialiseVitesse({x:0, y:0});
		// Change l'élément HTML contenant la balle
		_balle.changeNoeudParent(this.elementHTML());
		// Position la balle dans le repère local de l'élément HTML parent
		_balle.elementHTML().style.position="relative";
	}

	this.setIA = function(b) {
		_IA = b;
	}

	this.setVitesseMax = function(vm) {
		_vitesseMax = vm;
	}


	// **********************
	// Corps du constructeur
	// **********************
	// Gestion des paramètres
	gestionParametres();
	// Création des écouteurs d'événements sur les touches du clavier (touches pressées et touches lâchées)
	ajouteEcouteur(window, "keydown", touchesPressees);
	ajouteEcouteur(window, "keyup", touchesLachees);
	// Positionnement CSS de l'élément HTML représentant la raquette en absolute
	this.elementHTML().style.position="absolute";
}
heriteProrietesPrototype(Raquette, Rectangle);
// Fin de l'héritage
