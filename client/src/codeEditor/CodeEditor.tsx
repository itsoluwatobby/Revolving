import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { BiCodeAlt } from 'react-icons/bi'
import { TextRules, sensitiveWords } from "../fonts";
import RevolvingEditor from 'react-monaco-editor';

type CodeType = {
  name: string,
  language: string,
  defaultValue: string
}
const language: string[] = ["python", "javascript", "typescript", 'html']

type FileType = Record<string, CodeType>

const files: FileType = {
  "python":{
    name: "script.py",
    language: 'python',
    defaultValue: "print('Welcome to python')"
  },
  "javascript":{
    name: "javascript.js",
    language: 'javascript',
    defaultValue: "console.log('Welcome to javascript')"
  },
  "typescript":{
    name: "typescript.ts",
    language: 'typescript',
    defaultValue: "const name: string = 'Typescript'\nconsole.log('Welcome to ', name)"
  },
  "html":{
    name: "index.html",
    language: 'html', 
    defaultValue: "<div>Hello here</div>"
  }
}

export default function CodeBlock() {
  const { theme } = useThemeContext() as ThemeContextType;
  const [filename, setFilename] = useState<{name?:string,value?:string}>({
    name: 'python', value: 'print(\'Welcome to python\')'
  });
  const [options, setOptions] = useState<string>('');
  const [value, setValue] = useState<string>('');
  // const codeRef = useRef(null)
//: editor.IModelContentChangedEvent
  const handleChange = (newValue: string) => setValue(newValue)
  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus()
  }

  useEffect(() => {
    setValue(files[filename.name as keyof FileType].defaultValue)
  }, [filename.name])

  return (
    <section className="code_page w-full flex flex-col gap-2">

      <div className="flex items-center justify-evenly border mb-0">
        {
          language.map(name => (
            <p 
              onClick={() => setFilename({name: name})}
              className="cursor-pointer border border-t-0 border-b-0 px-6 border-l-0 last:border-r-0 capitalize"
              key={name}>{name}
            </p>
          ))
        }
      </div>
       <RevolvingEditor 
        height='80%'
        width='100%'
        theme='vs-dark'
        language={filename.name}
        value={value}
        defaultValue={'options'}
        onChange={handleChange}
        editorDidMount={editorDidMount}
       />
    </section>
  )
}

{/*
  <textarea 
          className='editor' 
          role='Code Editor' 
          onChange={handleChange}
          spellCheck={true}
          aria-label='Code Editor'
        />
        <div 
          className='editorsss' 
          role='Code Editor'
        >
          {element}
        </div>
*/}