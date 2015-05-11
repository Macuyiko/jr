var jsinclude = { includeAttribute : 'data-include' };

jsinclude.getAllElementsWithAttribute = function(attribute) {
	var matchingElements = [];
	var allElements = document.getElementsByTagName('*');
	for (var i = 0, n = allElements.length; i < n; i++) {
		if (allElements[i].getAttribute(attribute) !== null) {
			matchingElements.push(allElements[i]);
		}
	}
	return matchingElements;
};

jsinclude.loadBlock = function(file, el) {
	jr.ajax(file, function(html) {
		if(!html) return;
		var e = document.createElement('div');
		e.innerHTML = html;
		while(e.firstChild) { el.appendChild(e.firstChild); }
	});
};

jsinclude.ajax = function(url, callback, data) {
	var x = new(window.ActiveXObject||XMLHttpRequest)('Microsoft.XMLHTTP');
	x.open(data ? 'POST' : 'GET', url, 1);
	x.setRequestHeader('X-Requested-With','XMLHttpRequest');
	x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	x.onreadystatechange = function() {
		x.readyState > 3 && callback && callback(x.responseText, x);
	};
	x.send(data);
};

(function () {
	var elements = jsinclude.getAllElementsWithAttribute(jsinclude.includeAttribute);
	for (var i = 0, n = elements.length; i < n; i++) {
		jsinclude.loadBlock(elements[i].getAttribute(jsinclude.includeAttribute), elements[i]);
	}
})();

