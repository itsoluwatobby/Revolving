import { DeleteStatusType, MessageModelType, UserProps } from "../../../data";
import { ChatOption } from "../../../posts";

type OptionButtonsType = {
  open: ChatOption,
  expandOption: boolean,
  message: MessageModelType,
  currentUser: Partial<UserProps>,
  setOpen: React.Dispatch<React.SetStateAction<ChatOption>>,
  setExpandOption: React.Dispatch<React.SetStateAction<boolean>>,
  setDeleteStatus: React.Dispatch<React.SetStateAction<DeleteStatusType>>,
  setEditMessage: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
}

export const OptionButtons = ({ open, expandOption, message, currentUser, setMessageResponse, setExpandOption, setEditMessage, setOpen }: OptionButtonsType) => {
  
  return (
    <div className={`absolute right-0 flex ${expandOption ? 'scale-100' : 'scale-0'} ${open === 'Open' ? 'z-0 scale-50' : 'z-10'} transition-all items-center ${message?.senderId === currentUser?._id ? 'bg-slate-500' : 'bg-slate-600'} gap-0.5 shadow-md rounded-sm`}>

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
        onClick={() => setOpen('Open')}
        className={`text-[10px] hover:opacity-90 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 shadow-sm focus:outline-0 border-none rounded-sm`}>
        delete
      </button>

    </div>
  )
}
