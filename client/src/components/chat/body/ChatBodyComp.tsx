import { format } from 'timeago.js'
import { Socket } from 'socket.io-client'
import { OptionButtons } from './OptionButtons'
import { MdOutlineMoreHoriz } from 'react-icons/md'
import { BsCheck, BsCheckAll } from 'react-icons/bs'
import { DeleteOptionButton } from './DeleteButton'
import { useCallback, useEffect, useState } from 'react'
import { ChatOption, GetConvoType } from '../../../posts'
import { useDeleteMessageMutation } from '../../../app/api/messageApiSlice'
import { DeleteChatOption, DeleteStatusType, MessageModelType, UserProps } from '../../../data'
import { ReferencedMessage } from './ReferencedMessage'
import { checkCount, reduceLength } from '../../../utils/navigator'


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
  const [seeMore, setSeeMore] = useState<boolean>(false)
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatusType>(initDeleteState)
  const [deleteMessage, {isLoading, isError}] = useDeleteMessageMutation()
  const [open, setOpen] = useState<ChatOption>('Hide')

  const scrollIntoCurrent = useCallback((node: HTMLElement) => {
    node ? node?.scrollIntoView({ behavior: "smooth" }) : null
  }, [])

   useEffect(() => {
    setDeleteStatus(prev => ({ ...prev, loading: isLoading }))
  }, [isLoading, setDeleteStatus])

  useEffect(() => {
    let isMounted = true, timeoutId: NodeJS.Timeout;
    if(isMounted && isError){
      timeoutId = setTimeout(() => {
        setDeleteStatus(prev => ({ ...prev, errorMsg: false }))
      }, 3000);
    }
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isError, setDeleteStatus])

  const handleDelete = (option: DeleteChatOption) => {
    if(isLoading) return
    setExpandOption(false)
    setOpen('Hide')
    deleteMessage({ userId: message?.senderId, messageId: message?._id, option }).unwrap()
    .then(() => {
      !message?.isMessageDeleted?.length ? socket.emit('delete_message', {isDeleted: true, conversationId: currentChat?._id}) : null
    })
    .catch(() => setDeleteStatus(prev => ({...prev, errorMsg: true})))
  }

  const closeAll = () => {
    setOpen('Hide')
    setMessageResponse(null)
    setEditMessage(null)
    setExpandOption(false)
  }

  return (
    <>
      {
        message?.conversationId === currentChat?._id && (
          !message?.isDeleted ? (
            !message?.isMessageDeleted.includes(currentUser?._id as string) ? (
              <article 
                ref={scrollIntoCurrent}
                className={`relative flex flex-col ${message.senderId === currentUser?._id ? 'self-end bg-slate-600 rounded-br-none rounded-tl-none' : 'self-start bg-slate-700 rounded-bl-none rounded-tr-none'} text-white ${editMessage?._id === message?._id ? 'opacity-70' : ''} ${deleteStatus?.loading ? 'animate-pulse' : 'animate-none'} p-1 pb-0.5 shadow-slate-800 text-xs rounded-md gap-0.5 shadow-md w-[75%]`}>

                {
                  message?.referencedMessage?._id ?
                    <ReferencedMessage 
                      message={message?.referencedMessage} closeAll={closeAll}
                    />
                  : null
                }
                <div className='relative flex items-start w-full gap-1 pt-1 pb-0 p-1'>

                  <figure className={`flex-none rounded-full border border-white bg-slate-700 w-7 h-7 shadow-lg`}>
                    <img 
                      src={message?.displayPicture} 
                      alt='Logo' 
                      className='h-full w-full object-cover rounded-full mr-2'
                    />
                  </figure>
                  <div 
                    onClick={closeAll}
                    className='flex-auto flex flex-col tracking-tight whitespace-pre-wrap gap-1'>

                    <p 
                      onDoubleClick={() => setSeeMore(false)}
                      className={`w-full transition-all pb-0.5 pt-0 indent-1 whitespace-pre-wrap break-before-all cursor-default break-all`}>
                      {
                        (message.message?.length > 65 && !seeMore) ? (
                            <>
                              <span>{reduceLength(message.message, 65)}</span> &nbsp;
                              <span 
                                onClick={() => setSeeMore(true)}
                                className='text-gray-300 text-[10px] cursor-pointer hover:opacity-90 active:opacity-100 transition-all'>see more
                              </span>
                            </>
                          )
                          : message.message
                      }
                    </p>
                    
                      <div className={`w-fit bg-gray-700 rounded self-end text-gray-200 flex items-center gap-1.5 text-[9px]`} >
                        {message?.edited ? <span className='text-gray-400'>edited</span> : null}
                        <span className='text-gray-300'>{format(message.createdAt as string)}</span>
                        {
                          message.isDelivered ? <BsCheckAll className={`text-sm ${message?.isMessageRead === 'read' ? 'text-green-500' : ''}`} /> : <BsCheck className={`text-sm`} />
                        }

                    </div>

                  </div>


                  <div className={`absolute right-8 ${deleteStatus?.errorMsg ? 'scale-100' : 'scale-0'} transition-all shadow-inner bg-red-500 w-28 text-center border-2 border-red-300 rounded-sm`}>
                    An error occured
                  </div>

                </div>
                  
                <MdOutlineMoreHoriz 
                  onClick={() => {
                    setExpandOption(prev => !prev)
                  }}
                  className={`absolute right-1 -top-1 ${expandOption ? 'text-gray-300' : ''} text-lg cursor-pointer hover:opacity-90 active:opacity-100 transition-all`}
                />

                <OptionButtons 
                  currentUser={currentUser} setOpen={setOpen}
                  message={message} setDeleteStatus={setDeleteStatus} open={open}
                  setExpandOption={setExpandOption} setEditMessage={setEditMessage}
                  expandOption={expandOption} setMessageResponse={setMessageResponse} 
                />

                <DeleteOptionButton 
                  message={message} handleDelete={handleDelete}
                  currentUser={currentUser} open={open} setOpen={setOpen}
                />

              </article>
            ) 
            : 
            (
              <div className={`${message.senderId === currentUser?._id ? 'self-end' : 'self-start'} text-gray-300 italic w-fit underline underline-offset-1 text-xs`}>
                You deleted this message
              </div>
            )
          ) 
          : 
          (
            <div className={`${message.senderId === currentUser?._id ? 'self-end' : 'self-start'} text-gray-300 italic w-fit underline underline-offset-1 text-xs`}>
              message deleted
            </div>
          )
        )
      }
    </>
  )
}
