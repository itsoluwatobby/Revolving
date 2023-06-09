// import { useEffect, useRef, useState } from "react"
// import { useThemeContext } from "../hooks/useThemeContext";
// import { ThemeContextType } from "../posts";
// import { BiCodeAlt } from 'react-icons/bi'
// import { TextRules, sensitiveWords } from "../fonts";
// import RevolvingEditor from '@monaco-editor/react';

// const files={
//   "script.py":{
//     name: "script.py",
//     defaultLanguage: 'python',
//     defaultValue: "print('Welcome to python')"
//   },
//   "javascript.js":{
//     name: "javascript.js",
//     defaultLanguage: 'javascript',
//     defaultValue: "console.log('Welcome to javascript')"
//   },
//   "typescript.ts":{
//     name: "typescript.ts",
//     defaultLanguage: 'typescript',
//     defaultValue: "const name: string = 'Typescript'\nconsole.log('Welcome to ', name)"
//   },
//   "index.html":{
//     name: "javaindex.html",
//     defaultLanguage: 'html', 
//     defaultValue: "<div>Hello here</div>"
//   }
// }

// export default function CodeBlock() {
//   const { theme } = useThemeContext() as ThemeContextType;
//   const [filename, setFilename] = useState<string>('script.py');
//   const codeRef = useRef(null)
 

//   return (
//     <section className="single_page w-full flex flex-col gap-2">
//        <RevolvingEditor 
       
//         height='80%'
//         width='100%'
//         theme='vs-dark'
//         defaultLanguage="javascript"
        
//         defaultValue="Hello world"
//        />
//     </section>
//   )
// }

// {/*
//   <textarea 
//           className='editor' 
//           role='Code Editor' 
//           onChange={handleChange}
//           spellCheck={true}
//           aria-label='Code Editor'
//         />
//         <div 
//           className='editorsss' 
//           role='Code Editor'
//         >
//           {element}
//         </div>
// */}