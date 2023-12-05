const fs = require('fs');
const Parser = require('./Parser.js');
const parser = new Parser(true, true);
const colors = require('colors');

const vg = require('vega');
const vegalite = require('vega-lite');

const path = require('path');
var browseDir = require("browse-directory");

const cli = require("@caporal/core").default;
const readline = require('readline');
const { info } = require('console');

let dataBasePath = './data';
cli
    .version('parser-cli')
    .version('0.07')


//Donne la cappacité d'accueil d'une salle
.command('capacite', 'Fournis la capacité maximale d'une salle.')
.argument('<salle>', 'Le nom de la salle.')
.action(({args, options, logger}) => {
    let analyseurFichier = recupererFichiers();

    if (analyseurFichier.errorCount === 0) {
        let creneaux = analyseurFichier.listeCreneaux;
        let salleExistante = creneaux.some(c => 
c.salle.match(args.salle));

        if (!salleExistante) {
            logger.info("La salle demandée n'est pas présente dans la base 
de données.".red);
        } else {
            let capaciteMaxSalle = infoCapaciteMaximumSalle(args.salle, 
creneaux);
            logger.info(`La salle ${args.salle} a une capacité maximale de 
${capaciteMaxSalle} personnes.`);
        }
    } else {
        logger.info("Le fichier .cru contient une erreur".red);
    }
});


cli.run(process.argv.slice(2));

function recupererFichiers() {
    console.log("Recuperation des données depuis ".blue + 
dataBasePath.blue);
    var dirFiles = browseDir.browseFiles(dataBasePath);
    //console.log(dirFiles)
    let listFiles = [];
    dirFiles.forEach(e => listFiles.push(e.src));
    let analyzer = new Parser();
    if (listFiles.length !== 0) {
        for (var i = 0; i < listFiles.length; i++) {
            //console.log('Lecture du fichier :', listFiles[i]);
            let data = fs.readFileSync(listFiles[i], 'utf-8');
            //console.log('Contenu du fichier :', data);
            analyzer.parse(data);
        }
    } else {
        console.log("Le fichier ".red + dataBasePath.red + " ne contient 
pas de fichiers .cru".red);
        analyzer.errorCount++;
    }

    // Debug messages
    //console.log('Nombre de fichiers analysés:', listFiles.length);
    //console.log('Nombre de salles extraites:', 
analyzer.listeCreneaux.length);

    return analyzer;
}

// Créneau libre pour la salle que l'on veut
.command('creneaux', "Affiche les créneaux durant lesquels une salle est libre")
.argument('<salle>', "La salle dont on veut connaitre les creneaux de disponibilité")
.action(({args, options, logger}) => {
    let analyseurFichier = recupererFichiers();

    if (analyseurFichier.errorCount === 0) {
        if (analyseurFichier.listeCreneaux.some(c => c.salle.match(args.salle))) {
            var nomSalle = args.salle;
            var creneauxOccupes = analyseurFichier.listeCreneaux.filter(c => c.salle.match(nomSalle));

            // On initialise de 8h à 20h des créneaux de 30 minutes pendnat la semaine
            let creneauxDisponibles = [];
            let jours = ["L", "MA", "ME", "J", "V", "S"];
            jours.forEach(function (jour) {
                if (jour !== "S") {
                    for (var h = 8; h < 20; h++) {
                        for (var min = 0; min < 60; min = min + 30) {
                            if (min === 30) {
                                creneauxDisponibles.push(new CreneauDisponible(jour, h + ":" + min, (h + 1) + ":" + "00"));
                            } else {
                                creneauxDisponibles.push(new CreneauDisponible(jour, h + ":" + "00", h + ":" + (min + 30)));
                            }
                        }
                    }
                } else {
                    for (var h = 8; h < 12; h++) {
                        for (var min = 0; min < 60; min = min + 30) {
                            if (min === 30) {
                                creneauxDisponibles.push(new CreneauDisponible(jour, h + ":" + min, (h + 1) + ":" + "00"));
                            } else {
                                creneauxDisponibles.push(new CreneauDisponible(jour, h + ":" + "00", h + ":" + (min + 30)));
                            }
                        }
                    }
                }
            });

            // On retire chaque creneau occupé de la liste precedente afin de n'avoire que ceux occupé
            creneauxOccupes.forEach(function (occupe) {
                var debut = occupe.heureDebut.split(':');
                var fin = occupe.heureFin.split(':');
                var heureDebut = debut[0];
                var minDebut = debut[1];
                var heureFin = fin[0];
                var minFin = fin[1];

                if (minDebut === "30") {
                    heureDebut = parseInt(heureDebut, 10) + 0.5;
                }
                if (minFin === "30") {
                    heureFin = parseInt(heureFin, 10) + 0.5;
                }

                creneauxDisponibles.forEach(function (disponible) {
                    if (disponible.jour === occupe.jour) {
                        if (disponible.heureDebut === occupe.heureDebut) {
                            var nbSuppression = (heureFin - heureDebut) * 2;
                            creneauxDisponibles.splice(creneauxDisponibles.indexOf(disponible), nbSuppression);
                        }
                    }
                });
            });

            // Affichage
            jours.forEach(function (jour) {
                var creneau = creneauxDisponibles.filter(c => c.jour.match(jour));
                var creneaux = "";
                creneau.forEach(function (c) {
                    creneaux = creneaux + " " + c.heureDebut + "-" + c.heureFin;
                });

                if (jour === "L") {
                    console.log("\nLundi : " + creneaux);
                } else if (jour === "MA") {
                    console.log("\nMardi : " + creneaux);
                } else if (jour === "ME") {
                    console.log("\nMercredi : " + creneaux);
                } else if (jour === "J") {
                    console.log("\nJeudi : " + creneaux);
                } else if (jour === "V") {
                    console.log("\nVendredi : " + creneaux);
                } else if (jour === "S") {
                    console.log("\nSamedi : " + creneaux);
                }
            });
        } else {
            logger.info("La salle renseignée n'existe pas".red)
        }
    } else {
        logger.info("The .cru file contains error".red);
    }
})


// commande pour reserver une salle sur un creneau donné
.command('ReserverSalle', 'Réserver une salle pour le creneau que l on desire')
.argument('<salle>', 'nom de la salle ex: (B201)')
.argument('<heureDebut>', 'Heure de début')
.argument('<heureFin>', 'Heure de fin')
.argument('<jour>', 'Jour')
.action(({args, options, logger}) => {
    let analyzer = recupererFichiers();

    // Initialisation de la propriété reservation
    if (!analyzer.reservations) {
        analyzer.reservations = [];
    }

    if (analyzer.errorCount === 0) {
        // Vérifier la dispo de la salle
        let salleExist = analyzer.listeCreneaux.some(c => c.salle.match(args.salle));
        if (salleExist) {
            let salleOccupee = analyzer.listeCreneaux.some(c =>
                c.salle.match(args.salle) &&
                c.jour.match(args.jour) &&
                ((c.heureDebut <= args.heureDebut && args.heureDebut < c.heureFin) ||
                (c.heureDebut < args.heureFin && args.heureFin <= c.heureFin))
            );

            if (!salleOccupee) {
                // Ajouter la réservation à la liste des réservations
                analyzer.reservations.push({
                    salle: args.salle,
                    jour: args.jour,
                    heureDebut: args.heureDebut,
                    heureFin: args.heureFin,
                });

                logger.info("La salle " + args.salle + " a été réservée avec succès pour le créneau " + args.jour + " de " + args.heureDebut + " à " + args.heureFin);
            } else {
                logger.info("La salle est déjà réservée. Veuillez choisir un autre créneau.");
            }
        } else {
            logger.info("La salle " + args.salle + " n'existe pas".red);
        }
    } else {
        logger.info("Le fichier .cru contient une erreur".red);
    }
})

function infoCapaciteMaximumSalle(nomSalle, listeCreneaux) {
    listeCreneauxDeLaSalle = listeCreneaux.filter(p => p.salle === 
nomSalle);
    let capaciteMaxSalle = Math.max.apply(Math, 
listeCreneauxDeLaSalle.map(function(o) { return o.capacitaire; }));
    console.log(`Capacité maximale de la salle ${nomSalle} : 
${capaciteMaxSalle}`);
    return capaciteMaxSalle;
}


