var creneau = function (nomUe, type, capacitaire, jour, heureDebut, 
heureFin, index, salle) {
    this.nomUe = nomUe;
    this.type = type;
    this.capacitaire = capacitaire;
    this.jour = jour;
    this.heureDebut = heureDebut;
    this.heureFin = heureFin;
    this.index = index;
    this.salle = salle;
};

module.exports = creneau;
