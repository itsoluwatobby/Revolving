import { format } from 'timeago.js';
import { Theme } from '../../posts';
import { CommentProps } from '../../data';
import { reduceLength } from '../../utils/navigator';

type SimgleCommentProps = {
  theme: Theme,
  closeInput: () => void,
  targetComment: CommentProps,
}

export default function SingleComment({ theme, targetComment, closeInput }: SimgleCommentProps) {

  return (
    <>
      <div className={`sticky top-0 flex mobile:gap-2 mobile:ml-8 items-center ml-16 gap-2 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
        <p className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}> 
          {reduceLength(targetComment?.author, 15)}
        </p>
        <span className="font-bold text-black">.</span>
        <p className="text-xs text-gray-700">{format(targetComment?.createdAt)}</p>
      </div>
      <p 
        onClick={closeInput}
        className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:text-lg first-letter:font-medium">
        {targetComment?.comment}
      </p>
    </>
  )
}