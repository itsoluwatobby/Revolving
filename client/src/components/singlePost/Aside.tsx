import { Link } from "react-router-dom";
import { PostType, ThemeContextType } from "../../posts";
import { useThemeContext } from "../../hooks/useThemeContext";
import { useEffect, useState } from "react";
import { reduceLength } from "../../utils/navigator";

type AsideProps = {
  stories: PostType[],
  sidebar: boolean,
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Aside({ stories, setSidebar, sidebar }: AsideProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const [recentStories, setRecentStories] = useState<PostType[]>([])

  useEffect(() => {
    setRecentStories(
      stories?.filter(story => +new Date(story.createdAt).getDay() < 3)
    )
  }, [stories])
  
/*
<MdOutlineCancel
          onClick={() => setSidebar(false)}
          className={`absolute sm:hidden block right-0 rounded-md text-xl cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-[0.9] shadow-xl ${theme == 'light' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`} />
*/

  return (
    <aside className={`sidebars md:block flex-none sm:w-1/4 w-4/12 transition-all overflow-y-scroll h-full ${sidebar ? 'maxscreen:translate-x-0' : 'maxscreen:-translate-x-96 maxscreen:w-0'} ${theme == 'light' ? 'bg-gray-50' : 'bg-slate-700'}  rounded-tr-lg z-50`}>
      <div className={`sticky top-0 w-full mb-1 z-50 ${theme == 'light' ? 'bg-gray-300' : 'bg-slate-800'} flex justify-between items-center`}>
        <p className="font-medium p-1.5 text-sm drop-shadow-2xl font-serif uppercase shadow-lg">Recents</p>
        <button 
          onClick={() => setSidebar(false)}
          className='absolute sm:hidden block right-0 shadow-lg text-white border dark:bg-slate-600 border-slate-700 bg-opacity-40 cursor-pointer p-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
          close
        </button>
      </div>
      {
        stories?.length ? (
          <ul className="flex flex-col font-sans text-sm p-1 justify-center rounded-md pb-3 transition-all duration-200 gap-1">
            {
              recentStories?.map(story => (
                <li 
                  key={story?._id}
                  className={` hover:scale-[1.01] rounded-lg transition-all shadow-lg shadow-slate-600 ${theme == 'light' ? 'bg-gray-100' : 'bg-slate-800'} p-2`}
                >
                  <Link to={`/story/${story?._id}`}>
                    <p className="text-center font-serif uppercase font-medium underline underline-offset-4">{reduceLength(story?.title, 3, 'word')}</p>
                    <p className="cursor-pointer whitespace-pre-wrap text-justify">{reduceLength(story?.body, 23, 'word')}</p>
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