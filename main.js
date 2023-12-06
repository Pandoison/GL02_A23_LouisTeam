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
    .command('capacite', 'Donne la capacité maximale d\'une salle.')
    .argument('<salle>', 'Le nom de la salle.')
    .action(({args, options, logger}) => {

        let analyseurFichier = recupererFichiers();

       if(analyseurFichier.errorCount === 0){
			let salleExistante = analyseurFichier.listeCreneaux;
			if (salleExistante.filter(p => p.salle.match(args.salle)).length ===0){
				logger.info("La salle demandé n'existe pas dans la base de donnée.".red)
			}
			else {
				let capaciteMaxSalle = infoCapaciteMaximumSalle(args.salle, analyseurFichier.listeCreneaux);
				logger.info("La salle " + args.salle + " peut acceuillir au maximum : " + capaciteMaxSalle + " personnes.");
			}
		}else{
			logger.info("Le fichier .cru contient une erreur".red);
		}
    })


    //Affiche le classement des salles
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

    // Affiche le nombre de salle correspondant à une capacité d'accueil donnée
    .command('NbSallesParCapacitaire', 'Affiche le nombre de salle existante pouvant accueillir chaque capacitaire')
    .action(({args, options, logger}) => {
        let analyzer = recupererFichiers();

         if (analyzer.errorCount===0){
            if (!analyzer.listeCreneaux.isEmpty){
                let tabSalles = new Array();
                analyzer.listeCreneaux.forEach(e => creerTabSalles(e, tabSalles));
                let tabSallesAvecCapacites = new Array();
                tabSalles.forEach(e => tabSallesAvecCapacites.push(new objetSalle(e, donnerCapaciteMaxSalle(e, analyzer.listeCreneaux))))
                let tabCapacitaires = new Array();
                tabSallesAvecCapacites.forEach(e=> creerTabCapacitaires(e, tabCapacitaires));
                tabCapacitaires.sort((a, b) => a-b);
                let tabObjetsCapacitaires = new Array();
                tabCapacitaires.forEach(e=>creerTabObjetsCapacitaire(e, tabObjetsCapacitaires, tabSallesAvecCapacites));
                tabObjetsCapacitaires.forEach(e=>console.log("Capacitaire : " + e.capacitaire + "   Nbr salles : " + e.nbSalleDansCeCapacitaire));
            }else {
                logger.info("Le fichier ne contient pas de salles.".red);
            }
        }else{
            logger.info("Le fichier .cru contient une erreur".red);
        }
    })

    // Affiche les salles disponibles durant un créneau donné
    .command('sallesLibres', 'Consulter les salles libres durant un créneau donné')
    .argument('<heureDebut>', 'Heure du début du créneau avec 8:00=8h00; 8:30=8h30; 9:00= 9h00;...')
    .argument('<heureFin>', 'Heure de la fin du créneau avec 8:00=8h00; 8:30=8h30; 9:00= 9h00;...')
    .argument('<jour>', 'Jour de la semaine avec: L=Lundi; MA=Mardi; ME=Mercredi; J=Jeudi; V=Vendredi; S=Samedi')
    .action(({args, options, logger}) => {
        let joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

        if (joursSemaine.includes(args.jour)) {
            let horaires = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

            if (horaires.includes(args.heureDebut) && horaires.includes(args.heureFin)) {
                let analyzer = recupererFichiers();

                // Initialiser les propriétés 'listeCreneaux' et 'reservations' si elles n'existent pas
                if (!analyzer.listeCreneaux) {
                   analyzer.listeCreneaux = [];
                }
                if (!analyzer.reservations) {
                    analyzer.reservations = [];
                }

                if (analyzer.errorCount === 0) {
                    if (!analyzer.listeCreneaux.isEmpty) {
                        let tableauSallesDisponibles = new Array();
                        analyzer.listeCreneaux.forEach(c => creerTableauSallesVides(c, tableauSallesDisponibles, args.heureDebut, args.heureFin, args.jour));

                        console.log("Voici la liste des salles disponibles :");
                        tableauSallesDisponibles.forEach(s => {
                            // Vérifier si la salle est réservée pendant le créneau
                            let salleReservee = analyzer.reservations.some(r =>
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
            logger.info("Les horaires que vous avez entrés ne sont pas valides".red);
        }
        } else {
            logger.info("Le jour que vous avez entré n'est pas valide".red);
        }
    })


    // Affiche toutes les salles associées à un cours donnée
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
                    logger.info("Le cours rentré n'existe pas".red);
                }
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
    let analyzer = new Parser();
    if (listFiles.length !== 0) {
        for (var i = 0; i < listFiles.length; i++) {
            let data = fs.readFileSync(listFiles[i], 'utf-8');
            analyzer.parse(data);
        }
    } else {
        console.log("Le fichier ".red + dataBasePath.red + " ne contient pas de fichiers .cru".red);
        analyzer.errorCount++;
    }
    return analyzer;
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

// permet de recuperer un tableau contenant tout les capacitaires max de la base de données
function creerTabCapacitaires(elementObjetSalle, tab){
	if (!tab.includes(elementObjetSalle.capMax)){
		tab.push(elementObjetSalle.capMax)
	}
	return tab;
}
// permet de creer un tableau contenant tout les capacitaires ainsi que le nombre de salle contenant ce capacitaire
function creerTabObjetsCapacitaire(elementCapacitaire, tab, tabSallesAvecCapacites){
	let objetCap = new objetCapacitaire(elementCapacitaire, 0);
	tabSallesAvecCapacites.forEach(e=> {
		if (e.capMax === objetCap.capacitaire){
			objetCap.nbSalleDansCeCapacitaire++;
		}
	})
	tab.push(objetCap);
}

function donnerCapaciteMaxSalle(nomSalle, listeCreneaux){
	listeCreneauxDeLaSalle = listeCreneaux.filter(p => p.salle === nomSalle); // recupere tout les creneaux pour une salle donnée
	let capaciteMaxSalle = Math.max.apply(Math, listeCreneauxDeLaSalle.map(function(o) { return o.capacitaire; })) // recupere le capacitaire maximal de tout ces creneaux
	return capaciteMaxSalle;
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
//objet contenant un capacitaire et le nombre de salle dans ce capacitaire
let objetCapacitaire = function (capacitaire, nbSalleDansCeCapacitaire){
	this.capacitaire = capacitaire;
	this.nbSalleDansCeCapacitaire = nbSalleDansCeCapacitaire;
}