type FontProp = {
  [index: string] : string
}

type TextProp = {
  [index: string]: string | string[] | object
}

export const custom_fonts: FontProp = {
  'open_sans': 'Open sans', 
  'poppins_style': 'Poppins', 
  'font_style': 'Roboto', 
  'inter_style': 'Inter', 
  'dancing_style': 'Dancing script', 
  'dosis_style': 'Dosis', 
}

export const TextRules: TextProp = {
  boldText: '*' || '**', // text bold
  italics: '_', // italize wordds
  functions: '()', // watchees for functions
  highlight: '++',
  keywords: ['null', 'undefined', 'typeof', 'error', 'var', 'let', 'const', 'if (', 'else if (', 'else', 'while (', 'elif', 'switch (', 'class', 'enum', 'constructor'], 
  codeBlock: { // code block rules
    backStrokes: '```',
    operators: ['!', '{', '}', '(', ')', '=', '==', '!=', '<', '>', '[', ']', ':', ';', '+', '-', '/', '?', '^', '*', '%', '$', '`', '&', '||','+=', '-=', '/=', '++', '=>', '--'],
    comments: '//'
  }
 // creates a code-like background
}
