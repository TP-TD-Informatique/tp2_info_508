const request = function(url, funOk, funErr) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			funOk(this.responseText);
		} else if (this.status == 502) {
			funErr(this.responseText);
		}
	};
	xmlhttp.open("GET", url);
	xmlhttp.send();
};

const baseUrl = "http://mongo.learninglab.eu/gr1_info9/";

// _.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-.
// Nombre de personnes qui ont coché "Ceci n'est pas un test"
request(baseUrl + "coll/checked", function(data) {
	Pie(data, "containerChecked");
},
function (err) {
	document.getElementById("containerChecked").innerText = err;
});

// Nombre de personnes par première lettre du prénom
request(baseUrl + "coll/name", function(data) {
	VerticalBar(data, "containerName", 'Nombre de personnes', "Première lettre du prénom");
},
function (err) {
	document.getElementById("containerName").innerText = err;
});

//Nombre de personnes par filière
request(baseUrl + "coll/field", function(data) {
	VerticalBar(data, "containerField", 'Nombre de personnes', "Filière");
},
function (err) {
	document.getElementById("containerField").innerText = err;
});

// Nombre de personnes selon leur moyen de locomotion
request(baseUrl + "coll/locomotion", function(data) {
	VerticalBar(data, "containerLocomotion", 'Nombre de personnes', "Moyen de locomotion");
},
function (err) {
	document.getElementById("containerLocomotion").innerText = err;
});

// Nombre de personnes qui prennent le bus par niveau d’affluence
request(baseUrl + "coll/affluence", function(data) {
	Pie(data, "containerAffluence");
},
function (err) {
	document.getElementById("containerAffluence").innerText = err;
})

// Proportion des personnes qui viennent en voiture et font du covoiturage
request(baseUrl + "coll/covoiturage", function(data) {
	var data = JSON.parse(data);
	var car = 1;
	var pooling = 1;
	for (val in data) {
		var j = data[val];
		if (j._id == "car") {
			car = Number(j.value);
		} else {
			pooling = Number(j.value);
		}
	}

	var percent = pooling / car * 100;
	percent = percent + "";
	document.getElementById("containerCovoiturage").innerText = percent.substr(0, 5) + "%";
},
function (err) {
	document.getElementById("containerCovoiturage").innerText = err;
});

// Temps de déplacement moyen pour chaque moyen de locomotion utilisé
request(baseUrl + "coll/times", function(data) {
	VerticalBar(data, "containerTimes", 'Temps en minutes', "Moyen de locomotion");
},
function (err) {
	document.getElementById("containerTimes").innerText = err;
});

// Moyen de locomotion du plus satisfaisant au moins satisfaisant en donnant le nombre de personnes à chaque fois
request(baseUrl + "coll/satisf", function(data) {
	data = JSON.parse(data);
	var d = [];
	for (val in data) {
		var j = data[val];
		d.push({_id:j._id, value:j.value.nb});
	}
	VerticalBar(JSON.stringify(d), "containerSatisf", "Nombre de personnes", "Moyen de locomotion");
},
function (err) {
	document.getElementById("containerSatisf").innerText = err;
});

// Distance qui sépare chaque personne du campus
request(baseUrl + "coll/distance", function(data) {
	data = JSON.parse(data);
	var d = [];
	for (val in data) {
		var j = data[val];
		request(baseUrl + "distance/" + j._id, function(data) {
			j.push({_id:data, value:j.value});
		});
	}
	VerticalBar(JSON.stringify(d), "containerDist", "Nombres de personnes", "distance");
},
function (err) {
	document.getElementById("containerDist").innerText = err;
});

// nbPersonnes
request(baseUrl + "coll/all", function(data) {
	data = JSON.parse(data);
	document.getElementById("nbPersonnes").innerText = data.length;
},
function(err) {
	document.getElementById("nbPersonnes").innerText = err;
});


// _.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-.
// Animation jQuery
$('.view > h3 > i').on('click', function () {
	let id = '#' + this.id;
	$(id).toggleClass('--turn');
	id = id.substring(0, id.length-1);
	$(id).toggleClass('--unvisible');
})