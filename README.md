# GL02_A23_LouisTeam
Projet de GL02, Logiciel utilitaire en ligne de commande pour la gestion des salles de cours
Membre: Louis, Nassim, Mael, (Emma, Chengxian)

Ce script JavaScript propose une interface en ligne de commande (CLI) permettant de gérer les salles de cours, leur capacité et leur disponibilité en fonction des créneaux horaires.

Prérequis :
Assurez-vous d'avoir Node.js installé sur votre machine pour exécuter ce script.

Utilisation :
Pour mettre en marche le logiciel, exécutez le fichier main.js depuis l'invite de commande à l'aide de la commande node main.js.
Au démarrage du logiciel, un menu interactif s'affiche, proposant diverses actions. Chaque commande est représentée par un numéro et l'utilisateur est invité à saisir le numéro associé à l'action qu'il souhaite effectuer.

Commandes disponibles :
1.	SPEC_1 : Obtention de la liste des salles
	Demande le nom du cours pour afficher toutes les salles associées à ce cours.
2.	SPEC_2 : Capacité maximale d'une salle
	Demande le nom de la salle et affiche sa capacité maximale.
3.	SPEC_3 : Disponibilités d'une salle
	Requiert le nom d'une salle et affiche ses disponibilités.
4.	SPEC_4 : Disponibilité des salles sur un créneau
o	Demande le nom de la salle, l'heure de début et l'heure de fin du créneau. Affiche les disponibilités de cette salle pour ce créneau.
5.	SPEC_5 : Exportation d'un fichier ICalendar
	Demande le jour de début et de fin. Permet d'exporter un fichier ICalendar contenant les enseignements entre ces deux dates.
6.	SPEC_6 : Réservation d'une salle
	Demande le nom de la salle pour effectuer une réservation.
7.	SPEC_7 : Visualisation synthétique du taux d'occupation
	Affiche un diagramme synthétique du taux d'occupation. Basé sur le nombre d'heures d'occupation dans la semaine par rapport à une semaine de 6 jours de 8 heures.
8.	SPEC_8 : Classement par capacité d'accueil
	Affiche une liste de salles triées en fonction de leur capacité, de manière croissante
quit. Quitter le menu
	Cette commande permet de sortir du menu interactif et de retourner à l'invite de commande pour terminer l'exécution du programme.

Dépendances:
Ce projet utilise plusieurs modules npm, notamment :
•	fs pour gérer les fichiers.
•	Parser pour l'analyse des données.
•	vega et vega-lite pour la visualisation.

Jeux de donnée:
Le jeux de donnée fournis dans le fichier .cru sont essentiels pour le fonctionnement du script, fournissant des informations cruciales sur les salles de cours, les créneaux horaires et leurs capacités. Voici une liste des cours et des salles qui pourraient s'avérer utiles lors d'une recherche :

Cours :
•	TN01
•	TN01T1
•	TN02
•	TN04
•	TN04T1
•	TN12
•	TN14
•	TN15
•	TN19
•	TNEV
•	TNEVT1
•	TPC01
•	TS02
•	RM02
•	RO02
•	SC00
•	SC00T1
•	SC04
•	SC06
•	SD11
•	SE01
•	SG11
•	SG12
•	SG21
•	SG22
•	SG31
•	SG32
•	SI10
•	SI10T1
•	SM06
•	SO02
•	SO05
•	SP01
•	SP03
•	SP11
•	SPJE
•	SY01
•	SY02
•	SY04
•	SY06
•	SY12
•	SY14
•	SY17
•	SY23
•	SY25
•	SY30
•	SY31
•	SY34
•	SY40
•	SYE2
•	SYE4
•	NF19
•	NF21
•	NM01
•	NOPH02
•	NR01
•	NT01
•	OB01
•	OP02
•	OS01
•	OS10
•	OS11
•	OS13
•	OS16
•	OS23
•	PC00
•	PE
•	PH15
•	PHYS02
•	PHYS03
•	PHYS11
•	PHYS11T1
•	PHYS12
•	PIX
•	PO03
•	PO03T1
•	QO01
•	RE06
•	RE13
•	RE14
•	RE15
•	RE16
•	MA02
•	MA03
•	MA11
•	MA13
•	MATH02
•	MC01
•	ME01
•	ME02
•	ME05
•	ME09
•	ME10
•	MG06
•	MIC01
•	MIC02
•	MIC03
•	MIC04
•	MIC05
•	MM01
•	MM01T1
•	MP04
•	MP05
•	MP06
•	MQ01
•	MQ03
•	MQ07
•	MQ16
•	MQ21
•	IF26
•	IF28
•	IF37
•	IFE8
•	ISIC01
•	ISIC02
•	ISIC03
•	IT00
•	IT01
•	KO00
•	LC00
•	LC01
•	LE01
•	LE01T1
•	LE02
•	LE02T1
•	LE03
•	LE03R
•	LE03T1
•	LE08
•	LE08R
•	LE08T1
•	LE11
•	LE19
•	LEM1
•	LG00
•	LG01
•	LG02
•	LG03
•	LG10
•	LI03
•	LO01
•	LO14
•	LS00
•	LS01
•	LS02
•	LS03
•	LS08
•	LS10
•	LX10
•	FB2E
•	FB2P
•	FC1E
•	FQ01A
•	FQ54
•	GE04
•	GE10
•	GE18
•	GE21
•	GE21R
•	GE21T1
•	GE25
•	GE28
•	GE31
•	GE31T1
•	GE33
•	GE34
•	GE36
•	GE37
•	GE40
•	GE41
•	GE44
•	GL02
•	GP06
•	GP27
•	GP28
•	GS10
•	GS11
•	GS13
•	GS15
•	GS16
•	GS21
•	IF01
•	IF02A
•	IF06A
•	IF09
•	IF10
•	IF14
•	IF17
•	IF19
•	IF20
•	AP03
•	BI01
•	BI02
•	CL02
•	CL07
•	CL10
•	CLE1
•	CLE2
•	CM02
•	CM10
•	CM10T1
•	CS01
•	CS01A
•	CS03
•	CS06
•	CS22
•	DS01
•	EA07
•	EB02
•	EB03
•	EC01
•	EC02
•	EI01
•	EI01A
•	EN01
•	EN08
•	EP01
•	EV00A
•	EV01
•	EV02
•	EV04A
•	EV11
•	EV13
•	EV13T1
•	EV14
•	FA1E
•	FA2E
•	FB1E
•	FB1P	

Salles :
•	M207
•	S102
•	EXT1
•	C002
•	B106
•	A108
•	P203
•	A001
•	P202
•	J002
•	N101
•	P201
•	P104
•	P103
•	B105
•	S103
•	D002
•	B005
•	C104
•	D202
•	A103
•	A212
•	B101
•	C102
•	P101
•	S201
•	S104
•	C103
•	D101
•	C001
•	S203
•	S204
•	A002
•	S202
•	A105
•	C105
•	SPOR
•	A206
•	G002
•	A208
•	D206
•	S101
•	A210
•	C204
•	C205
•	C206
•	C210
•	A205
•	A207
•	B103
•	B201
•	B202
•	B203
•	B204
•	B205
•	B210
•	D105
•	J105
•	M102
•	C201
•	C203
•	C207
•	C101
•	C204
•	S001
•	M204
•	S002
•	B001
•	D106
•	J004

Les tests:
Ils jouent un rôle essentiel dans nos spécifications en détectant rapidement toute anomalie potentielle. Cruciaux pour vérifier l'existence des informations requises, repérer des problèmes dans le fichier ou des incohérences dans les données, ils prennent la forme d'instructions "if" à différents niveaux des spécifications. Ces tests nous aident à localiser les potentielles erreurs et à en comprendre leur nature.