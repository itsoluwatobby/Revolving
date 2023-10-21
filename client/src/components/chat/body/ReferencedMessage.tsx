import { format } from "timeago.js"
import { BsCheck, BsCheckAll } from "react-icons/bs"
import { MessageModelType } from "../../../types/data"
import { reduceLength } from "../../../utils/navigator"

type ResponseBodyType = {
  closeAll: () => void,
  message: Partial<MessageModelType>,
}

export const ReferencedMessage = ({ message, closeAll }: ResponseBodyType) => {

  return (
    <article 
      onClick={closeAll}
      id={message?._id}
      className={`h-12 transition-all bg-slate-600 text-white shadow-inner shadow-slate-700 text-xs rounded-sm w-full`}>

      <div className='relative flex items-start gap-1  py-2 pb-1 p-1 rounded-sm w-full bg-slate-500'>

        <figure className={`flex-none rounded-md border border-white bg-slate-700 w-7 h-7 shadow-lg`}>
          <img 
            src={message?.displayPicture} 
            alt='Logo' 
            className='h-full w-full object-cover rounded-md mr-2'
          />
        </figure>
        <div 
          className='flex-auto flex flex-col tracking-tight whitespace-pre-wrap'>
            <p className={`w-full`}>
              {reduceLength(message.message as string, 35)}
            </p>
          <div className={`w-fit bg-gray-600 rounded self-end text-gray-200 flex items-center gap-1 text-[9px]`}>
            {message?.edited ? <span className='text-gray-300'>edited</span> : null}
            <span className='text-gray-300'>{format(message.createdAt as string)}</span>
            {
              message.isDelivered ? <BsCheckAll className={`text-sm ${message?.isMessageRead === 'read' ? 'text-green-500' : ''}`} /> : <BsCheck className={`text-sm`} />
            }
          </div>
        </div>
      </div>

    </article>
  )
}