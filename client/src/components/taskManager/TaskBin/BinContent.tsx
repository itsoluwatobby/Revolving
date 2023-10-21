import { Theme } from '../../../types/posts';
import { MdOutlineDeleteForever, MdOutlineRestore } from 'react-icons/md';
import { FunctionOption, Position, TaskProp } from '../../../types/data';

type BinContentProps = {
  task: TaskProp,
  theme: Theme,
  restoreTasks: ({taskId, type}: FunctionOption) => void,
  permanentlyDelete: ({taskId, type}: FunctionOption) => void,
  taskIdsToDelete: string[],
  restoreLoading: boolean,
  permanentlyDeleteLoading: boolean,
  handleChecked: (taskId: string) => void,
  taskbinButtonClass: (theme:Theme, position:Position) => string
}

export default function BinContent({ task, theme, taskIdsToDelete, restoreLoading, permanentlyDeleteLoading, restoreTasks, permanentlyDelete, handleChecked, taskbinButtonClass }: BinContentProps) {

  return (
    <article
      className={`hidebars relative text-[13px] flex flex-col border border-dotted rounded p-1.5 pb-0 w-full shadow-md max-h-24 mobile:min-h-[95px] min-h-[75px] overflow-y-scroll ${taskIdsToDelete.includes(task._id) ? theme == 'light' ? 'bg-green-200' : 'bg-slate-400' : ''}`}
    > 
      <div 
        title="mark"
        onClick={() => handleChecked(task._id)}
        className={`flex-grow cursor-pointer shadow-inner text-xs mobile:text-base pr-2 pl-2 text-justify whitespace-pre-wrap tracking-tight ${theme == 'light' ? '' : 'bg-slate-900'}`}>
        <p className={`${task?.completed ? 'line-through' : ''}`}>{task?.task}</p>
      </div>
      <div className={`sticky ${theme == 'light' ? 'bg-white' : 'bg-slate-800'} flex-none bottom-0 w-full pr-1.5 pt-0.5 rounded-tl-sm rounded-tr-sm flex items-center justify-between`}>
        <p className="flex items-center gap-2.5 text-sm pl-1 pr-1 rounded-sm">
          <MdOutlineRestore 
            title="restore"
            onClick={() => restoreTasks({taskId: task._id, type: 'SINGLE'})}
            className={`${taskbinButtonClass(theme, 'NORM')} ${restoreLoading ? 'animate-spin' : 'animate-none'}`} 
          />
          <MdOutlineDeleteForever
            title="trash" 
            onClick={() => permanentlyDelete({taskId: task._id, type: 'SINGLE'})}  
            className={`${taskbinButtonClass(theme, 'NORM')} ${permanentlyDeleteLoading ? 'animate-pulse' : 'animate-none'}`} 
          />
        </p>
        <small className="text-gray-400">{task?.completed ? 'completed' : 'not done'}</small>
      </div>
    </article>
  )
}