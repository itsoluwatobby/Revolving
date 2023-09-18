import { Theme } from '../../../posts';
import { checkCount } from '../../../utils/navigator';
import { Button, FunctionOption, Position, TaskBin } from '../../../data';
import { MdOutlineDeleteForever, MdOutlineRestore } from 'react-icons/md';

type BinTopProps = {
  theme: Theme,
  restoreTasks: ({taskId, type}: FunctionOption) => void,
  permanentlyDelete: ({taskId, type}: FunctionOption) => void,
  taskIdsToDelete: string[],
  taskCount: TaskBin,
  restoreLoading: boolean,
  permanentlyDeleteLoading: boolean,
  taskbinButtonClass: (theme:Theme, position:Position) => string,
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>
}

export default function BinTop({ theme, restoreTasks, restoreLoading, permanentlyDeleteLoading, permanentlyDelete, taskIdsToDelete, taskCount, setConfirmDelete, taskbinButtonClass }: BinTopProps) {

  return (
    <nav className={`sticky top-0 z-10 mobile:text-lg flex items-center justify-between ${theme == 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-0.5 ${taskIdsToDelete.length ? '' : ''}`}>
      <MdOutlineRestore 
        title="restore marked"
        onClick={() => restoreTasks({type: 'MULTI'})}  
        className={`${taskbinButtonClass(theme, 'NAV')} ${restoreLoading ? 'animate-spin' : 'animate-none'}`} 
      />
      <h2 
        title={taskIdsToDelete?.length >= 1 ? 'Marked count' : 'Bin count'}
        className="text-center font-bold text-xl">
        Task Bin 
      &nbsp;
      <span title={taskIdsToDelete?.length ? 'Marked count' : 'Bin count'} className={`${theme === 'light' ? '' : 'text-gray-300'} text-lg base font-mono ml-1`}>{taskIdsToDelete?.length ? checkCount(taskIdsToDelete) : checkCount(taskCount?.taskBin)}</span>
      
      </h2>
    
      <MdOutlineDeleteForever 
        title="trash marked"
        onClick={() => permanentlyDelete({type: 'MULTI'})}  
        className={`${taskbinButtonClass(theme, 'NAV')} ${permanentlyDeleteLoading ? 'animate-pulse' : 'animate-none'}`} 
      />
    
      <button 
        onClick={() => setConfirmDelete(true)}
        className={`text-base mobile:text-base capitalize text-white bg-red-600 rounded-md pl-1.5 pr-1.5 hover:bg-red-600 transition-all active:bg-red-400 ${taskIdsToDelete?.length ? 'scale-0 hidden' : 'scale-100'}`}>clear
      </button>
    </nav>
  )
}