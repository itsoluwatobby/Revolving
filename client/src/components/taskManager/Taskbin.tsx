import { useClearTaskBinMutation, useGetTaskBinQuery, usePermanentlyDeleteTasksMutation, useRestoreTasksMutation } from "../../app/api/taskApiSlice"
import { useState, useEffect, useCallback, ChangeEvent } from "react"
import { ErrorResponse, TaskBin } from "../../data"
import { ChatOption, Theme, ThemeContextType } from "../../posts"
import { toast } from "react-hot-toast"
import { useThemeContext } from "../../hooks/useThemeContext"
import { MdOutlineDeleteForever, MdOutlineRestore } from "react-icons/md"

type TaskBinProp = {
  userId: string,
}

type Button = 'RESTORE' | 'DELETE';
type Position = 'NAV' | 'NORM';
type FunctionOption = {
  type: 'SINGLE' | 'MULTI',
  taskId?: string
}

export default function Taskbin({ userId }: TaskBinProp) {
  const {data, isLoading, isError: isErrorBin} = useGetTaskBinQuery(userId as string)
  const[clearTaskBin, {isLoading: clearBinLoading, error: clearBinError, isError: isClearBinError}] = useClearTaskBinMutation()
  const[restoreTask, {isLoading: restoreLoading, error: restoreError, isError: isRestoreError}] = useRestoreTasksMutation()
  const[permanentlyDeleteTask, {isLoading: permanentlyDeleteLoading, error: permanentlyDeleteError, isError: isPermanentlyDeleteError}] = usePermanentlyDeleteTasksMutation();
  const [taskIdsToDelete, setTaskIdsToDelete] = useState<string[]>([]);
  const [tasksInBin, setTasksInBin] = useState<TaskBin>()
  const {setLoginPrompt, theme } = useThemeContext() as ThemeContextType
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const taskbinButton = useCallback((theme: Theme, type: Button, position: Position='NORM') => {
    return (
      `cursor-pointer ${theme == 'light' ? 'hover:text-gray-500' : 'hover:text-gray-300'} text-lg active:text-gray-100 transition-all ${(restoreLoading && type == 'RESTORE') ? 'animate-spin' : 'animate-none'} ${(permanentlyDeleteLoading && type == 'DELETE') ? 'animate-bounce' : 'animate-none'} ${(taskIdsToDelete.length && position == 'NORM') ? 'scale-0' : (!taskIdsToDelete.length && position == 'NAV') ? 'scale-0' : 'scale-100'}`
    )
  }, [permanentlyDeleteLoading, restoreLoading, taskIdsToDelete])

  const handleChecked = (taskId: string) => {
    if(taskIdsToDelete.includes(taskId)){
      const others = taskIdsToDelete.filter(id => id !== taskId)
      setTaskIdsToDelete([...others])
    }
    else{
      setTaskIdsToDelete(prev => ([...prev, taskId]))
    }
  }
  console.log({taskIdsToDelete})

  useEffect(() => {
    let isMounted = true
    isMounted ? setTasksInBin(data as TaskBin) : null
    return () => {
      isMounted = false
    }
  }, [data])

  const clearTasks = async() => {
    try{
      await clearTaskBin(userId).unwrap()
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = clearBinError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isClearBinError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const restoreTasks = async({taskId='', type='SINGLE'}: FunctionOption) => {
    if(type !== 'SINGLE' &&!taskIdsToDelete.length) return
    const idss: string[] = type == 'SINGLE' ? [taskId] : taskIdsToDelete
    try{
      await restoreTask({taskIds: idss, userId}).unwrap()
      setTaskIdsToDelete([])
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = restoreError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isRestoreError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000', color: '#FFFFFF'
        }
      })
    }
  }
  
  const permanentlyDelete = async({taskId='', type='SINGLE'}: FunctionOption) => {
    if(type !== 'SINGLE' &&!taskIdsToDelete.length) return
    const idss: string[] = type == 'SINGLE' ? [taskId] : taskIdsToDelete
    try{
      await permanentlyDeleteTask({taskIds: idss, userId}).unwrap()
      setTaskIdsToDelete([])
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = permanentlyDeleteError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isPermanentlyDeleteError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }
  console.log(tasksInBin)
  
  return (
    <div className="hidebars relative shadow-md h-[60%] rounded-md border w-1/2 overflow-y-scroll">
      <div className={`sticky top-0 z-40 flex items-center justify-between ${theme == 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-0.5 ${taskIdsToDelete.length ? '' : ''}`}>
        <MdOutlineRestore 
          onClick={() => restoreTasks({type: 'MULTI'})}  
          className={taskbinButton(theme, 'RESTORE', 'NAV')} 
        />
        <h2 className="text-center font-bold">Task Bin</h2>
      
        <MdOutlineDeleteForever 
          onClick={() => permanentlyDelete({type: 'MULTI'})}  
          className={taskbinButton(theme, 'DELETE', 'NAV')} 
        />
      
        <button 
          onClick={() => setConfirmDelete(true)}
          className={`text-sm text-white bg-red-600 rounded-md pl-2 pr-2 hover:bg-red-600 transition-all active:bg-red-400 ${taskIdsToDelete?.length ? 'scale-0 hidden' : 'scale-100'}`}>clear
        </button>
      </div>
      {
        isLoading ? 
        <div className="border-2 border-blue-400 rounded-full h-10 w-10 animate-spin m-auto translate-y-60"/> 
        : isErrorBin ? 
          <div>Error</div>
        :
        <div className={`flex flex-wrap w-full h-full p-1 gap-1 ${clearBinLoading ? 'animate-pulse' : 'animate-none'}`}>
          {
            tasksInBin?.taskBin?.length ?
              tasksInBin?.taskBin?.map(task => (
                <div key={task._id}
                  title="mark"
                  className={`hidebars relative text-[13px] flex flex-col cursor-pointer rounded p-1.5 pb-0 w-full md-1/2 shadow-md max-h-24 min-h-[75px] overflow-y-scroll ${taskIdsToDelete.includes(task._id) ? theme == 'light' ? 'bg-slate-300' : 'bg-slate-900' : ''}`}
                > 
                  <div 
                    onClick={() => handleChecked(task._id)}
                    className="flex-grow">
                    <p className={`${task?.completed ? 'line-through' : ''} pr-2`}>{task?.task}</p>
                  </div>
                  <div className="sticky flex-none bottom-0 w-full pr-1.5 pt-0.5 flex items-center justify-between">
                    <p className="flex items-center gap-2.5 text-sm pl-1 pr-1 rounded-sm">
                      <MdOutlineRestore 
                        onClick={() => restoreTasks({taskId: task._id, type: 'SINGLE'})}  
                        className={taskbinButton(theme, 'RESTORE')} 
                      />
                      <MdOutlineDeleteForever 
                        onClick={() => permanentlyDelete({taskId: task._id, type: 'SINGLE'})}  
                        className={taskbinButton(theme, 'DELETE')} 
                      />
                    </p>
                    <small className="text-gray-400">{task?.completed ? 'completed' : 'not done'}</small>
                  </div>
                </div>
              )) 
            : <p>Empty bin</p>
          }
        </div>
      }
      <div className={`absolute ${confirmDelete ? 'flex' : 'hidden'} rounded-md shadow-xl w-[85%] text-sm md:w-[60%] left-5 border bg-white top-32 h-14 items-center gap-2 justify-center z-30`}>
        <button 
        onClick={clearTasks}
        className="p-0.5 text-white bg-red-500 rounded-md pl-2 pr-2 hover:bg-red-600 transition-all active:bg-red-500">Confirm</button>
        <button 
        onClick={() => setConfirmDelete(false)}
        className="p-0.5 text-white bg-blue-500 rounded-md pl-2 pr-2 hover:bg-blue-600 transition-all active:bg-blue-500">Cancel</button>
      </div>
    </div>
  )
}