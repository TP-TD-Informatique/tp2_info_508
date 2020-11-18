const express = require("express");
const app = express();

// Lancement de l'application
app.use(express.urlencoded({extended: true}));
app.use("/", express.static(__dirname + "/public"));
app.listen("11009", function() {
    console.log("L'application est lancée...");
});