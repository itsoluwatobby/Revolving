import { BsFillHandThumbsUpFill, BsHandThumbsUp } from 'react-icons/bs'
import { MdOutlineInsertComment } from 'react-icons/md';
import { PromptLiterals, Theme, ThemeContextType } from '../../posts';
import { CommentProps, EnlargeCompo, ErrorResponse, OpenReply, Prompted } from '../../data';
import { useThemeContext } from '../../hooks/useThemeContext';
import WriteModal from './WriteModal';
import { useEffect } from 'react';
import { useLikeAndUnlikeCommentMutation } from '../../app/api/commentApiSlice';
import { toast } from 'react-hot-toast';
import { checkCount } from '../../utils/navigator';
import { setEditComment } from '../../features/story/commentSlice';
import { useDispatch } from 'react-redux';

type BaseProps = {
  mini?: boolean
  reveal?: boolean
  userId: string,
  theme: Theme,
  writeReply: string,
  openReply: OpenReply,
  keepPrompt: PromptLiterals,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setPrompt?: React.Dispatch<React.SetStateAction<Prompted>>,
  setOpenReply: React.Dispatch<React.SetStateAction<OpenReply>>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>,
  comment: CommentProps
}

function modalButton(theme: Theme){ 
  return `cursor-pointer border ${theme == 'light' ? 'border-gray-400 bg-slate-600 text-gray-50' : 'border-gray-500'} p-1 text-[11px] rounded-md hover:opacity-80 transition-all`;
}

export default function CommentBase({ responseRef, reveal, setPrompt, keepPrompt, setKeepPrompt, writeReply, setWriteReply, openReply, setOpenReply, mini, userId, theme, comment}: BaseProps) {
  const {setParseId, setLoginPrompt, enlarge, setEnlarge } = useThemeContext() as ThemeContextType;
  const [likeAndUnlikeComment, { isLoading: isLikeLoading, error: likeError, isError: isLikeError }] = useLikeAndUnlikeCommentMutation();
  const dispatch = useDispatch()

  const expandComment = (commentId: string, main=true) => {
    if(main) setEnlarge({type: 'open', assert: true})
    else setEnlarge({type: 'enlarge', assert: true})
    setParseId(commentId)
  }

  useEffect(() => {
    if(writeReply?.length && !openReply.assert){
      if(keepPrompt !== 'Retain') setKeepPrompt('Show')
      if(keepPrompt === 'Retain') {
        setKeepPrompt('Dommant')
        setOpenReply({type: openReply.type, assert: false});
      }
    }
    else if(keepPrompt == 'Discard') {
      setKeepPrompt('Dommant')
      setWriteReply('')
      setOpenReply({type: 'nil', assert: false})
    }
  }, [writeReply, openReply.assert, keepPrompt, setKeepPrompt, setWriteReply, setOpenReply])

  const likeUnlikeComment = async() => {
    try{
      const { _id } = comment
      await likeAndUnlikeComment({userId, commentId: _id}).unwrap()
    }
    catch(err: unknown){
      const errors = likeError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isLikeError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const replyModal = () => {
    setOpenReply({type: 'reply', assert: true})
    dispatch(setEditComment({...comment, comment: ''}))
  }

  return (
    <>
        <p className="flex items-center gap-1.5">
          <MdOutlineInsertComment 
            title='responses'
            onClick={() => expandComment(comment._id, true)}
            className={`font-sans cursor-pointer ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}
          />
          <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
            {checkCount(comment?.commentResponse)}
          </span>
        </p>
        <p className={`flex items-center gap-1 ${isLikeLoading && 'animate-bounce'}`}>
          {userId && comment?.likes?.includes(userId)
            ?
            <BsFillHandThumbsUpFill 
              title='like' 
              onClick={likeUnlikeComment}
              className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
            :
            <BsHandThumbsUp 
              title='like' 
              onClick={likeUnlikeComment}
              className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${comment?.likes.includes(userId) && 'text-red-500'}`} />
          }
          <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
            {checkCount(comment?.likes)}
          </span>
        </p>
        {(!reveal && mini && comment?.comment) && (
            comment?.comment.split(' ').length >= 60 &&
              <small 
                onClick={() => expandComment(comment?._id, false)}
                className={`font-sans cursor-grab ${theme == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-gray-200`}>Read more</small>
          )
        }
        <span
          onClick={replyModal}
          className="cursor-pointer hover:opacity-70">
            reply
        </span>
      {(openReply.assert || keepPrompt == 'Show') 
            ? <WriteModal 
                responseRef={responseRef}
                writeReply={writeReply}
                keepPrompt={keepPrompt}
                openReply={openReply}
                setOpenReply={setOpenReply}
                setWriteReply={setWriteReply}
                setPrompt={setPrompt as React.Dispatch<React.SetStateAction<Prompted>>}
                currentUserId={userId}
                comment={comment}
              /> 
              : null
      }
      {
        keepPrompt == 'Show' 
          ? <PopUpPrompt 
              enlarge={enlarge}
              responseRef={responseRef} 
              setKeepPrompt={setKeepPrompt}
              theme={theme} 
            /> 
            : null
      }
    </>
  )
}

type PopType={
  theme: Theme,
  enlarge: EnlargeCompo,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>
}

export function PopUpPrompt({ enlarge, responseRef, setKeepPrompt, theme }: PopType){

  const keepFocus = () => {
    setKeepPrompt('Retain')
    if(responseRef.current) responseRef?.current.focus()
  }
  return (
    <section className={`absolute flex p-4 rounded-lg z-50 shadow-2xl items-center gap-2 right-20 ${theme == 'light' ? 'bg-slate-700 shadow-slate-800' : 'bg-slate-800 shadow-slate-700'} ${enlarge.assert ? 'bottom-20' : 'top-4'}`}>
      <p 
        onClick={keepFocus}
        className={modalButton(theme)}>Keep writing</p>
      <p 
        onClick={() => setKeepPrompt('Discard')}
        className={modalButton(theme)}>Discard</p>
    </section>
  )
}
