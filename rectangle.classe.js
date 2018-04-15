// Structure de stockage et de gestion des données d'un rectangle
// Le constructeur prend en paramètre :
//  - noeudParent : le noeud DOM qui contient le rectangle
//  - classeCSS : la classe CSS qui sera appliquée au rectangle
function Rectangle(noeudParent, classeCSS) {
	// **********************
	// Propriétés privées
	// **********************
	var _x, // abscisse de la position du coin supérieur gauche du rectangle
		_y, // ordonnée de la position du coin supérieur gauche du rectangle
		_elementHTML ; // élément HTML représentant le rectangle


	// **********************
	// Méthodes privées
	// **********************
	// Gestion des paramètres du constructeur :
	// teste les types des paramètres :
	//   noeudParent : doit être un élément du HTML
	//   classeCSS : doit être une chaine de caractères
	// et jette une exception en cas d'erreur
	var gestionParametre = function() {
		if(typeof noeudParent != "object" || noeudParent.nodeType != 1)
			throw "Invalid argument Exception : noeudParent";
		if(typeof classeCSS != "string")
			throw "Invalid argument Exception : classeCSS";
	}

	// Créer l'élément HTML représentant le rectangle
	var creerElementHTML = function() {
		// On crée l'élément HTML (div) représentant le rectangle comme fils de noeudParent
		_elementHTML = document.createElement("div");
		noeudParent.appendChild(_elementHTML);
		// On affecte la classe CSS à l'élément HTML représentant le rectangle
		_elementHTML.className = classeCSS;
		// On initialise la taille de la police à 1px pour IE (au cas ou la hauteur soit inférieur à la taille de la police)
		_elementHTML.style.fontSize="1px";
		_elementHTML.style.position="relative";
		// On initialise _x et _y à 0
		_x = 0;
		_y = 0;
	}


	// **********************
	// Méthodes publiques
	// **********************
	// Déplace le rectangle selon le vecteur v
	// le paramètre v est un objet comportant deux propriétés : x et y
	this.deplace = function(v) {
		// Translation en x
		_x += v.x;
		// Translation en y
		_y += v.y;
		// Initialise la position de l'élément HTML représentant le rectangle
		_elementHTML.style.left=_x+"px";
		_elementHTML.style.top=_y+"px";
	}

	// Positionne le rectangle selon le point p
	// le paramètre p est un objet comportant deux propriétés : x et y
	this.positionne = function(p) {
		// Positionnement en x du rectangle
		_x = p.x;
		// Positionnement en y du rectangle
		_y = p.y
		// Initialise la position CSS de l'élément HTML représentant le rectangle (gauche et haut)
		_elementHTML.style.left=_x+"px";
		_elementHTML.style.top=_y+"px";
	}

	// Accesseur en lecture à la position du coin supérieur gauche du rectangle
	// retourne un objet avec deux propriétés : x et y
	this.position = function() {
		// La position du rectangle (_x et _y) de l'élément HTML,
		return {"x" : _x, "y" : _y};
	}

	// Accesseur en lecture à la dimension de la balle
	// retourne un objet contenant deux propriétés :
	//   l : la largeur
	//   h : la hauteur
	this.dimension = function() {
		// On retourne un objet contenant la largeur et la hauteur
		return elementLargeurHauteur(_elementHTML);
	}

	// Accesseur à l'élément HTML représentant le rectangle
	this.elementHTML = function() {
		return _elementHTML;
	}

	// Change le noeud parent de l'élément HTML représentant le rectangle
	this.changeNoeudParent = function(nouveauNeudParent) {
		// On retire l'élément HTML de son père et on l'insère dans son nouveau père
		_elementHTML.parentNode.removeChild(_elementHTML);
		nouveauNeudParent.appendChild(_elementHTML);
		// On actualise le père noeudParent avec le nouveau père
		noeudParent = nouveauNeudParent;
	}


	// **********************
	// Corps du constructeur
	// **********************
	// Gestion des paramètres
	gestionParametre(noeudParent, classeCSS);
	// Création et initialisation de l'élément HTML
	creerElementHTML();
}