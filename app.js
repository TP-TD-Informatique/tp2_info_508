const express = require("express");
const { emit } = require("process");
const app = express();

// Lancement de l'application
app.use(express.urlencoded({extended: true}));
app.use("/", express.static(__dirname + "/public"));
app.listen("11009", function() {
    console.log("L'application est lancée...");
});


// Connexion à MongoDB
const MongoClient = require("mongodb").MongoClient;
var db = null;
MongoClient.connect(
    "mongodb://info508:info508@localhost:27017/info508",
    { useUnifiedTopology: true },
    function(err, client) {
        if (err != null) {
            console.log("\033[31m>>> Erreur lors de la connexion à MongoDB\033[0m");
        } else {
            console.log("Connecté à MongoDB");
            db = client.db("info508");
        }
    }
);


// Ajout de la route /distance/{ville}
app.use("/distance/:city", function(req, res) {
	const path = "/route.json?stops=Bourget-Du-Lac|" + encodeURI(req.params.city);
	
	var data = "";
	require("https").request({
		host: "fr.distance24.org",
		path: path,
		port: 443,
		method: "GET"
	}, function(result) {
		result.setEncoding("utf-8");
		result.on("data", (chunk) => {
			data += chunk;
		});
		result.on("end", () => {
			const d = JSON.parse(data);
			console.log("\033[32m" + path + " --> " + d.distance + "\033[0m");
			res.status(200).send(`${d.distance}`);
		});
	}).end();
});


// Ajout des services pour interroger la collection
const coll = "locomotion";
const errorMessage = "Erreur de chargement";
// Renvoie tout les documents
app.use("/coll/all", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			emit(this["_id"], this);
		},
		function(key, values) {
			return values;
		},
		{out: {inline: 1}},
		function(err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/all\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Coché ou pas ?
app.use("/coll/checked", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["no-test"]) {
				emit("check", 1);
			} else {
				emit("no-check", 1);
			}
		},
		function(key, values) {
			return Array.sum(values);
		},
		{out: {inline: 1}},
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/checked\033[0m");
				res.status(200).send(data)
			}
		}
	);
});
// Nombre d'étudiant par première lettre du prénom
app.use("/coll/name", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			var name = this["first-name"]
			if (name)
				name = name[0];
			emit(name, 1);
		},
		function(key, values) {
			return Array.sum(values);
		},
		{out: {inline: 1}},
		function(err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/name\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Nombre d'étudiants par filière
app.use("/coll/field", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			emit(this["field"], 1);
		},
		function(key, values) {
			return Array.sum(values);
		},
		{out: {inline: 1}},
		function(err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/field\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Nombre d'étudiant pas moyen de locomotion
app.use("/coll/locomotion", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["car-time"]) {
				emit("car", 1);
			}
			if (this["bus-time"]) {
				emit("bus", 1);
			}
			if (this["foot-time"]) {
				emit("foot", 1);
			}
			if (this["moto-time"]) {
				emit("moto", 1);
			}
			if (this["bike-time"]) {
				emit("bike", 1);
			}
		},
		function(key, values) {
			return Array.sum(values);
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/locomotion\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Nombre d'étudiant en fonction de l'affluence du bus
app.use("/coll/affluence", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["bus-affluence"]) {
				emit(this["bus-affluence"], 1);
			}
		},
		function(key, values) {
			return Array.sum(values);
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/affluence\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Nombre d'étudiants qui font du covoiturage par rapport à ceux qui prennent la voiture
app.use("/coll/covoiturage", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["car-pooling"]) {
				emit("pooling", 1);
			}
			if (this["car-time"]) {
				emit("car", 1);
			}
		},
		function(key, values) {
			return Array.sum(values);
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/covoiturage\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Temps moyen pour chaque moyen de locomotion
app.use("/coll/times", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["car-time"]) {
				emit("car", Number(this["car-time"]));
			}
			if (this["bus-time"]) {
				emit("bus", Number(this["bus-time"]));
			}
			if (this["foot-time"]) {
				emit("foot", Number(this["foot-time"]));
			}
			if (this["moto-time"]) {
				emit("moto", Number(this["moto-time"]));
			}
			if (this["bike-time"]) {
				emit("bike", Number(this["bike-time"]));
			}
		},
		function(key, values) {
			return Array.sum(values) / values.length;
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/times\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Moyens de locomotion trié selon du plus satisfaisant au moins satisfaisant avec le nombre d'étudiants
app.use("/coll/satisf", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["car-feeling"]) {
				emit("car", Number(this["car-feeling"]));
			}
			if (this["bus-feeling"]) {
				emit("bus", Number(this["bus-feeling"]));
			} 
			if (this["bike-feeling"]) {
				emit("bike", Number(this["bike-feeling"]));
			}
			if (this["foot-feeling"]) {
				emit("foot", Number(this["foot-feeling"]));
			} 
			if (this["moto-feeling"]) {
				emit("moto", Number(this["moto-feeling"]));
			}
		},
		function(key, values) {
			const moy = Array.sum(values) / values.length;
			return {"average": moy, "nb": values.length};
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/satisf\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Fourchette de valeurs distance / nbr d'étudiants
app.use("/coll/distance", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			if (this["city"]) {
				emit(this["city"], 1);
			}
		},
		function(key, values) {
			return Array.sum(values);
		},
		{ out: { inline: 1 } },
		function (err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
				res.status(502).send(errorMessage);
			} else {
				console.log("\033[32m/coll/distance\033[0m");
				res.status(200).send(data);
			}
		}
	);
});