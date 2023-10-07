import { useCallback } from 'react'
import { format } from 'timeago.js'
import { MessageModelType, UserProps } from '../../../data'
import { GetConvoType } from '../../../posts'

type ChatBodyCompProps = {
  message: MessageModelType,
  currentChat: GetConvoType,
  currentUser: Partial<UserProps>,
}

export default function ChatBodyComp({ message, currentChat, currentUser }: ChatBodyCompProps) {

  const scrollIntoCurrent = useCallback((node: HTMLElement) => {
    node ? node?.scrollIntoView({ behavior: "smooth" }) : null
  }, [])

  return (
    <>
      {
        message?.conversationId === currentChat?._id && (
          <article 
            ref={scrollIntoCurrent}
            className={`flex ${message.senderId === currentUser?._id ? 'self-end bg-slate-600' : 'self-start bg-slate-700'} text-white items-center shadow-slate-800 text-xs rounded-md rounded-br-none gap-2 py-2 pb-1 p-1 shadow-md w-[75%]`}>
            <figure className={`flex-none rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>
              <img 
                src={message?.displayPicture} 
                alt='Logo' 
                className='h-full w-full object-cover rounded-full mr-2'
              />
            </figure>
            <p className='flex-auto flex flex-col text-justify tracking-tight whitespace-pre-wrap'>
                <span className={`w-full`}>
                  {message.message}
                </span>
              <span className={`w-full text-gray-200 text-right text-[10px]`} >
                {format(message.createdAt as string)}
              </span>
            </p>
          </article>
        )
      }
    </>
  )
}