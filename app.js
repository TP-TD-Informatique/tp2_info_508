const express = require("express");
const app = express();

// Lancement de l'application
app.use(express.urlencoded({extended: true}));
app.use("/", express.static(__dirname + "/public"));
app.listen("11009", function() {
    console.log("L'application est lancée...");
});


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