import { format } from 'timeago.js'
import { Socket } from 'socket.io-client'
import { useCallback, useState } from 'react'
import { GetConvoType } from '../../../posts'
import { OptionButtons } from './OptionButtons'
import { MdOutlineMoreHoriz } from 'react-icons/md'
import { BsCheck, BsCheckAll } from 'react-icons/bs'
import { DeleteStatusType, MessageModelType, UserProps } from '../../../data'

type ChatBodyCompProps = {
  socket: Socket,
  message: MessageModelType,
  currentChat: GetConvoType,
  editMessage: MessageModelType,
  currentUser: Partial<UserProps>,
  setEditMessage: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
}

const initDeleteState = { loading: false, errorMsg: false }
export default function ChatBodyComp({ socket, message, editMessage, currentChat, currentUser, setMessageResponse, setEditMessage }: ChatBodyCompProps) {
  const [expandOption, setExpandOption] = useState<boolean>(false)
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatusType>(initDeleteState)

  const scrollIntoCurrent = useCallback((node: HTMLElement) => {
    node ? node?.scrollIntoView({ behavior: "smooth" }) : null
  }, [])

  return (
    <>
      {
        message?.conversationId === currentChat?._id && (
          !message?.isMessageDeleted.includes(currentUser?._id as string) ? (
            <article 
              ref={scrollIntoCurrent}
              className={`relative flex ${message.senderId === currentUser?._id ? 'self-end bg-slate-600 rounded-br-none rounded-tl-none' : 'self-start bg-slate-700 rounded-bl-none rounded-tr-none'} text-white items-start ${editMessage?._id === message?._id ? 'opacity-70' : ''} ${deleteStatus?.loading ? 'animate-pulse' : 'animate-none'} shadow-slate-800 text-xs rounded-md gap-1 py-2 pb-1 p-1 shadow-md w-[75%]`}>
              <figure className={`flex-none rounded-full border border-white bg-slate-700 w-7 h-7 shadow-lg`}>
                <img 
                  src={message?.displayPicture} 
                  alt='Logo' 
                  className='h-full w-full object-cover rounded-full mr-2'
                />
              </figure>
              <div 
                onClick={() => {
                  setMessageResponse(null)
                  setEditMessage(null)
                  setExpandOption(false)
                }}
                className='flex-auto flex flex-col tracking-tight whitespace-pre-wrap'>
                  <p className={`w-full`}>
                    {message.message}
                  </p>
                <div className={`w-fit bg-gray-700 rounded self-end text-gray-200 flex items-center gap-2 text-[9px]`} >
                  <span className='text-gray-300'>{format(message.createdAt as string)}</span>
                  {
                    message.isDelivered ? <BsCheckAll className={`text-sm ${message?.isMessageRead === 'read' ? 'text-green-500' : ''}`} /> : <BsCheck className={`text-sm`} />
                  }
                </div>
              </div>

              <MdOutlineMoreHoriz 
                onClick={() => {
                  setExpandOption(prev => !prev)
                }}
                className={`absolute right-1 -top-1 ${expandOption ? 'text-gray-300' : ''} text-lg cursor-pointer hover:opacity-90 active:opacity-100 transition-all`}
              />

              <OptionButtons 
                currentUser={currentUser} socket={socket}
                setExpandOption={setExpandOption} setEditMessage={setEditMessage}
                expandOption={expandOption} setMessageResponse={setMessageResponse} 
                message={message} setDeleteStatus={setDeleteStatus} currentChat={currentChat}
              />

              <div className={`absolute right-8 ${deleteStatus?.errorMsg ? 'scale-100' : 'scale-0'} transition-all shadow-inner bg-red-500 w-28 text-center border-2 border-red-300 rounded-sm`}>
                An error occured
              </div>

            </article>
          )
        :
          <div className={`${message.senderId === currentUser?._id ? 'self-end' : 'self-start'} text-gray-300 italic w-fit underline underline-offset-1 text-xs`}>
            message deleted
          </div>
        )
      }
    </>
  )
}
