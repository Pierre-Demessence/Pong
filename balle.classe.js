function Balle(zoneDeJeu) {
	// **********************
	// Héritage
	// **********************
	// Constructeur de la classe parent, Rectangle, avec (0,0) comme position par défaut
	Rectangle.call(this, zoneDeJeu, "balle");


	// **********************
	// Propriétés privées
	// **********************
	var _vx = 0, // Abscisse de la vitesse de la balle
		_vy = 0, // Ordonnée de la vitesse de la balle
		_tps ; // Dernier temps de jeu

	// **********************
	// Fonctions privées
	// **********************
	// Gestion des paramètres du constructeur :
	// teste le type du paramètre zoneDeJeu pour être sûr de disposer d'une référence sur un élément DOM valide,
	// jette une exception si le paramètre ne référence pas un élément DOM valide.
	var gestionParametre = function() {
		// Vérification du type de l'élément identifié par zoneDeJeu (doit être un objet et disposé d'une propriété nodeType valant 1)
		if(typeof zoneDeJeu != "object" || zoneDeJeu.nodeType !=1)
			throw "Invalid argument Exception";
	}

	// **********************
	// Méthodes publiques
	// **********************
	// Accesseur en lecture à la vitesse
	// retourne un object avec deux propriétés : x,y
	this.vitesse = function() {
		return {"x" : _vx, "y" : _vy};
	}

	// Accesseur en écriture à la vitesse
	// le paramètre v est un objet avec deux propriétés : x,y
	this.initialiseVitesse = function(v) {
		_vx = v.x;
		_vy = v.y;
	}

	// Redéfinition de la fonction déplace
	// Teste si la balle ne sort pas de la zone de jeu,
	// définie par le coin supérieur gauche (min) et
	// le coin inférieur droit (max)
	// min et max sont deux objets définissant deux propriétés :
	//  - x abscisse du point
	//  - y ordonnée du point
	// rectangles est un tableau contenant les rectangles sur lesquels la balle peut rebondir (la fonction teste la collision de la balle avec chacun d'entre eux)
	// La fonction retourne la nouvelle position de la balle ou undefined si la balle n'a pas bougée.
	this.testeEtDeplace = function(min, max, rectangles) {
		// On récupére le temps courant (en ms)
		var tps = new Date().getTime();
		// On teste si la balle se déplace
		if (_vx!=0 || _vy!=0) {
			var e = tps-_tps, // le nombre de ms entre le temps courant et le temps précédent
				p = this.position(), // position initiale de la balle
				v = this.vitesse(), // vitesse initiale de la balle
				d = this.dimension(), // dimension de la balle
				r = collisionHautBas(p, v, d, min, max), // on initialise r avec le ratio de déplacement jusqu'à la prochaine collision en haut et en bas
				c = {r:r, t:1, v:{x:_vx, y:-_vy}}; // on initialise la collision c à partir de r
				// (si r<1 alors il y a collision avec un bord et une nouvelle vitesse doit être calculée, sinon on conserve la vitesse courante)
				// c est un object contenant trois propriétés le ratio r de déplacement jusqu'à la prochaine collision,
				// t le type de collision (1 par défaut) et v la vitesse après collision
			
			// On parcoure les rectangles à tester
				// on teste la collision avec chacun
				// si la collision est plus proche que c
					// on la sauve dans c
			for(var i in rectangles) {
				var tmp = collisionRectangle(p, v, d, rectangles[i]);
				if(tmp.r < c.r)
					c = tmp;
			}
			
			// Si c (qui tient la collision la plus proche) est une collision (c.r < 1)
				// On déplace la balle jusqu'à la collision
				// Si _vx et c.v.x ne sont pas du même signe
					// on inverse le signe de _vx
				// Si _vy et c.v.y ne sont pas du même signe
					// on inverse le signe de _vy
			// Sinon  on déplace la balle normalement
			// On sauvegarde le temps dans _tps
			// retourne la position de la balle
			if(c.r < 1) {
				p.x += _vx * c.r;
				p.y += _vy * c.r;
				
				/*
				if(_vx * c.v.x <= 0)
					_vx *= -1;
				if(_vy * c.v.y <= 0)
					_vy *= -1;
				*/
				_vx = c.v.x;
				_vy = c.v.y;
			}
			else {
				p.x += _vx;
				p.y += _vy;
			}
			this.positionne(p);
			_tps = tps;
			return p;
		}
		// Si la balle ne se deplace pas, on sauvegarde le temps dans _tps
		_tps = tps;
		
	}


	// **********************
	// Corps du constructeur
	// **********************
	// Gestion des paramètres
	gestionParametre(zoneDeJeu);
}
heriteProrietesPrototype(Balle, Rectangle);
// Fin de l'héritage

// Constante de classe pour la vitesse maximum de la balle
Balle.VITESSE_MAX = 10;
