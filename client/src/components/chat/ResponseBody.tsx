import { format } from "timeago.js"
import { IoMdCloseCircle } from "react-icons/io"
import { MessageModelType } from "../../types/data"
import { BsCheck, BsCheckAll } from "react-icons/bs"
import { reduceLength } from "../../utils/navigator"

type ResponseBodyType = {
  message: MessageModelType,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>
}

export const ResponseBody = ({ message, setMessageResponse }: ResponseBodyType) => {

  return (
    <article 
      className={`absolute -top-12 h-12 transition-all bg-slate-600 text-white shadow-inner shadow-slate-700 text-xs rounded-sm w-full`}>

      <div className='relative flex items-start gap-1 py-2 pb-1 p-1 rounded-sm w-full h-full border-2 border-slate-400'>

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
              {reduceLength(message.message, 35)}
            </p>
          <div className={`w-fit bg-gray-700 rounded self-end text-gray-200 flex items-center gap-2 text-[9px]`} >
            <span className='text-gray-300'>{format(message.createdAt as string)}</span>
            {
              message.isDelivered ? <BsCheckAll className={`text-sm ${message?.isMessageRead === 'read' ? 'text-green-500' : ''}`} /> : <BsCheck className={`text-sm`} />
            }
          </div>
        </div>
          
          <IoMdCloseCircle 
            onClick={() => setMessageResponse(null)}
            className='absolute top-0 right-0 text-lg cursor-pointer hover:opacity-90 transition-all active:opacity-100'
          />
      </div>

    </article>
  )
}