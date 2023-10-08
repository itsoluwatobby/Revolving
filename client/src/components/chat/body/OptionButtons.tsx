import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useDeleteMessageMutation } from "../../../app/api/messageApiSlice";
import { DeleteStatusType, MessageModelType, UserProps } from "../../../data";
import { GetConvoType } from '../../../posts';

type OptionButtonsType = {
  socket: Socket,
  expandOption: boolean,
  currentChat: GetConvoType,
  message: MessageModelType,
  currentUser: Partial<UserProps>,
  setExpandOption: React.Dispatch<React.SetStateAction<boolean>>,
  setDeleteStatus: React.Dispatch<React.SetStateAction<DeleteStatusType>>,
  setEditMessage: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
}

export const OptionButtons = ({ socket, expandOption, currentChat, message, currentUser, setMessageResponse, setExpandOption, setEditMessage, setDeleteStatus }: OptionButtonsType) => {
  const [deleteMessage, {isLoading, isError}] = useDeleteMessageMutation()

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

  const handleDelete = () => {
    if(isLoading) return
    setExpandOption(false)
    deleteMessage({ userId: message?.senderId, messageId: message?._id }).unwrap()
    .then(() => {
      !message?.isMessageDeleted?.length ? socket.emit('delete_message', {isDeleted: true, conversationId: currentChat?._id}) : null
    })
    .catch(() => setDeleteStatus(prev => ({...prev, errorMsg: true})))
  }

  return (
    <div className={`absolute right-0 ${expandOption ? 'flex' : 'scale-0'} transition-all items-center ${message?.senderId === currentUser?._id ? 'bg-slate-500' : 'bg-slate-600'} gap-0.5 shadow-md rounded-sm`}>

      <button 
        onClick={() => {
          setMessageResponse(message)
          setExpandOption(false)
        }}
        className='text-[10px] hover:opacity-90 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 shadow-sm focus:outline-0 border-none rounded-sm'
      >
        reply
      </button>

      <button 
        onClick={() => setEditMessage(message)}
        className={`${currentUser?._id === message?.senderId ? 'block' : 'hidden'} text-[10px] hover:opacity-90 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 shadow-sm focus:outline-0 border-none rounded-sm`}>
        edit
      </button>

      <button 
        onClick={handleDelete}
        className={`${currentUser?._id === message?.senderId ? 'block' : 'hidden'} text-[10px] hover:opacity-90 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 shadow-sm focus:outline-0 border-none rounded-sm`}>
        delete
      </button>

    </div>
  )
}