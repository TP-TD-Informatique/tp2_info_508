const request = function(url, id) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById(id).innerText = this.responseText;
		}
	};
	xmlhttp.open("GET", url);
	xmlhttp.send();
};
request("http://mongo.learninglab.eu/gr1_info9/distance/Chambery", "test");
request("http://mongo.learninglab.eu/gr1_info9/coll/times", "");
request("http;//mongo.learninglab.eu/gr1_info9/coll/cities", "");
