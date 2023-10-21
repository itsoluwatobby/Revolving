import { FontProp, TextProp } from "./types/data";

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
  boldText: '*', // text bold
  italics: '_', // italize words
  functions: '()', // watches out for functions
  highlight: '++',
  inbuilts: ['console'],
  async: ['try{}'],
  dotWords: ['.slice()', '.log()', '.then()', '.catch()', '.includes()', '.startsWith()', '.endsWith()', '.split()', '.splice()', '.isArray()', '.sort()', '.map()', '.forEach()', '.reduce()', '.find()', '.filter()', '.trim()', '.every()', '.toString()', '.toFixed()'],
  dataTypes: ['int', 'String', 'Boolean', 'Object', 'double', 'float', 'list', 'dict'],
  converters: ['parseInt', 'Number', 'Boolean', 'Array'],
  typescript: ['Partial', 'Exclude', 'Extract', 'Omit', 'type', 'keyof', 'Record', 'Awaited', 'raise', 'string', 'boolean', 'number', 'object', 'const', 'Pick'],
  keywords: ['null', 'let', 'undefined', 'typeof', 'error', 'var', 'const', 'if (', 'else if (', 'else', 'while (', 'elif', 'switch (', 'class', 'className', 'type', 'interface', 'enum', 'constructor', 'instanceof', 'prototype', 'Partial', 'boolean', 'booleans', 'function'] as string[], 
  codeBlock: { // code block rules
    backStrokes: '`',
    quotes: '"' as string,
    singleQuotes: "'" as string,
    operators: ['!', '{', '}', '(', ')', '=', '==', '!=', '<', '>', '[', ']', ':', ';', '+', '-', '/', '?', '^', '*', '%', '$', '`', '&', '||','+=', '-=', '/=', '++', '>=', '<=', '--'],
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
