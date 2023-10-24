import { useCallback } from 'react';
import CommentBody from "./CommentBody";
import { useSelector } from "react-redux";
import EnlargeComment from "./EnlargeComment";
import { useLocation } from "react-router-dom";
import { checkCount } from "../../utils/navigator";
import { useThemeContext } from "../../hooks/useThemeContext"
import { getComments } from "../../features/story/commentSlice";
import { CommentOptionProp, ThemeContextType } from "../../types/posts";

type CommentProps={
  authorId: string,
  openComment: CommentOptionProp,
  setOpenComment: React.Dispatch<React.SetStateAction<CommentOptionProp>>
} 

export default function Comments({ authorId, openComment, setOpenComment }: CommentProps) {
  const {theme, enlarge } = useThemeContext() as ThemeContextType;
  const { pathname } = useLocation()
  const comments = useSelector(getComments)
  const scrollRef = useCallback((node: HTMLElement) => {
    if(node && openComment?.option === 'Open') {
      node.scrollIntoView({ behavior: 'smooth' })
    }
  }, [openComment?.option])

  return (
    <section 
      className={`comment_page text-sm absolute z-10 ${pathname === `/story/${openComment?.storyId}` ? '-bottom-24' : '-top-32 mobile:-top-40'} left-1 w-full ${openComment?.option === 'Open' ? 'scale-100' : 'scale-0 hidden'} transition-all p-3`}>
        <div 
          ref={scrollRef as React.LegacyRef<HTMLDivElement>} 
          onClick={() => setOpenComment({option: 'Hide', storyId: ''})}
          className="h-[20vh] w-full" 
        />
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
        {
          enlarge?.assert ? 
            <EnlargeComment authorId={authorId} /> 
            : <CommentBody 
                openComment={openComment} 
                setOpenComment={setOpenComment} 
                authorId={authorId} 
              />
        }
      </article>
    </section>
  )
}