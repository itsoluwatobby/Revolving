import { Link } from "react-router-dom";
import { PostType, ThemeContextType } from "../../posts";
import { MdOutlineCancel } from "react-icons/md";
import { useThemeContext } from "../../hooks/useThemeContext";
import { useEffect, useState } from "react";

type AsideProps = {
  posts: PostType[],
  sidebar: boolean,
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>,
  summarized: (length: number, sentence: string) => string
}

export default function Aside({ posts, setSidebar, sidebar, summarized }: AsideProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const [recentPosts, ssetRecentPosts] = useState<PostType[]>([])

  useEffect(() => {
    ssetRecentPosts(
      posts?.filter(post => +new Date(post.storyDate).getDay() < 3)
    )
  }, [posts])
  
  return (
    <aside className={`sidebars md:block flex-none sm:w-1/4 w-4/12 transition-all overflow-y-scroll h-full ${sidebar ? 'maxscreen:translate-x-0' : 'maxscreen:-translate-x-96 maxscreen:w-0'} ${theme == 'light' ? 'bg-gray-50' : 'bg-slate-700'}  rounded-tr-lg z-50`}>
      <div className={`sticky top-0 w-full mb-1 z-50 ${theme == 'light' ? 'bg-gray-300' : 'bg-slate-900'} flex justify-center items-center`}>
        <p className="font-bold p-0.5 drop-shadow-2xl font-serif uppercase shadow-lg">Recents</p>
        <MdOutlineCancel
          onClick={() => setSidebar(false)}
          className={`absolute sm:hidden block right-0 rounded-md text-xl cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-[0.9] shadow-xl ${theme == 'light' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`} />
      </div>
      {
        posts?.length ? (
          <ul className="flex flex-col font-sans text-sm justify-center hover:pb-1 rounded-md transition-all duration-200 gap-2">
            {
              recentPosts?.map(post => (
                <li key={post?._id}
                  className={`shadow-sm ${theme == 'light' ? 'bg-gray-100' : ''} p-2`}
                >
                  <Link to={`/story/${post?._id}`}>
                    <p className="text-center uppercase font-medium underline underline-offset-4">{summarized(50, post?.title)}</p>
                    <p className="cursor-pointer">{summarized(100, post?.body)}</p>
                  </Link>
                </li>
              ))
            }
          </ul>
        ) : <p className="text-center">No posts</p>
      }
    </aside>
  )
}