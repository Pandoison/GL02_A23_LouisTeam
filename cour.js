const Console = require("console");
var cour = function(uv, creneau){
    this.uv = uv;
    this.creneaux = [].concat(creneau);
};

cour.prototype.addCreneau = function (creneau) {
    this.creneaux.push(creneau);
}

module.exports = cour;
