import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useThemeContext } from "../../hooks/useThemeContext";
import { ThemeContextType } from "../../posts";
import { BiCodeAlt } from 'react-icons/bi'
import { TextRules, sensitiveWords } from "../../fonts";
import './editor.css'

export default function CodeBlock() {
  const { theme } = useThemeContext() as ThemeContextType;
  const [codeEntry, setCodeEntry] = useState<string>('');
  const [element, setElement] = useState<JSX.Element[]>([])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setCodeEntry(event.target.value)

  const watchWords = TextRules.keywords as string
  const watchSigns = TextRules.codeBlock.quotes as string

  useEffect(() => {
    const bodyContent = codeEntry.split(' ').map((letter, index) => {
      return (
        <span key={index} className={`${watchWords.includes(letter.trim()) ? 'rounded-sm text-yellow-500' : (letter.includes('(') || letter.endsWith(').')) || letter.slice(-1) == ')' ? 'text-red-600 bg-gray-600 rounded-sm' : letter.startsWith(watchSigns) && letter.endsWith(watchSigns) && 'text-blue-500'}`}>{letter}{' '}</span>
      )
    })
    setElement(bodyContent)
  }, [codeEntry])

  return (
    <section className="w-full flex flex-col gap-2">
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
    </section>
  )
}