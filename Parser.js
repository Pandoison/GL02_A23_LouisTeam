var cour = require('./cour');
var creneau = require('./creneau')

// Parser

var Parser = function(sTokenize, sParsedSymb){
    // La liste des cours extraite à partir de l'entrée analysée.
    this.parsedCRU = [];
    this.listeCreneaux = [];
    this.symb = ["+","1",",","P","H","F", "S", "//", "=", "-"];
    this.showTokenize = sTokenize;
    this.showParsedSymbols = sParsedSymb;
    this.errorCount = 0;
}

// Parser procedure

// tokenize : Convert the input data into a list.
// <eol> = CRLF
Parser.prototype.tokenize = function(data){
    var separator = /(\r\n|,|-|=| |\/\/|\+)/; // \r\n = saut a la ligne
    data = data.split(separator);
    var remover = /(\r\n| |,|^$)/; // ^$ = vide
    data = data.filter((val, idx) => !val.match(remover));
    return data;
}

// parse : Analyze the data by invoking the initial non-terminal rule of the grammar.
Parser.prototype.parse = function(data){
    if (data.length !== 0){
        var tData = this.tokenize(data);
        if(this.showTokenize){
            console.log(tData);
        }
        this.cour(tData);
    }else{
        console.log("Erreur : le fichier est vide.".red);
        this.errorCount++;
    }

}

// Parser operand

Parser.prototype.errMsg = function(msg, input){
    this.errorCount++;
    console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
Parser.prototype.next = function(input){
    var curS = input.shift();
    if(this.showParsedSymbols){
        console.log(curS);
    }
    return curS
}

// accept : Vérifier si l'argument "s" fait partie des symboles du langage..

Parser.prototype.accept = function(s){
    var idx = this.symb.indexOf(s);
    // index 0 exists
    if(idx === -1){
        this.errMsg("symbol "+s+" unknown", [" "]);
        return false;
    }

    return idx;
}



// check : Vérifier si l'argument "elt" est en tête de la liste.
Parser.prototype.check = function(s, input){
    if(this.accept(input[0]) == this.accept(s)){
        return true;   
    }
    return false;
}

// expect : Attendre que le prochain symbole soit "s".
Parser.prototype.expect = function(s, input){
    if(s == this.next(input)){
        //console.log("Reckognized! "+s)
        return true;
    }else{
        this.errMsg("symbol "+s+" doesn't match", input);
    }
    return false;
}


// Parser rules

Parser.prototype.cour = function(input){

    if(this.check("+", input)){
        this.expect("+", input);
        var getNom = this.nom(input);// recupere le nom
        var p = new cour(getNom, []);
        this.creneau(input, p, getNom);
        this.parsedCRU.push(p);
        if(input.length > 0){
            this.cour(input);
        }
        return true;
    }else{
        return false;
    }

}
Parser.prototype.nom = function(input){
    var curS = this.next(input);
    if(matched = curS.match(/[A-Z0-9]+/)){
        return matched[0];
    }else{
        this.errMsg("Nom invalide.", input);
    }
}


Parser.prototype.creneau = function (input, curCour, nomDuCour){
    if(this.check("1", input)){
        this.expect("1", input);
        let getType = this.type(input);
        let getCapacitaire = this.capacitaire(input);
        let getJour = this.jour(input);
        let getHeureDebut = this.heureDebut(input);
        let getHeureFin = this.heureFin(input);
        let getIndex = this.index(input);
        let getSalle = this.salle(input);
        this.expect("//", input);
        var p = new creneau(nomDuCour, getType, getCapacitaire, getJour, getHeureDebut, getHeureFin, getIndex, getSalle);
        curCour.addCreneau(p);
        this.listeCreneaux.push(p);
        if (input.length > 0){
            this.creneau(input, curCour, nomDuCour);
        }

    }
}


Parser.prototype.type = function(input){
    var curS = this.next(input);
    if(matched = curS.match(/[TCD][0-9]/)){ // T, C ou D suivi de 1 chiffre
        return matched[0];
    }else{
        this.errMsg("Nom invalide.", input);
    }
}
Parser.prototype.jour = function(input){
    this.expect("H", input);
    this.expect("=", input);
    var curS = this.next(input);
    if(matched = curS.match(/L|MA|ME|J|V|S/)){//Vérifier la correspondance.
        return matched[0];

    } else{
        this.errMsg("Jour invalide", input);
    }
}
Parser.prototype.capacitaire = function(input){
    this.expect("P", input);
    this.expect("=", input);
    var curS = this.next(input);
    if(matched = curS.match(/[0-9]?[0-9]?[0-9]/)){  //1, 2 ou 3 chiffres
        return matched[0];
    }else{
        this.errMsg("Nom invalide.", input);
    }
    //this.expect(",", input)
}

Parser.prototype.heureFin = function(input){
    this.expect("-", input);
    var curS = this.next(input);
    if(matched = curS.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)){//des chiffres : des chiffres
        return matched[0];
    } else{
        this.errMsg("Heure fin invalide", input);
    }
}
Parser.prototype.heureDebut = function(input){
    var curS = this.next(input);
    if(matched = curS.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)){//des chiffres : des chiffres
        return matched[0];
    } else{
        this.errMsg("Jour invalide", input);
    }

}

Parser.prototype.salle = function(input){
    this.expect("S", input);
    this.expect("=", input);
    var curS = this.next(input);
    if(matched = curS.match(/[A-Z0-9]*/)){// EXT1 ou nom de salles
        return matched[0];
    } else{
        this.errMsg("Salle invalide", input);
    }
}
Parser.prototype.index = function(input){
    var curS = this.next(input);
    if(matched = curS.match(/F([12]|[AB])/)){// F1 ou F2
        return matched[0];
    } else{
        this.errMsg("Index invalide", input);
    }
}


module.exports = Parser;
