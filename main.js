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



function infoCapaciteMaximumSalle(nomSalle, listeCreneaux) {
    listeCreneauxDeLaSalle = listeCreneaux.filter(p => p.salle === 
nomSalle);
    let capaciteMaxSalle = Math.max.apply(Math, 
listeCreneauxDeLaSalle.map(function(o) { return o.capacitaire; }));
    console.log(`Capacité maximale de la salle ${nomSalle} : 
${capaciteMaxSalle}`);
    return capaciteMaxSalle;
}


