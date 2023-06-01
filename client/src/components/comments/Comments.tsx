import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"
import { BsSend } from 'react-icons/bs';
import { MdCancel } from 'react-icons/md';
import CommentCompo from "./CommentCompo";
import { comments } from "../../commentData";
import EnlargeComment from "./EnlargeComment";

export default function Comments() {
  const {theme, setOpenComment, enlarge} = useThemeContext() as ThemeContextType;

  return (
    <section className="comment_page absolute z-50 bg-opacity-30 w-full flex flex-col p-3">
      <article className={`${theme == 'light' ? 'bg-slate-100' : 'bg-slate-700'} flex flex-col h-4/5 p-2 pt-1 md:w-4/5 shadow-lg rounded-lg`}>
        {!enlarge && 
          <p className="text-center font-mono capitalize text-gray-300">{comments?.length} {comments?.length == 1 ? 'comment' : 'comments'}</p>
        }
        {enlarge 
          ?
          <EnlargeComment />
          :
          <>
            <MdCancel 
              onClick={() => setOpenComment(false)}
              className={`fixed text-gray-800 text-2xl cursor-pointer hover:opacity-70 right-3 top-3`}/>
            <div className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}`}>
              <input 
                type="text"
                name="comment"
                autoFocus={true}
                autoComplete="off"
                placeholder="share your thought"
                className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
              />
              <button className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
                <BsSend 
                  className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
                />
              </button>
            </div>
            <div className="hidebars w-full overflow-y-scroll mt-2 flex flex-col gap-3">
              {
                comments.map(comment => (
                  <CommentCompo 
                    key={comment?._id}
                    comment={comment} 
                    theme={theme} 
                  />
                ))
              }
            </div>
          </>
        }
      </article>
    </section>
  )
}