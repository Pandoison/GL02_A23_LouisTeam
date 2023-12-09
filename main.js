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

// Créer une instance de l'interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

// Écouter l'entrée utilisateur
rl.on('line', (input) => {
  handleUserChoice(input);
});

// Activer le menu interactif
if (process.argv.length <= 2) {
    showMainMenu();
}
  
// Si des arguments de commande sont fournis, exécuter la CLI Caporal
if (process.argv.length > 2) {
    cli.run(process.argv.slice(2));
}

// Afficher le menu principal
function showMainMenu() {
    console.log('Veuillez sélectionner une option en entrant le chiffre correspondant :');
    console.log('1 - Spec1 (Obtention de la liste des salles) ');
    console.log('2 - Spec2 (Donne la cappacité d\'accueil d\'une salle)');
    console.log('3 - Spec3 (Disponibilités d\'une salle)');
    console.log('4 - Spec4 (Affiche les salles disponibles durant un créneau donné)');
    console.log('5 - Spec5 (Enseignements d\'un utilisateur entre 2 dates)');
    console.log('6 - Spec6 (Réserver une salle)');
    console.log('7 - Spec7 (Visualisation synthétique du taux d\'occupation)');
    console.log('8 - Spec8 (Affiche le classement des salles)');
    console.log('Entrez votre choix ou tapez "quit" pour quitter :');
  }

// Spec1, Obtention de la liste des salles.
function spec1() {
    rl.question('Entrez le nom du cours : ', (cours) => {
      let analyseurFichier = recupererFichiers();
  
      if (analyseurFichier.errorCount === 0) {
        if (!analyseurFichier.listeCreneaux.isEmpty) {
          let tableauUe = new Array();
          analyseurFichier.listeCreneaux.forEach(c => creerTableauUe(c, tableauUe));
  
          if (tableauUe.includes(cours)) {
            let tableauSallesDuCours = new Array();
            analyseurFichier.listeCreneaux.forEach(c => creerTableauSallesDuCours(c, tableauSallesDuCours, cours));
            console.log("Voici la liste des salles de ce cours :");
            tableauSallesDuCours.forEach(c => console.log(c));
          } else {
            console.log("“Veuillez entrer un nom de cours valable".red);
          }
        } else {
          console.log("Le fichier ne contient pas de salles.".red);
        }
      } else {
        console.log("Le fichier .cru contient une erreur".red);
      }
  
      showMainMenu(); // Réafficher le menu
    });
}
  
// Spec2, Capacité maximum d’une salle
function spec2() {
rl.question('Entrez le nom de la salle : ', (salle) => {
    let analyseurFichier = recupererFichiers();

    if(analyseurFichier.errorCount === 0){
    let salleExistante = analyseurFichier.listeCreneaux;
    if (salleExistante.filter(p => p.salle.match(salle)).length === 0){
        console.log("Veuillez entrer un nom de salle valide.".red)
    } else {
        let capaciteMaxSalle = infoCapaciteMaximumSalle(salle, analyseurFichier.listeCreneaux);
        console.log(`La salle ${salle} peut accueillir au maximum : ${capaciteMaxSalle} personnes.`);
    }
    } else {
    console.log("Le fichier .cru contient une erreur".red);
    }

    showMainMenu(); // Réafficher le menu
});
}

// Spec3, Disponibilités d’une salle
function spec3() {
    rl.question('Entrez le nom de la salle : ', (salle) => {
        let analyseurFichier = recupererFichiers();

        if (analyseurFichier.errorCount === 0) {
            if (analyseurFichier.listeCreneaux.some(c => c.salle.match(salle))) {
                var nomSalle = salle;
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

                // On retire chaque créneau durant lequel la salle est occupée de la liste représentant tous les créneaux créés précédemment
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
                console.log("Veuillez entrer un nom de salle valide".red);
            }
        } else {
            console.log("Le fichier .cru contient une erreur".red);
        }

        showMainMenu(); // Re-display the menu
    });
}



// Spec4, Disponibilité des salles sur un créneau
function spec4() {
    rl.question('Entrez l\'heure de début (au format 8:00, 8:30, etc.) : ', (heureDebut) => {
        rl.question('Entrez l\'heure de fin (au format 8:00, 8:30, etc.) : ', (heureFin) => {
            rl.question('Entrez le jour de la semaine (L, MA, ME, J, V, S) : ', (jour) => {
                let joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

                if (joursSemaine.includes(jour)) {
                    let horaires = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

                    if (horaires.includes(heureDebut) && horaires.includes(heureFin)) {
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
                                analyzer.listeCreneaux.forEach(c => creerTableauSallesVides(c, tableauSallesDisponibles, heureDebut, heureFin, jour));

                                console.log("Voici la liste des salles disponibles :");
                                tableauSallesDisponibles.forEach(s => {
                                    // Vérifier si la salle est réservée pendant le créneau
                                    let salleReservee = analyzer.reservations.some(r =>
                                        r.salle === s.salle &&
                                        r.jour === jour &&
                                        ((r.heureDebut <= s.heureDebut && s.heureDebut < r.heureFin) || (r.heureDebut < s.heureFin && s.heureFin <= r.heureFin)));// N'inclure la salle que si elle n'est pas réservée
                                    if (!salleReservee) {
                                        console.log(s);
                                    }
                                });
                            } else {
                                console.log("Le fichier ne contient pas de salles.".red);
                            }
                        } else {
                            console.log("Le fichier .cru contient une erreur".red);
                        }
                    } else {
                        console.log("Les horaires que vous avez entrés ne sont pas valides".red);
                    }
                } else {
                    console.log("Le jour que vous avez entré n'est pas valide".red);
                }

                showMainMenu(); // Réafficher le menu
            });
        });
    });
}

// Spec5, Exportation d’un fichier ICalendar
function spec5() {
    let joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

    rl.question('Entrez le premier jour (L, MA, ME, J, V, S) : ', (jour1) => {
        if (!joursSemaine.includes(jour1)) {
            console.log('Le jour entré n\'est pas valide.'.red);
            showMainMenu();
            return;
        }

        rl.question('Entrez le dernier jour (L, MA, ME, J, V, S) : ', (jour2) => {
            if (!joursSemaine.includes(jour2)) {
                console.log('Le jour entré n\'est pas valide.'.red);
                showMainMenu();
                return;
            }

            let fichierAnalyzeur = recupererFichiers();

            if (fichierAnalyzeur.errorCount === 0) {
                let fichierCruFiltre = fichierAnalyzeur.parsedCRU;

                let lesCreneaux = [];
                fichierCruFiltre.forEach(element => {
                    lesCreneaux = lesCreneaux.concat(element.creneaux);
                });

                rl.question("Entrez vos cours séparés par des espaces: ", function(answer) {
                    let cours = answer.split(' ');

                    lesCreneaux = lesCreneaux.filter(c =>
                        cours.includes(c.nomUe) &&
                        joursSemaine.indexOf(c.jour) <= joursSemaine.indexOf(jour2) &&
                        joursSemaine.indexOf(c.jour) >= joursSemaine.indexOf(jour1)
                    );

                    rl.close();

                    let rfcText = "BEGIN:VCALENDAR\nVersion: 2.0\nPRODID:-//Universite centrale de la republique de Sealand (SRU)//FR\n";
                    
                    lesCreneaux.forEach(element => {
                        let today = new Date();
                        let year = today.getFullYear();
                        let month = String(today.getMonth() + 1).padStart(2, '0');
                        let day = String(today.getDate()).padStart(2, '0');

                        let startTime = year + month + day + 'T' + element.heureDebut.replace(':', '') + "00";
                        let endTime = year + month + day + 'T' + element.heureFin.replace(':', '') + "00";

                        rfcText += "BEGIN:VEVENT\nUID:000000\nDTSTAMP:" +
                            today.toISOString() +
                            "\nORGANIZER:Mailto:info.utt@utt.fr\nDTSTART:" +
                            startTime +
                            "\nDTEND:" +
                            endTime +
                            "\nSUMMARY:Nom de l'UV:" +
                            element.nomUe + ' | ' +
                            element.type + ',' +
                            element.capacitaire +
                            ',' + element.index +
                            "\nLOCATION:" +
                            element.salle +
                            "\nEND:VEVENT\n";
                    });

                    rfcText += "END:VCALENDAR\n";

                    let filename = jour1 + '_' + jour2 + '_planning';
                    fs.writeFileSync('./' + filename + '.ics', rfcText);
                    console.log('Le fichier resultat est généré : ./' + filename + '.ics');
                    
                    showMainMenu(); // Réafficher le menu
                });
            } else {
                console.log('Le fichier .cru contient une erreur'.red);
                showMainMenu();
            }
        });
    });
}

// Spec6, Réserver une salle
function spec6() {
    rl.question('Entrez le nom de la salle à réserver : ', (salle) => {
        rl.question('Entrez l\'heure de début de la réservation (HH:MM) : ', (heureDebut) => {
            rl.question('Entrez l\'heure de fin de la réservation (HH:MM) : ', (heureFin) => {
                rl.question('Entrez la date de la réservation (JJ/MM/AAAA) : ', (date) => {
                    let analyzer = recupererFichiers();
        let reservations = [];
        try {
            reservations = JSON.parse(fs.readFileSync('reservations.json', 'utf-8')) || [];
        } catch (error) {
            logger.error("Erreur lors de la lecture du fichier reservations.json : " + error.message);
        }

        // Initialiser la propriété 'reservations' s'il n'existe pas
        if (!analyzer.reservations) {
            analyzer.reservations = [];
        }

        if (analyzer.errorCount === 0) {
            // Vérifier la disponibilité de la salle
            let salleExist = analyzer.listeCreneaux.some(c => c.salle.match(args.salle));
            
            if (salleExist) {
                let salleOccupee = reservations.some(r =>
                    r.salle === args.salle &&
                    r.date === args.date &&
                    ((r.heureDebut <= args.heureDebut && args.heureDebut < r.heureFin) ||
                    (r.heureDebut < args.heureFin && args.heureFin <= r.heureFin))
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
                        // Mettre à jour les informations pour refléter la réservation
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
                        fs.writeFileSync('reservations.json', JSON.stringify(reservations, null, 2));

                        logger.info("La salle " + args.salle + " a été réservée avec succès pour le créneau du " + args.date + " de " + args.heureDebut + " à " + args.heureFin);
                    } else {
                        logger.info("La salle est déjà réservée pendant ce créneau. Veuillez choisir un autre créneau.");
                    }
                } else {
                    logger.info("La salle est déjà réservée pendant ce créneau. Veuillez choisir un autre créneau.");
                }
            } else {
                logger.info("La salle renseignée n'existe pas".red);
            }
        } else {
            logger.info("Le fichier .cru contient une erreur".red);
        }
                 // Réafficher le menu
                showMainMenu();
                });
            });
        });
    });
}



// Spec7, Visualisation synthétique du taux d’occupation
function spec7() {
    const logger = console;

    rl.question('Appuyez sur Entrée pour générer le diagramme du taux d\'occupation : ', () => {
        try {
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
                    salle.occupation = (salle.occupation / 66) * 100;
                });

                var occRtChart = {
                    "data": {
                        "values": listeSalles
                    },
                    "mark": "bar",
                    "encoding": {
                        "x": {"field": "nom", "type": "nominal"},
                        "y": {"field": "occupation", "type": "quantitative", "title": "Taux d'Occupation %"}
                    }
                };

                const myChart = vegalite.compile(occRtChart).spec;

                var runtime = vg.parse(myChart);
                var view = new vg.View(runtime).renderer('svg').run();
                var mySvg = view.toSVG();
                mySvg.then(function (res) {
                    fs.writeFileSync("./result.svg", res);
                    view.finalize();
                    logger.info("Graphique généré : ./result.svg");
                });

            } else {
                logger.info("Veuillez entrer un nom de salle valide.".red);
            }

            showMainMenu(); // Réafficher le menu
        } catch (error) {
            logger.error(`An error occurred: ${error.message}`);
        }
    });
}

// Spec8,Classement par capacité d’accueil. 
function spec8() {
    let analyzer = recupererFichiers();

    if (analyzer.errorCount === 0) {
        let tableauSalles = new Array();
        if (analyzer.listeCreneaux.length > 0) {
            // Utilisation de l'opérateur de comparaison correct
            analyzer.listeCreneaux.forEach(c => creerTabSalles(c, tableauSalles));

            let tableauSallesAvecCapacites = new Array();
            tableauSalles.forEach(c => tableauSallesAvecCapacites.push(new objetSalle(c, infoCapaciteMaximumSalle(c, analyzer.listeCreneaux))))
            tableauSallesAvecCapacites.sort((a, b) => a.capMax - b.capMax);
            console.log("Voici le classement des salles par ordre de capacité maximale croissante :");
            tableauSallesAvecCapacites.forEach(c => console.log(c.nom + " capacité maximale : " + c.capMax));
        } else {
            console.log("Le fichier ne contient pas de salles.".red);
        }
    } else {
        console.log("Le fichier .cru contient une erreur".red);
    }

    showMainMenu(); // Réafficher le menu
}

  // Gérer le choix de l'utilisateur
  function handleUserChoice(choice) {
    switch (choice.trim()) {
    case '1':
    spec1();
    break;
    case '2':
    spec2();
    break;
    case '3':
    spec3();
    break;
    case '4':
    spec4();
    break;
    case '5':
    spec5();
    break;
    case '6':
    spec6();
    break;
    case '7':
    spec7();
    break;
    case '8':
    spec8();
    break;
    case 'quit':
    console.log('Au revoir!');
    rl.close(); // Fermer l'interface readline
    break;
    default:
        console.log('Choix invalide. Veuillez réessayer.'.red);
        showMainMenu(); // Réafficher le menu
    }
  }

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