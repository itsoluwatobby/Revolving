import { useEffect } from "react";
import { Link } from "react-router-dom";
import { reduceLength } from "../../utils/navigator";
import useRecentStories from "../../hooks/useRecentStories";
import { useThemeContext } from "../../hooks/useThemeContext";
import { PostType, ThemeContextType } from "../../types/posts";

type AsideProps = {
  sidebar: boolean,
  stories: PostType[],
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>,
  setIsBarOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function Aside({ stories, setSidebar, sidebar, setIsBarOpen }: AsideProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const recentStories = useRecentStories(stories)

  useEffect(() => {
    let isMounted = true
    if(isMounted){
      setIsBarOpen(recentStories?.length >= 1)
    }
    return () => {
      isMounted = false
    }
  }, [recentStories, setIsBarOpen])
  
  return (
    <aside className={`sidebars flex-none ${recentStories?.length >=1 ? 'md:block sm:w-1/4 w-4/12' : 'hidden'} transition-all overflow-y-scroll h-full ${sidebar ? 'maxscreen:translate-x-0' : 'maxscreen:-translate-x-96 maxscreen:w-0'} ${theme == 'light' ? 'bg-gray-50' : 'bg-slate-700'} rounded-tr-lg z-50`}>
      <div className={`sticky top-0 w-full mb-1 z-50 ${theme == 'light' ? 'bg-gray-300' : 'bg-slate-800'} flex justify-between items-center`}>
        <p className="font-medium p-1.5 text-sm drop-shadow-2xl font-serif uppercase shadow-lg">Recents</p>
        <button 
          onClick={() => setSidebar(false)}
          className='absolute sm:hidden block right-0 shadow-lg text-white border dark:bg-slate-600 border-slate-700 bg-opacity-40 cursor-pointer p-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
          close
        </button>
      </div>
      {
        recentStories?.length ? (
          <ul className="flex flex-col font-sans text-sm p-1 justify-center rounded-md pb-3 transition-all duration-200 gap-1">
            {
              recentStories?.map(story => (
                <li 
                  key={story?.sharedId || story?._id}
                  className={` hover:scale-[1.01] rounded-md rounded-tr-none rounded-bl-none transition-all shadow-md ${theme == 'light' ? 'bg-gray-100 shadow-slate-300' : 'shadow-slate-600  bg-slate-800'} p-2`}
                >
                  <Link to={`/story/${story?._id}`}>
                    <p className="text-center font-serif uppercase font-medium underline underline-offset-4">{reduceLength(story?.title, 3, 'word')}</p>
                    <p className="cursor-pointer whitespace-pre-wrap break-all">{reduceLength(story?.body, 180, 'letter')}</p>
                  </Link>
                </li>
              ))
            }
          </ul>
        ) : <p className="text-center">No stories</p>
      }
    </aside>
  )
}