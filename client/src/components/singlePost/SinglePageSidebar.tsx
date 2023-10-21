import { Link } from "react-router-dom"
import { PostType } from "../../types/posts"

type SinglePageSidebarProps = {
  theme: string,
  options: string,
  storyId: string,
  story: PostType,
  fontOption: boolean,
  triggerPrint: () => void,
  setOptions: React.Dispatch<React.SetStateAction<string>>,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>
}

export const SinglePageSidebar = ({ setOptions, story, triggerPrint, setFontOption, theme, fontOption, options, storyId } : SinglePageSidebarProps) => {
  const postOptions = ['home', 'edit', 'print']
  const postLinks = ['/', `/edit_story/${storyId}/${story?.userId}`, '']
  const currentUserId = localStorage.getItem('revolving_userId') as string

  const printPDF = (option: string) => {
    option === 'print' ? triggerPrint() : null
    setOptions(option)
    setFontOption(false)
  }
  return (
    <nav className={`${theme == 'dark' ? 'text-black font-medium' : ''} fixed flex justify-end shadow-lg right-0 bg-opacity-20 top-0 h-full w-full z-50 rounded-md ${fontOption ? '' : 'translate-x-[190rem]'} duration-250 ease-in-out bg-slate-400}`}>
      <div className='w-[30%] md:w-1/5 h-full bg-slate-600 flex flex-col gap-1 p-1'>
        {
          postOptions?.map((option, index) => (
            <Link to={(option === 'edit' && story?.userId !== currentUserId) ? '' : `${postLinks[index]}`}
              key={option}
              title={`${option == 'print' ? 'print as pdf' : option}`}
              onClick={() => printPDF(option)}
              className={`bg-slate-400 ${(option === 'edit' && story?.userId !== currentUserId)? 'hidden' : 'block'} cursor-pointer hover:scale-[1.01] uppercase text-center text-xs hover:bg-slate-400 hover:opacity-80 duration-200 ease-in-out rounded-sm ${option === options ? 'bg-slate-500 text-white' : ''} p-4`} 
            >
              {option}
            </Link>
            )
          )
        }
      </div>
    </nav>
  )
}
