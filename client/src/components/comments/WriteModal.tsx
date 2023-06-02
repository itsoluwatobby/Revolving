import { ChangeEvent } from 'react'
import { BsSend } from 'react-icons/bs'
import { useThemeContext } from '../../hooks/useThemeContext'
import { PromptLiterals, ThemeContextType } from '../../posts'

type WriteProp={
  writeReply: string,
  keepPrompt: PromptLiterals,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setOpenReply: React.Dispatch<React.SetStateAction<boolean>>,
}

// TODO: When Prompt is up, disable textarea

export default function WriteModal({ keepPrompt, responseRef, writeReply, setWriteReply, setOpenReply }: WriteProp) {
  const { theme, enlarge } = useThemeContext() as ThemeContextType

  const handleReply = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)
  
  const handleSubmit = () => {
    console.log({writeReply})
    setWriteReply('')
    setOpenReply(false)
  }

  const content = (
    <article className={`absolute w-full -bottom-20 z-50 ${enlarge && 'bottom-16 left-0'}`}>
      <div className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}`}>
        <textarea 
          ref={responseRef}
          name="comment"
          value={writeReply}
          disabled={keepPrompt == 'Show'}
          autoFocus={true}
          rows={3}
          autoComplete="off"
          placeholder="share your thought"
          onChange={handleReply}
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        ></textarea>
        <button 
          onClick={handleSubmit}
          className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
    </article>
  )

  return content
}