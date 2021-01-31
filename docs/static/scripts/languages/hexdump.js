/*
Language: hexdump
Author: Sapphire Becker (logicplace.com)
Category: unix utilities
*/

hljs.registerLanguage("hexdump", function (hljs) {
	var HEADER = {
		begin: /^#+/, end: /$/,
		className: 'title',
		contains: [
			{
				begin: /\b[0-9a-fA-F]\b/,
				className: 'strong'
			}
		]
	};
	var LINE = {
		begin: /^[0-9a-fA-F]+/, end: /$/,
		returnBegin: true,
		contains: [
			{
				begin: /^[0-9a-fA-F]+/,
				className: 'tag hljs-strong' // a hack...
			},
			{
				endsWithParent: true,
				contains: [
					{
						begin: /\|/, end: /\|/,
						endsWithParent: true,
						className: 'comment'
					},
					{
						begin: /[0-9a-fA-F]+/,
						className: 'number'
					}
				]
			}
		]
	};
	return {
		contains: [HEADER, LINE],
	};
});
