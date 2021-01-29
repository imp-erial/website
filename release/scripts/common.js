var base = $('script[src$="common.js"]').attr("src").replace("common.js", "");

var count = 0;
function retr() {
	if (++count == 3) {
		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block, postProcess);
		});
	}
}
$.getScript(base + "highlight.js", function () {
	hljs.configure({
		tabReplace: "    ",
	});
	$.getScript(base + "languages/json.js", retr);
	$.getScript(base + "languages/python.js", retr);
	$.getScript(base + "languages/rpl.js", retr);
})

function postProcess(block) {
	var $block = $(block);
	if ($block.hasClass("rpl")) {
		matchBrackets($block, {
			"body": [/^\{/, /\}$/],
			"string": [/^@?(`+|['"\u2018-\u201F\u300C\u300E«»\u2039\u203A])/, /(`+|.)$/],
			"list": [/^\[/, /\]$/],
			"wrap": [/^\(/, /\)$/],
			"math-group": [/^(&[^;]+;|.)/, /(&[^;]+;|.)$/],
		});

		$block.find('.hljs-string span[class^="highlight-"]:first-child').each(function () {
			var $this = $(this);
			var html = $this.html();
			if (html.charAt(0) == "@") {
				$this.html('<span class="hljs-meta">@</span>' + html.substr(1));
			}
		})
	}
}

var pairIdx = 0;
function matchBrackets($block, forms) {
	for(var className in forms) {
		var blocks = $block.find(".hljs-" + className).toArray();
		function doWrap(the) {
			var $this = $(the);
			var html = $this.html();
			var m1 = html.match(forms[className][0]);
			if (m1) {
				var m2 = html.match(forms[className][1]);
				if (m2) {
					$this.html(
						html.substring(0, m1.index)
						+ '<span class="highlight-' + pairIdx + '">' + m1[0] + '</span>'
						+ html.substring(m1.index + m1[0].length, m2.index)
						+ '<span class="highlight-' + pairIdx + '">' + m2[0] + '</span>'
						+ html.substring(m2.index + m2[0].length)
					);
					$this.find(".highlight-" + pairIdx);
					++pairIdx;

					// Update child element references.
					var children = $this.find(".hljs-" + className);
					for (var i = 0; i < children.length; i++) {
						blocks[i] = children.get(i);
					}
				}
			}
		}
		// So blocks can update
		while (blocks.length) {
			doWrap(blocks.shift());
		}
	}

	// Hook separately so they aren't lost during destruct .htmls
	for (var i = 0; i < pairIdx; i++) {
		$(".highlight-" + i).hover(highlightPair(i), unhighlightPair(i));
	}
}

function highlightPair(idx) {
	var className = ".highlight-" + idx;
	return function () {
		$(className).addClass("highlight-bracket");
	}
}

function unhighlightPair(idx) {
	var className = ".highlight-" + idx;
	return function () {
		$(className).removeClass("highlight-bracket");
	}
}
