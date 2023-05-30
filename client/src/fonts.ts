type FontProp = {
  [index: string] : string
}

type TextProp = {
  [index: string]: string | string[] | object
  codeBlock: {
    [index: string]: string | string[]
  }
}

export const custom_fonts: FontProp = {
  'open_sans': 'Open sans', 
  'poppins_style': 'Poppins', 
  'font_style': 'Roboto', 
  'inter_style': 'Inter', 
  'dancing_style': 'Dancing script', 
  'dosis_style': 'Dosis', 
}

export const sensitiveWords: Record<string, string> = {
  "class": "red",
  "function": "blue",
  "var": "green",
};

export const TextRules: TextProp = {
  boldText: '*' || '**', // text bold
  italics: '_', // italize words
  functions: '()', // watches out for functions
  highlight: '++',
  keywords: ['null', 'let', 'undefined', 'typeof', 'error', 'var', 'const', 'if (', 'else if (', 'else', 'while (', 'elif', 'switch (', 'class', 'enum', 'constructor', 'Pick', 'instanceof', 'prototype', 'Partial', 'boolean', 'booleans', 'number', 'string', 'function'] as string[], 
  codeBlock: { // code block rules
    backStrokes: '`',
    quotes: '"' as string,
    operators: ['!', '{', '}', '(', ')', '=', '==', '!=', '<', '>', '[', ']', ':', ';', '+', '-', '/', '?', '^', '*', '%', '$', '`', '&', '||','+=', '-=', '/=', '++', '=>', '--'],
    comments: ['//', '/*', '*\\']
  }
 // creates a code-like background
}

export const modal = {
  signIn: 'sign In', 
  settings: 'settings', 
  signout: 'sign out', 
  signUp: 'sign Up'
}
