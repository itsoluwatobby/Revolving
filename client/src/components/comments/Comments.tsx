import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"
import { comments } from "../../commentData";
import EnlargeComment from "./EnlargeComment";
import CommentBody from "./CommentBody";
import { checkCount } from "../../assets/navigator";
import { CommentProps } from "../../data";

export default function Comments() {
  const {theme, enlarge} = useThemeContext() as ThemeContextType;

  return (
    <section className="comment_page absolute z-50 bg-opacity-30 w-full flex flex-col p-3">
      <article className={`${theme == 'light' ? 'bg-slate-100' : 'bg-slate-700'} flex flex-col h-4/5 p-2 pt-1 md:w-4/5 shadow-lg rounded-lg`}>
        {!enlarge && (
          comments?.length ? (
              <p 
                className={`text-center font-mono capitalize ${theme == 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  {checkCount(comments)} {comments?.length == 1 ? 'comment' : 'comments'}
              </p>
              ) : (
              <p className={`text-center font-mono capitalize ${theme == 'light' ? 'text-gray-700' : 'text-gray-300'}`}>no comment</p>
            )
          )
        }
        {enlarge ? <EnlargeComment /> : <CommentBody />}
      </article>
    </section>
  )
}