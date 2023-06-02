import { ChangeEvent, useState } from 'react'
import { BsSend } from 'react-icons/bs'
import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../posts'


export default function WriteModal() {
  const [writeReply, setWriteReply] = useState<string>('')
  const { openReply, theme } = useThemeContext() as ThemeContextType

  const handleReply = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)
  
  const content = (
    <article>
      <div className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}`}>
        <textarea 
          name="comment"
          autoFocus={true}
          rows={3}
          autoComplete="off"
          placeholder="share your thought"
          onChange={handleReply}
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        />
        <button className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
    </article>
  )

  return (openReply ? content : null)
}