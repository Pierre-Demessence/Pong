// Retourne un objet contenant 2 propriétés :
// la largeur et la hauteur de l'élément identifié
// par le paramètre noeud
function elementLargeurHauteur(noeud) {
   var res = noeud.getBoundingClientRect() ;
   res = { l: res.right - res.left, h: res.bottom - res.top } ;
   return res ;
}

// Retourne un objet contenant l'épaisseur des bords
// de l'élément identifié par le paramètre noeud
// {h:bord haut, d:bord droit, b:bord bas, g:bord gauche}
function largeurBords(noeud) {
   var res = null, styles, i, v ;
   if (noeud.currentStyle) { // IE
      res = {
         h : noeud.currentStyle.borderTopWidth,
         d : noeud.currentStyle.borderRightWidth,
         b : noeud.currentStyle.borderBottomWidth,
         g : noeud.currentStyle.borderLeftWidth
      } ;
   }
   else // Autres
      if (window.getComputedStyle) { // Other
         styles = window.getComputedStyle(noeud,null) ;
         res = {
            h : styles.getPropertyValue("border-top-width"),
            d : styles.getPropertyValue("border-right-width"),
            b : styles.getPropertyValue("border-bottom-width"),
            g : styles.getPropertyValue("border-left-width")
         } ;
      }
   for (i in res) {
      v = parseInt(res[i],10) ;
      if (isNaN(v)) {
         res[i] = 0 ;
      }
      else {
         res[i] = v ;
      }
   }
   return res ;
}

// Retourne un objet contenant les valeurs de padding
// de l'élément identifié par le paramètre noeud
// {h:padding haut, d:padding droit, b:padding bas, g:padding gauche}
function taillePadding(noeud) {
   var res = null, styles, i, v ;
   if (noeud.currentStyle) { // IE
      res = {
         h : noeud.currentStyle.paddingTop,
         d : noeud.currentStyle.paddingRight,
         b : noeud.currentStyle.paddingBottom,
         g : noeud.currentStyle.paddingLeft
      } ;
   }
   else
      if (window.getComputedStyle) { // Autres
         styles = window.getComputedStyle(noeud,null) ;
         res = {
            h : styles.getPropertyValue("padding-top"),
            d : styles.getPropertyValue("padding-right"),
            b : styles.getPropertyValue("padding-bottom"),
            g : styles.getPropertyValue("padding-left")
         } ;
      }
   for (i in res) {
      v = parseInt(res[i],10) ;
      if (isNaN(v)) {
         res[i] = 0 ;
      }
      else {
         res[i] = v ;
      }
   }
   return res ;
}

// Teste la collision en haut et en bas d'un rectangle avec un rectangle englobant
// p est la position du coin supérieur gauche du rectangle, v la vitesse appliquée au rectangle et d la dimension du rectangle
// min et max sont respectivement les coins superieur gauche et inférieur droit de la zone de jeux
// Retourne le ratio de la vitesse [0;1] à appliquer pour obtenir la collision
// (0 signifie que le rectangle est contre un bord, et 1 que le rectangle peut effectué tout son déplacement sans entrer en collision)
var collisionHautBas = function(p,v,d, min,max) {
   // On teste le bord haut
   if (p.y+v.y<min.y)
      return (min.y-p.y)/v.y ;
   else
      // Sinon on teste le bord bas
      if (p.y+v.y+d.h>max.y)
         return (max.y-d.h-p.y)/v.y ;
      else
         // Et sinon, pas de collision
         return 1 ;
}

// Teste la collision de la balle, définie par le coin supérieur gauche : p, la vitesse : v et une dimension : d
// avec un rectangle rect
// Retourne un objet contenant 3 propriétés :
//   c : état du test de collision
//   t : pourcentage de la vitesse à appliqué à la balle, jusqu'à l'impact (entre 0 et 1 en cas d'impact)
//   v : la nouvelle vitesse de la balle (nouvelle orientation) après le rebond
var collisionRectangle = function(p,v,d, rect) {
   collisionRectangle.nulle = 0 ;
   collisionRectangle.bord = 1 ;
   collisionRectangle.coin = 2 ;
   var test = function(t,a,b,a1,a2)  {
      if (t < 0 || t >= 1)
         return 1 ;
      var x = a*t+b ;
      if (x < a1 || x > a2 || (x == a1 && a < 0) || (x == a2 && a > 0))
         return  1 ;
      else
         return t ;
   }
   var pr = rect.position(), // position du coin supérieur gauche du rectangle
       dr = rect.dimension(), // dimension du rectangle
       r1, r2 ;
   if (v.y > 0)
      // teste l'intersection avec le bord haut du rectangle
      r1 = test((pr.y-p.y-d.h)/v.y, v.x, p.x, pr.x-d.l, pr.x+dr.l) ;
   else
      // teste l'intersection avec le bord bas du rectangle
      r1 = test((pr.y+dr.h-p.y)/v.y, v.x, p.x, pr.x-d.l, pr.x+dr.l) ;
   if (v.x > 0)
      // teste l'intersection avec le bord gauche du rectangle
      r2 = test((pr.x-p.x-d.l)/v.x, v.y, p.y, pr.y-d.h, pr.y+dr.h) ;
   else
      // teste l'intersection avec le bord droite du rectangle
      r2 = test((pr.x+dr.l-p.x)/v.x, v.y, p.y, pr.y-d.h, pr.y+dr.h) ;

   if (r1 < r2)
      return {r:r1, t:collisionRectangle.bord, v:{x:v.x,y:-v.y}} ;
   else {
      if (r2 < 1) {
         if (r1 == r2)
            return {r:r1, t:collisionRectangle.coin, v:{x:-v.x,y:-v.y}} ;
         else {
            // ===== Collision contre une raquette
            //var BALLSPEED = Math.sqrt(v.x*v.x + v.y*v.y)*1.1;//*1.025;
            var BALLSPEED = Math.sqrt(v.x*v.x + v.y*v.y)+1.0;
            var MAXBOUNCEANGLE = Math.PI * 180 / 180;
            console.log(BALLSPEED); // TO TEST
            // ===== ===== ===== Maj de la vitesse ici : ===== ===== =====
            var intersectY = p.y + v.y * r2;
            var relativeIntersectY = (rect.position().y + rect.dimension().h/2) - intersectY;
            var normalizedRelativeIntersectionY = (relativeIntersectY / rect.dimension().h/2);

            var bounceAngle = normalizedRelativeIntersectionY * MAXBOUNCEANGLE;
            var newVx = BALLSPEED*Math.cos(bounceAngle);
            var newVy = BALLSPEED*-Math.sin(bounceAngle);

            if(v.x * newVx > 0)
               newVx *= -1;

            return {r: r2, t: collisionRectangle.bord, v:{x: newVx,y: newVy}} ;
         }
      }
      else
         // Aucune collision
         return {r:1, t:collisionRectangle.nulle, v:{x:v.x,y:v.y}} ;
   }
}

// Ajoute un ecouteur de typeEvenemt sur noeudDom, et y connecte fonction
function ajouteEcouteur(noeudDom, typeEvenement, fonction) {
   if (noeudDom.addEventListener !== undefined) { // FF
      noeudDom.addEventListener(typeEvenement, fonction, false) ;
   }
   else
      if (noeudDom.attachEvent) { // IE
         noeudDom.attachEvent('on'+typeEvenement, fonction) ;
      }
      else {
         noeudDom['on' + typeEvenement] = fonction ;
      }
}

/// Fonction de gestion de l'héritage des prototypes du parent et du fils
function heriteProrietesPrototype(fils, parent) {
   // On récupère le prototype de fils et parent
   var p = parent.prototype,
       f = fils.prototype,
       i ;
   // On donne au prototype du fils les propriétés du prototype du parent
   for (i in p) {
      f[i] = p[i] ;
   }
   // On ajoute une propriété au prototype du fils qui pointe sur le père
   f.Uber = p ;
}

function rand(min, max) {
   return Math.random() * (max - min) + min;
}

function getDigit(N, n) {
   return Math.floor(N / (Math.pow(10, n-1)) % 10)
}