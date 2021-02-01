/*
Language: Yet Another BNF
Author: Sapphire Becker (logicplace.com)
Category: metalanguage
*/

hljs.registerLanguage("yabnf", function (hljs) {
	// Why aren't keywords working...
	let KEYWORDS = '\\. \\$ EOL EOP';
	let RULE_NAME = {
		begin: /[\w_][\w_\d]*/,
		className: 'attribute'
	}
	let RULE_SUBSCRIPTION = {
		begin: /[\w_][\w_\d]*\[/, end: /]/,
		returnBegin: true,
		className: 'attribute',
		contains: [RULE_NAME]
	}
	let REPEAT = {
		begin: /\{/, end: /}/,
		illegal: /[^\d, ]/,
		contains: [
			{
				begin: /\d+/,
				className: 'number',
				relevance: 0
			}
		]
	}
	let CHAR_CLASS = {
		begin: /\[/, end: /]/,
		className: 'string',
		contains: [
			{
				begin: /.-./,
				className: 'subst'
			}
		]
	}
	let RULE_CONTENTS = [
		hljs.HASH_COMMENT_MODE,
		RULE_SUBSCRIPTION,
		RULE_NAME,
		REPEAT,
		CHAR_CLASS,
		hljs.APOS_STRING_MODE,
		hljs.QUOTE_STRING_MODE,
		hljs.REGEXP_MODE,
	];
	let GROUP = {
		begin: /\(/, end: /\)/,
		contains: RULE_CONTENTS,
		keywords: KEYWORDS,
	}
	RULE_CONTENTS.push(GROUP);
	let RULE = {
		begin: /=/, end: /$/,
		contains: [
			{
				// If it immediately starts with a { it's a map
				begin: /^\{/, end: /}/,
				endsParent: true,
				contains: [
					{
						end: /:/,
						endsWithParent: true,
						contains: RULE_CONTENTS,
						keywords: KEYWORDS
					},
					{
						end: /,/,
						endsWithParent: true,
						contains: RULE_CONTENTS,
						keywords: KEYWORDS
					}
				]
			},
			...RULE_CONTENTS
		],
		keywords: KEYWORDS
	};
	return {
		contains: [
			hljs.HASH_COMMENT_MODE,
			RULE_NAME,
			RULE
		],
	};
});
