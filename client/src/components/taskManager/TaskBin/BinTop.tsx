import { Button, FunctionOption, Position } from '../../../data'
import { MdOutlineDeleteForever, MdOutlineRestore } from 'react-icons/md'
import { Theme } from '../../../posts'

type BinTopProps = {
  theme: Theme,
  restoreTasks: ({taskId, type}: FunctionOption) => void,
  permanentlyDelete: ({taskId, type}: FunctionOption) => void,
  taskIdsToDelete: string[],
  taskbinButton: (theme: Theme, type: Button, position: Position) => string,
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>
}

export default function BinTop({ theme, restoreTasks, permanentlyDelete, taskIdsToDelete, taskbinButton, setConfirmDelete }: BinTopProps) {

  return (
    <nav className={`sticky top-0 z-40 flex items-center justify-between ${theme == 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-0.5 ${taskIdsToDelete.length ? '' : ''}`}>
      <MdOutlineRestore 
        title="restore marked"
        onClick={() => restoreTasks({type: 'MULTI'})}  
        className={taskbinButton(theme, 'RESTORE', 'NAV')} 
      />
      <h2 className="text-center font-bold">Task Bin</h2>
    
      <MdOutlineDeleteForever 
        title="trash marked"
        onClick={() => permanentlyDelete({type: 'MULTI'})}  
        className={taskbinButton(theme, 'DELETE', 'NAV')} 
      />
    
      <button 
        onClick={() => setConfirmDelete(true)}
        className={`text-sm text-white bg-red-600 rounded-md pl-2 pr-2 hover:bg-red-600 transition-all active:bg-red-400 ${taskIdsToDelete?.length ? 'scale-0 hidden' : 'scale-100'}`}>clear
      </button>
    </nav>
  )
}