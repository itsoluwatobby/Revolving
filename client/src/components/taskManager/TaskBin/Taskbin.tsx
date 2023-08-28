import { useClearTaskBinMutation, useGetTaskBinQuery, usePermanentlyDeleteTasksMutation, useRestoreTasksMutation } from "../../../app/api/taskApiSlice"
import { useState, useEffect, useCallback } from "react"
import { ErrorResponse, FunctionOption, Position, TaskBin } from "../../../data"
import { Theme, ThemeContextType } from "../../../posts"
import { toast } from "react-hot-toast"
import { useThemeContext } from "../../../hooks/useThemeContext"
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types"
import { ErrorStyle, REFRESH_RATE } from "../../../utils/navigator"
import BinContent from "./BinContent"
import BinTop from "./BinTop"

type TaskBinProp = {
  userId: string,
}

export default function Taskbin({ userId }: TaskBinProp) {
  const {data, isLoading, isError: isErrorBin, error, refetch} = useGetTaskBinQuery(userId as string)
  const [clearTaskBin, {isLoading: clearBinLoading, error: clearBinError, isError: isClearBinError}] = useClearTaskBinMutation()
  const [restoreTask, {isLoading: restoreLoading, error: restoreError, isError: isRestoreError}] = useRestoreTasksMutation()
  const [permanentlyDeleteTask, {isLoading: permanentlyDeleteLoading, error: permanentlyDeleteError, isError: isPermanentlyDeleteError}] = usePermanentlyDeleteTasksMutation();
  const [taskIdsToDelete, setTaskIdsToDelete] = useState<string[]>([]);
  const [tasksInBin, setTasksInBin] = useState<TaskBin>()
  const {setLoginPrompt, theme } = useThemeContext() as ThemeContextType
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();
  const taskbinButtonClass = useCallback((theme:Theme, position:Position='NORM') => {
    return (
      `cursor-pointer ${theme == 'light' ? 'hover:text-gray-500' : 'hover:text-gray-300'} text-base active:text-gray-100 transition-all ${(taskIdsToDelete.length && position == 'NORM') ? 'scale-0' : (!taskIdsToDelete.length && position == 'NAV') ? 'scale-0 hidden' : 'scale-100'} mobile:text-2xl`
    )
  }, [taskIdsToDelete])

  const sortedTasks = tasksInBin?.taskBin?.slice().sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))

  const handleChecked = (taskId: string) => {
    if(taskIdsToDelete.includes(taskId)){
      const others = taskIdsToDelete.filter(id => id !== taskId)
      setTaskIdsToDelete([...others])
    }
    else{
      setTaskIdsToDelete(prev => ([...prev, taskId]))
    }
  }

  useEffect(() => {
    let isMounted = true
    isMounted ? setTasksInBin(data as TaskBin) : null
    return () => {
      isMounted = false
    }
  }, [data])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  useEffect(() => {
    let timerId: TimeoutId
    if(!data || (isErrorBin && errorMsg?.status != 404)){
      timerId = setInterval(async() => {
        await refetch()
      }, REFRESH_RATE)
    }
    return () => clearInterval(timerId)
  }, [data, isErrorBin, errorMsg?.status, refetch])

  const clearTasks = async() => {
    try{
      await clearTaskBin(userId).unwrap()
      setConfirmDelete(false)
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (clearBinError as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isClearBinError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  const restoreTasks = async({taskId='', type='SINGLE'}: FunctionOption) => {
    if(type !== 'SINGLE' &&!taskIdsToDelete.length) return
    const idss: string[] = type == 'SINGLE' ? [taskId] : taskIdsToDelete
    try{
      await restoreTask({taskIds: { taskIds: idss }, userId}).unwrap()
      setTaskIdsToDelete([])
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (restoreError as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isRestoreError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  const permanentlyDelete = async({taskId='', type='SINGLE'}: FunctionOption) => {
    if(type !== 'SINGLE' &&!taskIdsToDelete.length) return
    const idss: string[] = type == 'SINGLE' ? [taskId] : taskIdsToDelete
    try{
      await permanentlyDeleteTask({taskIds: { taskIds: idss }, userId}).unwrap()
      setTaskIdsToDelete([])
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (permanentlyDeleteError as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isPermanentlyDeleteError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }
 
  let binContent;

  isLoading ? binContent = (
        <div className="border-2 border-blue-400 rounded-full h-10 w-10 animate-spin m-auto translate-y-60"/> 
        )
        : isErrorBin ? binContent = (
          <p className='self-center mt-5 text-sm whitespace-pre-wrap p-1 m-auto w-full'>
            {
              errorMsg?.status == 404 ? 
                <span className='flex flex-col gap-2 font-serif'>
                  <small>No Tasks</small>
                </span> 
                : errorMsg?.status == 401 ? 
                <span>Please login, Session ended</span>
                :  <span>Network Error, Please check your connection</span>
            }
          </p>
        )
        : binContent = (
          <div className={`flex flex-col md:flex-row md:justify-between md:flex-wrap w-full h-full p-1 gap-1 ${clearBinLoading ? 'animate-pulse' : 'animate-none'}`}>
            {
              tasksInBin?.taskBin?.length ?
                sortedTasks?.map(task => (
                  <BinContent key={task?._id} 
                    task={task} theme={theme}
                    taskIdsToDelete={taskIdsToDelete}
                    restoreTasks={restoreTasks}
                    restoreLoading={restoreLoading}
                    permanentlyDeleteLoading={permanentlyDeleteLoading}
                    permanentlyDelete={permanentlyDelete}
                    handleChecked={handleChecked}
                    taskbinButtonClass={taskbinButtonClass}
                  />
                )) 
              : 
              (
                <p className='flex flex-col gap-2 font-serif m-auto'>
                  <small>Empty bin</small>
                </p> 
              )
            }
          </div>
        )


  return (
    <div className="hidebars relative shadow-md max-h-full rounded-md w-full overflow-y-scroll text-sm mobile:text-base">
      <BinTop 
        theme={theme}
        restoreTasks={restoreTasks}
        restoreLoading={restoreLoading}
        permanentlyDeleteLoading={permanentlyDeleteLoading}
        permanentlyDelete={permanentlyDelete}
        taskIdsToDelete={taskIdsToDelete}
        taskbinButtonClass={taskbinButtonClass}
        setConfirmDelete={setConfirmDelete}
        taskCount={tasksInBin as TaskBin}
      />
      
      {binContent}

      <div className={`absolute ${clearBinLoading ? 'animate-pulse' : 'animate-none'} left-5 top-10 ${confirmDelete ? 'flex' : 'hidden'} rounded-md shadow-xl text-sm w-fit px-1.5 border bg-white h-14 items-center gap-2 justify-center z-30`}>
        <button 
          onClick={clearTasks}
          className="p-0.5 text-white bg-red-500 rounded-md pl-2 pr-2 hover:bg-red-600 transition-all active:bg-red-500">Confirm</button>
        <button 
        onClick={() => setConfirmDelete(false)}
        className="p-0.5 text-white bg-blue-500 rounded-md pl-2 pr-2 hover:bg-blue-600 transition-all active:bg-blue-500">
          Cancel
        </button>
      </div>
    </div>
  )
}