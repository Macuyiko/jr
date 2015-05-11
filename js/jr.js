var jr = {
	renderAttribute : 'data-renderjunior',
	styles : [
		'/themes/default.css'
	],
	scripts : [
		'/js/showdown.js'
	],
};

jr.plugins = {}

jr.plugins.date = function(value) {
	try {
		var date = new Date(Date.parse(value));
		if(date) {
			return date.toLocaleDateString("i");
		}
	} catch (e) {
		console.log(e);
	}
}

jr.plugins.time = function(value) {
	try {
		var date = new Date(Date.parse(value));
		if(date) {
			return date.toLocaleTimeString("i");
		}
	} catch (e) {
		console.log(e);
	}
}

jr.plugins.gist = function(gistId, element){
	var callbackName = "gist_callback";
	window[callbackName] = function (gistData) {
		
		delete window[callbackName];
		var html = '<link rel="stylesheet" href="' + gistData.stylesheet + '"></link>';
		html += gistData.div;

		var gistContainer = document.createElement('div');
		gistContainer.innerHTML = html;

		element.parentNode.replaceChild(gistContainer, element);
	};

	var script = document.createElement("script");
	script.setAttribute("src", "https://gist.github.com/" + gistId + ".json?callback=" + callbackName);
	document.body.appendChild(script);
}

jr.traverseChildNodes = function(node) {
	var next;

	if (node.nodeType === 1) {

		// (Element node)
		if (node = node.firstChild) {
			do {
				// Recursively call traverseChildNodes on each child node
				next = node.nextSibling;
				jr.traverseChildNodes(node);
			} while(node = next);
		}

	} else if (node.nodeType === 3) {

		// (Text node)
		node.data.replace(/\[(\w+):([^\]]+)\]/g, function(match, plugin, value) {
		
			if(jr.plugins[plugin]) {

				if(value = jr.plugins[plugin](value, node)) {
					if(typeof value === "string") {
						node.data = node.data.replace(match, value);
					} else if(typeof value === "Node") {
						node.parentNode.insertBefore(value, node);
						node.parentNode.removeChild(node);
					}
				}
			}
		});
	}
};

jr.loadScript = function(src) {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = src;
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(s);
};

jr.loadStyle = function(href, media) {
	var s = document.createElement('link');
	s.type = 'text/css';
	s.media = media || 'all';
	s.rel = 'stylesheet';
	s.href = href;
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(s);
};

jr.render = function(element, content, converter) {
	if (!content)
		content = element.innerHTML;
	if (!converter)
		converter = new Showdown.converter({extensions: ['github', 'prettify', 'table'] });
	var html = converter.makeHtml(element.innerHTML);
	var myDiv = document.createElement("div");
	myDiv.className = element.className || 'wrapper';
	myDiv.innerHTML = html;
	element.parentNode.replaceChild(myDiv, element);

	jr.traverseChildNodes(myDiv);
	for (var x in {'h2':0,'h3':0,'h4':0,'h5':0}) {
		var headers = document.getElementsByTagName(x);
		for (var i = headers.length - 1; i >= 0; i--) {
			if(Date.parse(headers[i].innerHTML.replace(/(th|st|nd|rd)/g, ''))) {
				headers[i].className += ' date';
			}
		}
	}
}

jr.run = function() {
	var id = window.location.pathname.replace(/\W+/g, '-').replace(/^\-|\-$/g, '');
	var docBody = document.getElementsByTagName("body")[0];
	var converter = new Showdown.converter({extensions: ['github', 'prettify', 'table'] });
	
	docBody.id = id || 'index';
	
	var renderTargets = document.getElementsByTagName("pre");
	for (var i = renderTargets.length - 1; i >= 0; i--) {
		if (renderTargets[i].getAttribute(jr.renderAttribute) !== null)
		jr.render(renderTargets[i], null, converter);
	}
	
	var el = document.getElementsByTagName('h1');
	if(el.length && el[0]) {
		document.title = el[0].innerHTML;
	}
};

jr.ajax = function(url, callback, data)
{
	var x = new(window.ActiveXObject||XMLHttpRequest)('Microsoft.XMLHTTP');
	x.open(data ? 'POST' : 'GET', url, 1);
	x.setRequestHeader('X-Requested-With','XMLHttpRequest');
	x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	x.onreadystatechange = function() {
		x.readyState > 3 && callback && callback(x.responseText, x);
	};
	x.send(data);
};

jr.fireWhenReady = function() {
	var timeout, b=4;
	if (typeof window.Showdown != 'undefined') {
		jr.run();
	} else {
		timeout = setTimeout(jr.fireWhenReady, 100);
	}
};

(function () {
	// Load styles first
	for (var i = jr.styles.length - 1; i >= 0; i--) {
		jr.loadStyle(jr.styles[i]);
	}
	for (var i = jr.scripts.length - 1; i >= 0; i--) {
		jr.loadScript(jr.scripts[i]);
	}
	jr.fireWhenReady();
})();