import { MdOutlineDeleteForever, MdOutlineRestore } from 'react-icons/md'
import { Button, FunctionOption, TaskProp } from '../../../data'
import { Theme } from '../../../posts'

type BinContentProps = {
  task: TaskProp,
  theme: Theme,
  restoreTasks: ({taskId, type}: FunctionOption) => void,
  permanentlyDelete: ({taskId, type}: FunctionOption) => void,
  taskIdsToDelete: string[],
  handleChecked: (taskId: string) => void,
  taskbinButton: (theme: Theme, type: Button) => string
}

export default function BinContent({ task, theme, taskIdsToDelete, restoreTasks, permanentlyDelete, handleChecked, taskbinButton }: BinContentProps) {

  
  return (
    <article
      className={`hidebars relative text-[13px] flex flex-col border border-dotted rounded p-1.5 pb-0 w-full shadow-md max-h-24 min-h-[75px] overflow-y-scroll ${taskIdsToDelete.includes(task._id) ? theme == 'light' ? 'bg-slate-300' : 'bg-slate-400' : ''}`}
    > 
      <div 
        title="mark"
        onClick={() => handleChecked(task._id)}
        className={`flex-grow cursor-pointer shadow-inner text-xs pr-2 pl-2 text-justify whitespace-pre-wrap tracking-tight ${theme == 'light' ? '' : 'bg-slate-900'}`}>
        <p className={`${task?.completed ? 'line-through' : ''}`}>{task?.task}</p>
      </div>
      <div className={`sticky ${theme == 'light' ? 'bg-white' : 'bg-slate-800'} flex-none bottom-0 w-full pr-1.5 pt-0.5 rounded-tl-sm rounded-tr-sm flex items-center justify-between`}>
        <p className="flex items-center gap-2.5 text-sm pl-1 pr-1 rounded-sm">
          <MdOutlineRestore 
            title="restore"
            onClick={() => restoreTasks({taskId: task._id, type: 'SINGLE'})}  
            className={taskbinButton(theme, 'RESTORE')} 
          />
          <MdOutlineDeleteForever
            title="trash" 
            onClick={() => permanentlyDelete({taskId: task._id, type: 'SINGLE'})}  
            className={taskbinButton(theme, 'DELETE')} 
          />
        </p>
        <small className="text-gray-400">{task?.completed ? 'completed' : 'not done'}</small>
      </div>
    </article>
  )
}