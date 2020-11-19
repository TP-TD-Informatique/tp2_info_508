const express = require("express");
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
			} else {
				console.log("\033[32m/coll/all\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Renvoie le temps moyen en fonction de la ville d'habitation
app.use("/coll/times", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			var time;
			if (this["car-time"])
				time = this["car-time"];
			if (this["moto-time"])
				time = this["moto-time"];
			if (this["bus-time"])
				time = this["bus-time"];
			if (this["foot-time"])
				time = this["foot-time"];

			emit(this["city"], Number(time));
		},
		function(key, values) {
			return Array.sum(values) / values.length;
		},
		{out: {inline: 1}},
		function(err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
			} else {
				console.log("\033[32m/coll/times\033[0m");
				res.status(200).send(data);
			}
		}
	);
});
// Nombre d'étudiants par villes
app.use("/coll/cities", function(req, res) {
	db.collection(coll).mapReduce(
		function() {
			emit(this["city"], 1);
		},
		function(key, values) {
			return values.length;
		},
		{out: {inline: 1}},
		function(err, data) {
			if (err) {
				console.log("\033[31m>>> " + err + "\033[0m");
			} else {
				console.log("\033[32m/coll.cities\033[0m");
				res.status(200).send(data);
			}
		}
	);
});

