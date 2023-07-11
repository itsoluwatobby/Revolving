import { Link } from "react-router-dom";
import { useGetStoriesQuery } from "../../app/api/storyApiSlice";
import { PostType, ThemeContextType } from "../../posts";
import { reduceLength } from "../../utils/navigator";
import { useState, useEffect } from 'react';
import { useThemeContext } from "../../hooks/useThemeContext";

export default function RightSection() {
  const { theme } = useThemeContext() as ThemeContextType
  const {data, isLoading, error} = useGetStoriesQuery()
  const [stories, setStories] = useState<PostType[]>([])

  useEffect(() => {
    let isMounted = true
    isMounted ? setStories(data as PostType[]) : null

    return () => {
      isMounted = false
    }
  }, [data])

  return (
    <section className={`hidebars fixed h-full text-sm overflow-y-scroll pb-24`}>
      <div className={`sticky top-0 w-full mb-1 z-50 ${theme == 'light' ? 'bg-gray-300' : 'bg-slate-800'} flex justify-between items-center`}>
        <p className="font-medium p-1.5 w-full text-center text-sm drop-shadow-2xl font-serif uppercase shadow-lg">Recents</p>
        {/* <button 
          className='absolute sm:hidden block right-0 shadow-lg text-white border dark:bg-slate-600 border-slate-700 bg-opacity-40 cursor-pointer p-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
          close
        </button> */}
      </div>
      {
        stories?.length ? (
          <ul className="flex flex-col font-sans text-xs p-1 justify-center pb-3 transition-all duration-200 gap-1">
            {
              stories?.map(story => (
                <li 
                  key={story?._id}
                  className={`hover:scale-[1.01] rounded-sm transition-all shadow-lg ${theme == 'light' ? 'bg-gray-100 shadow-slate-300' : 'bg-slate-600 shadow-slate-700 '} p-2`}
                >
                  <Link to={`/story/${story?._id}`}>
                    <p className="text-center text-xs font-serif uppercase font-medium underline underline-offset-4">{reduceLength(story?.title, 3, 'word')}</p>
                    <p className="cursor-pointer whitespace-pre-wrap tracking-tight text-justify">{reduceLength(story?.body, 22, 'word')}</p>
                  </Link>
                </li>
              ))
            }
          </ul>
        ) : <p className="text-center">No stories</p>
      }
    </section>
  )
}