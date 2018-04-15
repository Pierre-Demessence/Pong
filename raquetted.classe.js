// Spécialisation d'une raquette, par héritage, pour une raquette se trouvant à droite de la zone de jeu.
// Le constructeur prend en paramètre :
//  - un élément HTML (élément DOM) dans lequel sera ajouté la raquette,
function RaquetteD(zoneDeJeu) {
	// **********************
	// Héritage
	// **********************
	// Constructeur de la classe parent, Raquette, avec des touches par défaut et une classe CSS : raquetteD
	Raquette.call(this, zoneDeJeu, {haut:80,bas:76,service:32}, "raquetteD");

	// **********************
	// Méthodes publiques
	// **********************
	// Place la balle dans le repère de la raquette
	// Attention au polymorphisme pour cette fonction
	var parentPrepareService = this.prepareService;
	this.prepareService = function(balle) {
		// On récupère les cimentions de la balle et de la raquette, ainsi que les propriétés du padding et des bords de la raquette
		var raqDim = this.dimension(),
			raqBor = largeurBords(this.elementHTML()),
			raqPad = taillePadding(this.elementHTML());

			balDim = balle.dimension(),
			balBor = largeurBords(balle.elementHTML()),

		// On positionne la balle par rapport à la raquette
		balle.positionne({
			x: -balDim.l-raqBor.g-raqPad.g,
			y: (raqDim.h-balDim.h)/2
		});
		// On l'appelé la méthode prepareService du parent raquette
		parentPrepareService.call(this, balle);
	}


	// **********************
	// Corps du constructeur
	// **********************

	// Récupération des propriétés CSS de l'élément HTML représentant la raquette et son parent (largeur/hauteur, border)
	var rd = elementLargeurHauteur(this.elementHTML()),
		zd = elementLargeurHauteur(zoneDeJeu),
		zb = largeurBords(zoneDeJeu);

	// Positionnement du rectangle à la position appropriée
	this.positionne({
		x: zd.l-rd.l-zb.d*2,
		y: zd.h/2
	});
}

// Fin de l'héritage
heriteProrietesPrototype(RaquetteD, Raquette);