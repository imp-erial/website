/*
Language: RPL
Author: Sapphire Becker (logicplace.com)
Category: 
*/

hljs.registerLanguage("rpl", function(hljs) {
	function keywords2re(kws) {
		// TODO: Escapes?
		return new RegExp(kws.join('|'), "i");
	}
	var SPACE_COMMENT = '(\\s+|#.*$)*';
	var NUMBER_RE = '(\\$[\\da-fA-F]+|\\d+)';
	var AFTER_NUMBER = '(\\s*([,#:(){}\\[\\]]|$))';
	var NUMBER = {
		className: 'number',
		begin: NUMBER_RE, afterBegin: AFTER_NUMBER,
	};
	var RANGE = {
		className: 'number',
		begin: NUMBER_RE + '(\\+-|[+\\-~*])' + NUMBER_RE,
		afterBegin: AFTER_NUMBER,
		relevance: 4,
	};
	var REFERENCE = {
		className: 'meta',
		variants: [
			{ begin: /@\[/, end: /\]/, },
			{ begin: /@\(/, end: /\)/, },
			{ begin: /@/, afterEnd: /\s+\S/, },
		],
		contains: [
			{
				// Key name
				classEnd: 'attribute',
				begin: /\./, end: /[\w\d]+/,
				contains: [
					hljs.HASH_COMMENT_MODE,
				],
				illegal: /\S/,
			},
			{
				// Struct name
				className: 'title',
				begin: /[\w\d]+/,
			},
			{
				// Index
				className: 'list',
				begin: /\[/, end: /\]/,
				contains: [
					hljs.HASH_COMMENT_MODE,
					NUMBER,
					// REFERENCE
				],
			},
		],
	};
	REFERENCE.contains[2].contains.push(REFERENCE);
	var ESCAPE = {
		className: 'subst',
		begin: /\$([0-9a-fA-F]{2}|\([0-9a-fA-F]+\)|[^0-9a-fA-F])/,
		relevance: 2,
	};
	var STRING_VARIANTS = [
		// Double quotes.
		{ begin: /@?"/, end: /"|$/ },
		{ begin: /@?\u201C/, end: /[\u201C\u201D]|$/, relevance: 10 },
		{ begin: /@?\u201D/, end: /[\u201D\u201E]|$/, relevance: 10 },
		{ begin: /@?\u201E/, end: /[\u201C\u201D]|$/, relevance: 10 },
		{ begin: /@?\u201F/, end: /[\u201F\u201D]|$/, relevance: 10 },
		// Single quotes.
		{ begin: /@?'/, end: /'/ },
		{ begin: /@?\u2018/, end: /[\u2018\u2019]|$/,  relevance: 10 },
		{ begin: /@?\u2019/, end: /[\u2018-\u201A]|$/, relevance: 10 },
		{ begin: /@?\u201A/, end: /[\u2018\u2019]|$/,  relevance: 10 },
		{ begin: /@?\u201B/, end: /[\u201B\u2019]|$/,  relevance: 10 },
		// CJK quotes.
		{ begin: /@?\u300C/, end: /\u300D|$/, relevance: 10 },
		{ begin: /@?\u300E/, end: /\u300F|$/, relevance: 10 },
		// Guillemets.
		{ begin: /@?«/, end: /»|$/,           relevance: 10 },
		{ begin: /@?»/, end: /[«»]|$/,        relevance: 10 },
		{ begin: /@?\u2039/, end: /\u203A|$/, relevance: 10 },
		{ begin: /@?\u203A/, end: /\u2039|$/, relevance: 10 },
		// Dashes.
		{ begin: /@?(--|[\u2013-\u2015])/, end: /$/ },
	];
	var STRING = {
		className: 'string',
		contains: [ESCAPE, REFERENCE],
		variants: STRING_VARIANTS,
	};
	var MULTILINE_STRING = {
		className: 'string',
		contains: [ESCAPE, REFERENCE],
		variants: [
			// Multi-line string.
			{ begin: /@?````/, end: /````/, relevance: 10 },
			{ begin: /@?```/, end: /```/, relevance: 10 },
			{ begin: /@?``/, end: /``/ },
			{ begin: /@?`/, end: /`/ },
		],
		starts: {
			end: /$/, afterEnd: /\s*([^\s`]|(?!@`)@[^`])/, endsParent: true,
			contains: [
				hljs.HASH_COMMENT_MODE,
				// MULTILINE_STRING
			],
		},
	};
	MULTILINE_STRING.starts.contains.push(MULTILINE_STRING);
	var MATH_GROUP = {
		className: 'math-group',
		endsWithParent: true, endsParent: true,
		contains: undefined, // MATH_NUMBER
		starts: undefined, // MATH_SYMBOL
	}
	var MATH_NUMBER = {
		classEnd: 'number',
		end: /[+\-]?(\d+|(\$\$|0x)[\da-fA-F]+|0o?[0-7]+|(%|0b)[01]+|[\da-zA-Z]+_0*(3[0-6]|[12]\d|[2-9]))/,
		endsWithParent: true,
		starts: undefined, // MATH_SYMBOL
		contains: [
			hljs.inherit(REFERENCE, {endsWithParent: true, endsParent: true}),
			hljs.inherit(MATH_GROUP, {begin: /<(?!<)/, end: />(?!>)/}),
		]
	};
	var MATH_SYMBOL = {
		classEnd: 'symbol',
		end: /<<|>>|\*\*|[*/%+\-&^|]/, endsWithParent: true,
		starts: undefined, // MATH_NUMBER
	};
	var MATH_NUMBER_PARENS = hljs.inherit(MATH_NUMBER);
	MATH_NUMBER_PARENS.contains.push(
		hljs.inherit(MATH_GROUP, {begin: /\(/, end: /\)/})
	)
	function newMath(mathNum) {
		var num = hljs.inherit(mathNum);
		num.starts = hljs.inherit(MATH_SYMBOL);
		//num.starts.starts = num; // wat
		for (var thing=num.contains, i = thing.length - 1; i > 0; --i) {
			var n = hljs.inherit(mathNum);
			n.starts = hljs.inherit(MATH_SYMBOL);
			n.starts.starts = n;
			thing[i].contains = [n];
			thing[i].starts = num.starts;
		}
		return num;
	}
	var MATH_LITERAL = {
		className: 'math',
		begin: /\+/, end: /$|[{}\[\]()#,:]/, excludeEnd: true,
		contains: [newMath(MATH_NUMBER)],
	};
	var MATH_STRING = {
		className: 'math',
		begin: /(--|[\u2013-\u2015])\+/, end: /$/,
		contains: [newMath(MATH_NUMBER_PARENS)],
	};
	var KEYWORD_LITERAL = {
		className: 'keyword',
		begin: keywords2re([
			'false',
			'true',
			'undefined',
			'black',
			'white',
			'red',
			'blue',
			'green',
			'yellow',
			'magenta',
			'pink',
			'cyan',
			'gray', 'grey',
			'transparent',
			'byte',
			'short',
			'long',
			'double',
			'LRUD',
			'LRDU',
			'RLUD',
			'RLDU',
			'UDLR',
			'UDRL',
			'DULR',
			'DURL',
			'LU',
			'LD',
			'RU',
			'RD',
			'UL',
			'UR',
			'DL',
			'DR',
			'big',
			'little',
		]),
	}
	var LITERAL = {
		className: 'string',
		begin: /[^\s{}\[\]()#,:][^\n\r{}\[\]()#,:]*/,
	};
	var LIST = {
		className: 'list',
		begin: /\[/, end: /\]/,
		contains: [ /* VALUE_CONTAINER */ ],
	};
	var VALUE_CONTAINER = {
		className: 'value', classEnd: 'symbol',
		end: /::?/, endsWithParent: true,
		starts: 'self',
		contains: [
			hljs.HASH_COMMENT_MODE,
			LIST,
			MATH_STRING,
			STRING,
			MULTILINE_STRING,
			RANGE,
			NUMBER,
			REFERENCE,
			MATH_LITERAL,
			KEYWORD_LITERAL,
			LITERAL,
		],
	};
	LIST.contains.push(hljs.inherit(VALUE_CONTAINER));
	var MATH_KEYSTRUCT = {
		className: 'math', classBegin: 'literal',
		begin: /\s*math/, afterBegin: SPACE_COMMENT + '\\(', end: /\(/, excludeEnd: true,
		starts: {
			className: 'wrap',
			begin: /\(/, end: /\)/,
			contains: [
				// All string variants.... including literal
			],
		},
	};
	for (var i = STRING_VARIANTS.length - 2; i >= 0; --i) {
		MATH_KEYSTRUCT.starts.contains.push(
			hljs.inherit(STRING_VARIANTS[i], {
				className: 'string',
				contains: [newMath(MATH_NUMBER_PARENS)]
			})
		);
	}
	MATH_KEYSTRUCT.starts.contains.push(newMath(MATH_NUMBER));
	var KEY_STRUCT = {
		classBegin: 'literal',
		begin: '\\s*\\w+\\d*', excludeEnd: true,
		contains: [
			hljs.HASH_COMMENT_MODE,
		],
	};
	var KEY_STRUCT_PARENS = hljs.inherit(KEY_STRUCT, {
		afterBegin: SPACE_COMMENT + '\\(', end: /\(/,
		starts: {
			className: 'wrap',
			begin: /\(/, end: /\)/,
			contains: [ hljs.inherit(VALUE_CONTAINER) ],
		},
	});
	var KEY_STRUCT_LIST = hljs.inherit(KEY_STRUCT, {
		afterBegin: SPACE_COMMENT + '\\[', end: /\[/,
		starts: LIST,
	});
	var KEY_STRUCT_STRUCT = hljs.inherit(KEY_STRUCT, {
		afterBegin: SPACE_COMMENT + '\\{', end: /\{/,
		starts: undefined, // STRUCT_BODY
	});
	var STRUCT_BODY = {
		className: 'body',
		begin: /\{/, end: /\}/,
		contains: [
			hljs.HASH_COMMENT_MODE,
			{
				className: 'attribute',
				begin: /\s*(?![#\s])/, afterBegin: '(\\w+\\d*|' + NUMBER_RE +'|"($.|[^"]+)*"|“($.|[^“”]+)*[“”]|”($.|[^”„]+)*[”„]|„($.|[^“”]+)*[“”]|‟($.|[^‟”]+)*[‟”]|\'($.|[^\']+)*\'|‘($.|[^‘’]+)*[‘’]|’($.|[^‘’‚]+)*[‘’‚]|‚($.|[^‘’]+)*[‘’]|‛($.|[^‛’]+)*[‛’]|『($.|[^』]+)*』|「($.|[^」]+)*」|«($.|[^»]+)*»|»($.|[^«»]+)*[«»]|‹($.|[^›]+)*›|›($.|[^‹]+)*‹)' + SPACE_COMMENT + ':', end: /:/,
				contains: [
					STRING,
					NUMBER,
					{ begin: /\w+\d*/ },
					hljs.HASH_COMMENT_MODE,
				],
				starts: {
					end: /,|\n/, endsWithParent: true,
					contains: [
						hljs.HASH_COMMENT_MODE,
						MATH_KEYSTRUCT,
						KEY_STRUCT_PARENS,
						KEY_STRUCT_LIST,
						KEY_STRUCT_STRUCT,
						hljs.inherit(VALUE_CONTAINER),
					],
				},
			},
			// STRUCT
		],
	};
	var STRUCT = {
		classBegin: 'literal',
		begin: '\\w+\\d*', end: /\{/, excludeEnd: true,
		contains: [
			{
				className: 'title',
				begin: /\w+/,
			}
		],
		starts: STRUCT_BODY,
	};
	STRUCT_BODY.contains.push(STRUCT);
	KEY_STRUCT_STRUCT.starts = STRUCT_BODY;
	return {
		contains: [
			hljs.HASH_COMMENT_MODE,
			STRUCT,
		]
	};
});