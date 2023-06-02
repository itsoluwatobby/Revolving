import { BsFillHandThumbsUpFill, BsHandThumbsUp } from 'react-icons/bs'
import { MdOutlineInsertComment } from 'react-icons/md';
import { PromptLiterals, Theme, ThemeContextType } from '../../posts';
import { CommentProps } from '../../data';
import { useThemeContext } from '../../hooks/useThemeContext';
import WriteModal from './WriteModal';
import { useEffect } from 'react';

const modalButton = 'cursor-pointer border border-gray-500 p-1 text-[11px] rounded-md hover:opacity-80 transition-all';

type BaseProps = {
  mini?: boolean
  userId: string,
  theme: Theme,
  writeReply: string,
  openReply?: boolean,
  keepPrompt: PromptLiterals,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setOpenReply: React.Dispatch<React.SetStateAction<boolean>>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>,
  comment: Pick<CommentProps, '_id' | 'likes' | 'comment'>
}

export default function CommentBase({ responseRef, keepPrompt, setKeepPrompt, writeReply, setWriteReply, openReply, setOpenReply, mini, userId, theme, comment}: BaseProps) {
  const {setParseId, setEnlarge } = useThemeContext() as ThemeContextType;

  const openUpComment = (commentId: string) => {
    setEnlarge(true)
    setParseId(commentId)
  }

  useEffect(() => {

    if(writeReply?.length && !openReply){
      if(keepPrompt !== 'Retain') setKeepPrompt('Show')
      if(keepPrompt === 'Retain') {
        setKeepPrompt('Dommant')
        setOpenReply(true);
      }
    }
    else if(keepPrompt == 'Discard') {
      setKeepPrompt('Dommant')
      setWriteReply('')
      setOpenReply(false)
    }
  }, [writeReply, openReply, keepPrompt, setKeepPrompt, setWriteReply, setOpenReply])

  return (
    <>
      <p className="flex items-center gap-1.5">
          {/* {auth?._id && (     */}

            <MdOutlineInsertComment 
              title='comments'
              className={`font-sans cursor-pointer ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}
            />
            <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
              {comment?.likes?.length}
            </span>
            {/* )
          } */}
        </p>
        <p className="flex items-center gap-1">
          {userId && comment?.likes?.includes(userId)
            ?
            <BsFillHandThumbsUpFill title='like' className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
            :
            <BsHandThumbsUp title='like' className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer`} />
          }
          <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
            {comment?.likes?.length}
          </span>
        </p>
        {(mini && comment?.comment) && (
            comment?.comment.split(' ').length >= 60 &&
              <small 
                onClick={() => openUpComment(comment?._id)}
                className={`font-sans cursor-grab ${theme == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-gray-200`}>Read more</small>
          )
        }
        <span
          onClick={() => setOpenReply(true)}
          className="cursor-pointer hover:opacity-70">reply</span>
      {openReply || keepPrompt == 'Show' 
            ? <WriteModal 
                responseRef={responseRef}
                writeReply={writeReply} 
                setWriteReply={setWriteReply} 
              /> 
              : null
      }
      {
        keepPrompt == 'Show' 
          ? <PopUpPrompt 
              responseRef={responseRef} 
              setKeepPrompt={setKeepPrompt} 
            /> 
            : null
      }
    </>
  )
}

type PopType={
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>
}

export function PopUpPrompt({ responseRef, setKeepPrompt }: PopType){

  const keepFocus = () => {
    setKeepPrompt('Retain')
    if(responseRef.current) responseRef.current.focus()
  }
  return (
    <section className={`absolute flex p-4 rounded-lg z-50 shadow-2xl shadow-slate-700 items-center gap-2 right-20 top-4 bg-slate-800`}>
      <p 
        onClick={keepFocus}
        className={modalButton}>Keep writing</p>
      <p 
        onClick={() => setKeepPrompt('Discard')}
        className={modalButton}>Discard</p>
    </section>
  )
}
