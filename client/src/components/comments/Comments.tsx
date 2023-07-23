import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"
import EnlargeComment from "./EnlargeComment";
import CommentBody from "./CommentBody";
import { checkCount } from "../../utils/navigator";
import { useSelector } from "react-redux";
import { getComments } from "../../features/story/commentSlice";

export default function Comments() {
  const {theme, enlarge, openComment } = useThemeContext() as ThemeContextType;
  const comments = useSelector(getComments)

  return (
    <section className={`comment_page text-sm absolute z-50 bg-opacity-90 w-full ${openComment?.option === 'Open' ? 'flex' : ''} flex-col p-3`}>
      <article className={`relative ${theme == 'light' ? 'bg-slate-100' : 'bg-slate-700'} flex flex-col h-4/5 p-2 pt-1 md:w-4/5 shadow-lg rounded-lg`}>
        {!enlarge?.assert && (
          comments?.length ? (
              <p 
                className={`text-left gap-2 flex items-center font-mono capitalize ${theme == 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  <span className='font-sans p-0.5' >
                    {comments.length == 1 ? 'comment' : 'comments'} 
                  </span>
                  <span>
                    {checkCount(comments)}
                  </span>
              </p>
              ) : (
              <p className={`text-center font-mono capitalize p-2.5 ${theme == 'light' ? 'text-gray-700' : 'text-gray-300'}`}/>
            )
          )
        }
        {enlarge?.assert ? <EnlargeComment /> : <CommentBody />}
      </article>
    </section>
  )
}