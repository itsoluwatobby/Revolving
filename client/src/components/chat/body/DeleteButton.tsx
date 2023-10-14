import { ChatOption } from "../../../posts"
import { AiFillCloseSquare } from "react-icons/ai"
import { DeleteChatOption, MessageModelType, UserProps } from "../../../data"

type DeleteOptionProp = {
  open: ChatOption,
  message: MessageModelType,
  currentUser: Partial<UserProps>,
  handleDelete: (option: DeleteChatOption) => void,
  setOpen: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export const DeleteOptionButton = ({ open, message, currentUser, setOpen, handleDelete }: DeleteOptionProp) => {

  return (
    <div className={`absolute right-0 ${open === 'Open' ? 'scale-100' : 'scale-0'} flex transition-all items-center font-bold text-black p-0.5 ${message?.senderId === currentUser?._id ? 'bg-slate-200' : 'bg-slate-300'} gap-0.5 shadow-md rounded-sm`}>
      <button 
        onClick={() => handleDelete(message?.isMessageDeleted?.length === 1 ? 'forAll' : 'forMe')}
        className={`text-[10px] hover:opacity-90 shadow-inner shadow-slate-500 hover:scale-95 active:scale-100 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 focus:outline-0 border-none rounded-sm`}>
        {message?.isMessageDeleted?.length === 1 ? 'delete' : 'for me'}
      </button>
      <button 
        onClick={() => handleDelete('forAll')}
        className={`${currentUser?._id === message?.senderId ? 'block' : 'hidden'} text-[10px] hover:opacity-90 hover:bg-gray-400 active:bg-gray-500 p-0.5 px-1 transition-all active:opacity-100 shadow-inner shadow-slate-500 hover:scale-95 active:scale-100 focus:outline-0 border-none rounded-sm`}>
        for all
      </button>
      <AiFillCloseSquare
        onClick={() => setOpen('Hide')} 
        className='text-lg cursor-pointer hover:text-gray-700 active:text-gray-50 transition-all'
      />
    </div>
  )
}
