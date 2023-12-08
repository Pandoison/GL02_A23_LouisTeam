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

    // Affiche toutes les salles associées à un cours donnée, Spec 01
    .command('sallesCours', 'Consulter la liste des salles associées à un cours donné')
    .argument('<cours>', 'Le cours')
    .action(({args, options, logger}) => {
        let analyseurFichier = recupererFichiers();

        if (analyseurFichier.errorCount === 0) {
            if (!analyseurFichier.listeCreneaux.isEmpty) {
                let tableauUe = new Array();
            analyseurFichier.listeCreneaux.forEach(c => creerTableauUe(c, tableauUe));

                if (tableauUe.includes(args.cours)) {
                    let tableauSallesDuCours = new Array();
                    analyseurFichier.listeCreneaux.forEach(c => creerTableauSallesDuCours(c, tableauSallesDuCours, args.cours));
                    console.log("Voici la liste des salles de ce cours :");
                    tableauSallesDuCours.forEach(c => console.log(c));
                } else {
                    logger.info("Veuillez entrer un nom de cours valable".red);
                }
            } else {
                logger.info("Le fichier ne contient pas de salles.".red);
            }
        } else {
            logger.info("Le fichier .cru contient une erreur".red);
        }
    })

    //Donne la cappacité d'accueil d'une salle Spec 02
    .command('capacite', 'Donne la capacité maximale d\'une salle.')
    .argument('<salle>', 'Le nom de la salle.')
    .action(({args, options, logger}) => {

        let analyseurFichier = recupererFichiers();

       if(analyseurFichier.errorCount === 0){
			let salleExistante = analyseurFichier.listeCreneaux;
			if (salleExistante.filter(p => p.salle.match(args.salle)).length ===0){
				logger.info("Veuillez entrer un nom de salle valide".red)
			}
			else {
				let capaciteMaxSalle = infoCapaciteMaximumSalle(args.salle, analyseurFichier.listeCreneaux);
				logger.info("La salle " + args.salle + " peut acceuillir au maximum : " + capaciteMaxSalle + " personnes.");
			}
		}else{
			logger.info("Le fichier .cru contient une erreur".red);
		}
    })

// Disponibilités d’une salle, SPEC 03
.command('creneaux', "Affiche les créneaux pour lesquels une salle est libre")
.argument('<salle>', "La salle de la recherche")
.action(({args, options, logger}) => {
    let analyseurFichier = recupererFichiers();

    if (analyseurFichier.errorCount === 0) {
        if (analyseurFichier.listeCreneaux.some(c => c.salle.match(args.salle))) {
            var nomSalle = args.salle;
            var creneauxOccupes = analyseurFichier.listeCreneaux.filter(c => c.salle.match(nomSalle));

            // on initialise (6 jours, de 8h à 20h, créneaux de 30 minutes)
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

            // On retire chaque créneau durant lequel la salle est occupéede a la liste représentant tous les créneaux  créés précédemment
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
            logger.info("“Veuillez entrer un nom de salle valide".red)
        }
    } else {
        logger.info("The .cru file contains error".red);
    }
})




    // Affiche les salles disponibles durant un créneau donné SPEC 04
    .command('sallesLibres', 'Consulter les salles libres durant un créneau donné')
    .argument('<heureDebut>', 'Heure du début du créneau avec 8:00=8h00; 8:30=8h30; 9:00= 9h00;...')
    .argument('<heureFin>', 'Heure de la fin du créneau avec 8:00=8h00; 8:30=8h30; 9:00= 9h00;...')
    .argument('<jour>', 'Jour de la semaine avec: L=Lundi; MA=Mardi; ME=Mercredi; J=Jeudi; V=Vendredi; S=Samedi')
    .action(({args, options, logger}) => {
        let joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

        if (joursSemaine.includes(args.jour)) {
            let horaires = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

            if (horaires.includes(args.heureDebut) && horaires.includes(args.heureFin)) {
                let analyseurFichier = recupererFichiers();

                // Initialiser les propriétés 'listeCreneaux' et 'reservations' si elles n'existent pas
                if (!analyseurFichier.listeCreneaux) {
                   analyseurFichier.listeCreneaux = [];
                }
                if (!analyseurFichier.reservations) {
                    analyseurFichier.reservations = [];
                }

                if (analyseurFichier.errorCount === 0) {
                    if (!analyseurFichier.listeCreneaux.isEmpty) {
                        let tableauSallesDisponibles = new Array();
                        analyseurFichier.listeCreneaux.forEach(c => creerTableauSallesVides(c, tableauSallesDisponibles, args.heureDebut, args.heureFin, args.jour));

                        console.log("Voici la liste des salles disponibles :");
                        tableauSallesDisponibles.forEach(s => {
                            // Vérifier si la salle est réservée pendant le créneau
                            let salleReservee = analyseurFichier.reservations.some(r =>
                                r.salle === s.salle &&
                                r.jour === args.jour &&
                                ((r.heureDebut <= s.heureDebut && s.heureDebut < r.heureFin) || (r.heureDebut < s.heureFin && s.heureFin <= r.heureFin)));// N'inclure la salle que si elle n'est pas réservée
                        if (!salleReservee) {
                            console.log(s);
                        }
                        });
                    } else {
                        logger.info("Le fichier ne contient pas de salles.".red);
                    }
                } else {
                    logger.info("Le fichier .cru contient une erreur".red);
                }
            } else {
            logger.info("Veuillez entrer un créneau valide”.".red);
        }
        } else {
            logger.info("Le jour que vous avez entré n'est pas valide".red);
        }
    })

//Réserver une salle pour un créneau durant un jour de l'année SPEC06
.command('ReserverSalle', 'Réserver une salle pour un créneau donné')
.argument('<salle>', 'Le nom de la salle.')
.argument('<heureDebut>', 'Heure de début de la réservation.')
.argument('<heureFin>', 'Heure de fin de la réservation.')
.argument('<date>', 'Date de la réservation au format JJ/MM/AAAA.')
.action(({args, options, logger}) => {
    let analyzer = recupererFichiers();

    // Charger les réservations depuis le fichier JSON
    let reservations = [];
    try {
        reservations = JSON.parse(fs.readFileSync('reservations.json', 
'utf-8')) || [];
    } catch (error) {
        // Gérer les erreurs de lecture du fichier JSON
        logger.error("Erreur lors de la lecture du fichier 
reservations.json : " + error.message);
    }

    // Initialiser la propriété 'reservations' s'il n'existe pas
    if (!analyzer.reservations) {
        analyzer.reservations = [];
    }

    if (analyzer.errorCount === 0) {
        // Vérifier la disponibilité de la salle
        let salleExist = analyzer.listeCreneaux.some(c => 
c.salle.match(args.salle));
        if (salleExist) {
            let salleOccupee = reservations.some(r =>
                r.salle === args.salle &&
                r.date === args.date &&
                ((r.heureDebut <= args.heureDebut && args.heureDebut < 
r.heureFin) ||
                (r.heureDebut < args.heureFin && args.heureFin <= 
r.heureFin))
            );

            if (!salleOccupee) {
                // Vérifier si la salle a déjà été réservée
                let salleDejaReservee = analyzer.reservations.some(r =>
                    r.salle === args.salle &&
                    r.date === args.date &&
                    r.heureDebut === args.heureDebut &&
                    r.heureFin === args.heureFin
                );

                if (!salleDejaReservee) {
                    // Mettre à jour les informations pour refléter la 
réservation
                    // Ajouter la réservation à la liste des réservations
                    analyzer.reservations.push({
                        salle: args.salle,
                        date: args.date,
                        heureDebut: args.heureDebut,
                        heureFin: args.heureFin,
                    });

                    // Ajouter la réservation au tableau des réservations
                    reservations.push({
                        salle: args.salle,
                        date: args.date,
                        heureDebut: args.heureDebut,
                        heureFin: args.heureFin,
                    });

                    // Enregistrer les réservations dans le fichier JSON
                    fs.writeFileSync('reservations.json', 
JSON.stringify(reservations, null, 2));

                    logger.info("La salle " + args.salle + " a été 
réservée avec succès pour le créneau du " + args.date + " de " + 
args.heureDebut + " à " + args.heureFin);
                } else {
                    logger.info("La salle est déjà réservée pendant ce 
créneau. Veuillez choisir un autre créneau.");
                }
            } else {
                logger.info("La salle est déjà réservée pendant ce 
créneau. Veuillez choisir un autre créneau.");
            }
        } else {
            logger.info("La salle renseignée n'existe pas".red);
        }
    } else {
        logger.info("Le fichier .cru contient une erreur".red);
    }
})



// Visualisation synthétique du taux d’occupation, SPEC 07
//Basé sur le nbr d'h doccupation dans la semaine par rapport à une semaine de 6 jours de 8h,  
.command('tauxdOccupation', 'Crée un diagramme du taux d\'occupation')
.action(({args, options, logger}) => {
    let analyseurFichier = recupererFichiers();
 
    if (analyseurFichier.errorCount === 0) {
        var listeSalles = [];

        analyseurFichier.listeCreneaux.forEach(function (creneau) {
            var debut = creneau.heureDebut.split(':');
            var fin = creneau.heureFin.split(':');
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
            const duree = heureFin - heureDebut;

            if (listeSalles.some(e => e.nom.match(creneau.salle))) {
                const salle = listeSalles.find(e => e.nom.match(creneau.salle));
                const pos = listeSalles.indexOf(salle);
                listeSalles[pos].occupation += duree;
            } else {
                listeSalles.push(new Salle(creneau.salle, duree))
            }
        });

        listeSalles.forEach(function (salle) {
            salle.occupation = (salle.occupation / 66) * 100
        });

        var occRtChart = {
            "data": {
                "values": listeSalles
            },
            "mark": "bar",
            "encoding": {
                "x": {"field": "nom", "type": "nominal"},
                "y": {"field": "occupation", "type": "quantitative", "title": "Occupation Rate %"}
            }
        };

        const myChart = vegalite.compile(occRtChart).spec;

        var runtime = vg.parse(myChart);
        var view = new vg.View(runtime).renderer('svg').run();
        var mySvg = view.toSVG();
        mySvg.then(function (res) {
            fs.writeFileSync("./result.svg", res);
            view.finalize();
            logger.info("Chart output : ./result.svg");
        });

    } else {
        logger.info("“Veuillez entrer un nom de salle valide".red);
    }
})




    //Affiche le classement des salles SPEC08
    .command('classementSalles', 'Affiche les salles par ordre de capacité maximale croissante')
    .action(({args, options, logger}) => {
        let analyseurFichier = recupererFichiers();

        if (analyseurFichier.errorCount === 0) {
            let tableauSalles = new Array();
            if (analyseurFichier.listeCreneaux.length > 0) {  // Utilisation de l'opérateur de comparaison correct
                analyseurFichier.listeCreneaux.forEach(c => creerTabSalles(c, tableauSalles));

                let tableauSallesAvecCapacites = new Array();
                tableauSalles.forEach(c => tableauSallesAvecCapacites.push(new objetSalle(c, infoCapaciteMaximumSalle(c, analyseurFichier.listeCreneaux))))
                tableauSallesAvecCapacites.sort((a, b) => a.capMax - b.capMax);
                tableauSallesAvecCapacites.forEach(c => console.log(c.nom + " capacité maximale : " + c.capMax));
            } else {
                logger.info("Le fichier ne contient pas de salles.".red);
            }
        } else {
            logger.info("Le fichier .cru contient une erreur".red);
        }
    })

    

cli.run(process.argv.slice(2)); 

function recupererFichiers() {
    console.log("Recuperation des données depuis ".blue + dataBasePath.blue);
    var dirFiles = browseDir.browseFiles(dataBasePath);
    let listFiles = [];
    dirFiles.forEach(e => listFiles.push(e.src));
    let analyseurFichier = new Parser();
    if (listFiles.length !== 0) {
        for (var i = 0; i < listFiles.length; i++) {
            let data = fs.readFileSync(listFiles[i], 'utf-8');
            analyseurFichier.parse(data);
        }
    } else {
        console.log("Le fichier ".red + dataBasePath.red + " ne contient pas de fichiers .cru".red);
        analyseurFichier.errorCount++;
    }
    return analyseurFichier;
}



function infoCapaciteMaximumSalle(nomSalle, listeCreneaux) {
    listeCreneauxDeLaSalle = listeCreneaux.filter(p => p.salle === nomSalle);
    let capaciteMaxSalle = Math.max.apply(Math, listeCreneauxDeLaSalle.map(function(o) { return o.capacitaire; }));
    return capaciteMaxSalle;
}


function creerTabSalles(element, tab){
	if (!tab.includes(element.salle)){ // ajoute la salle si elle n'est pas deja dans le tableau
		tab.push(element.salle);
	}
	return tab;
}

function creerTableauSallesVides(element, tab, heur1, heur2, jour){

	//transformation horaire des fichier
	let hor1= element.heureDebut;
	let ho1=hor1[0]+hor1[1]+hor1[3]+hor1[4];
	let horaire1 = parseInt(ho1);
	let hor2= element.heureFin;
	let ho2=hor2[0]+hor2[1]+hor2[3]+hor2[4];
	let horaire2 = parseInt(ho2);

	let journee= element.jour;

	//transformation horaire des entrées de l'utilisateur
	let he1=heur1[0]+heur1[1]+heur1[3]+heur1[4];
	let horaire3 = parseInt(he1);
	let he2=heur2[0]+hor1[1]+heur2[3]+heur2[4];
	let horaire4 = parseInt(he1);

	if (journee == jour){
		if (!(horaire1 <= horaire3) && (horaire2 >= horaire4)) {
			if (!tab.includes(element.salle)) {
				tab.push(element.salle);

			}
		}
	}
	return tab;
}

function creerTableauUe(element, tab){
	if (!tab.includes(element.nomUe)){
		tab.push(element.nomUe);
	}

	return tab;
}

function creerTableauSallesDuCours(element, tab, cours){
	let ue = element.nomUe;
	if (ue == cours) {
		if (!tab.includes(element.salle)){
			tab.push(element.salle);
		}
	}
	return tab;
}

// objet contenant une salle et son capacitaire
let objetSalle = function (nom, capMax){
	this.nom = nom;
	this.capMax = capMax;
}

// Objet créneau simplifié.
let CreneauDisponible = function (jour, heureDebut, heureFin){
	this.jour = jour;
	this.heureDebut = heureDebut;
	this.heureFin = heureFin;
}

// Objet salle avec un nombre d'heure d'occupation
let Salle = function (nom, occupation){
	this.nom = nom;
	this.occupation = occupation;
}
