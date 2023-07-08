import React, { useCallback, useState } from 'react'
import { ButtonType, EditTaskOption, ErrorResponse, TaskProp } from '../../data'
import { reduceLength } from '../../utils/navigator'
import { format } from 'timeago.js'
import { CiEdit } from 'react-icons/ci'
import { BsTrash } from 'react-icons/bs'
import { ChatOption, Theme, ThemeContextType } from '../../posts'
import { useDispatch } from 'react-redux';
import { setTask } from '../../features/story/taskManagerSlice'
import { useUpdateTaskMutation } from '../../app/api/taskApiSlice'
import { toast } from 'react-hot-toast'
import { useThemeContext } from '../../hooks/useThemeContext'

type TaskProps = {
  task: TaskProp,
  theme: Theme, 
  setViewSingle: React.Dispatch<React.SetStateAction<ChatOption>>
}

// function buttonClass(theme: Theme, type: ButtonType){
//   return `
//   rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[22px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-900'}
//   `
// }

export default function Tasks({ task, theme, setViewSingle }: TaskProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const {setLoginPrompt} = useThemeContext() as ThemeContextType
  const [updateTask, {isLoading: isLoadingUpdate, isError: isErrorUpdate, error: errorUpdate}] = useUpdateTaskMutation();
  const dispatch = useDispatch()
  const buttonClass = useCallback((theme: Theme, type: ButtonType) => {
    return `
    rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[22px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-800' : 'bg-slate-900'}
    `
  }, [])

  const handleChecked = async() => {
    task = {...task, completed: !task?.completed}
    try{
      await updateTask({ userId: task.userId, task: task }).unwrap()
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = errorUpdate as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isErrorUpdate && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const viewTask = (taskId: string, option: EditTaskOption) => {
    if(option === 'EDIT'){
      dispatch(setTask({taskId, option: 'EDIT'}))
    }
    else if(option === 'VIEW'){
      setViewSingle('Open')
      dispatch(setTask({taskId, option: 'VIEW'}))
    }
  }

  const update = async(task: TaskProp) => {
    // if(!debouncedInput.value?.length) return
    console.log(task)
    return
    const newTask = {
      userId: task.userId,
      completed: false,
      task: task.task
    } as Partial<TaskProp>
    try{
      await updateTask({ userId: task.userId, task: newTask }).unwrap()
      // setTaskInput('')
      // setDebouncedInput({value: '', isTyping: 'notTyping'})
      // setTaskRequest('Hide')
      // setPrompt('Hide')
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = errorUpdate as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isErrorUpdate && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }


  return (
    <article 
      key={task._id}
      className={`relative flex items-center gap-1 p-0.5 text-sm rounded-md shadow-inner shadow-slate-600 ${isLoadingUpdate ? 'animate-pulse' : ''}`}
    >
      <p className="flex-auto flex flex-col p-0.5 ">
        <span className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id={`${task?._id}`} 
            checked={task.completed}
            onChange={handleChecked}
            className={`flex-none w-4 bg-blue-700 rounded-md h-4 marker:bg-gray-500`} 
          />
          <label 
            htmlFor={`${task?._id}`}
            className={`${task.completed && 'text-gray-400 line-through'} lead leading-tight`}
          >
            {reduceLength(task.task, 20, 'word')}
          </label>
        </span>
        <small className="text-right text-gray-400">{format(task.createdAt)}</small>
      </p>
      <p className={`flex-none w-8 shadow-lg rounded-md shadow-slate-600 h-full justify-center flex flex-col gap-1.5 p-0.5 items-center text-base`}>
        <CiEdit 
          onClick={() => viewTask(task._id, 'EDIT')}
          title="Edit" className={buttonClass(theme, 'EDIT')} />
        <BsTrash title="Delete" className={buttonClass(theme, 'DELETE')} />
      </p>
      <small 
        onClick={() => viewTask(task._id, 'VIEW')}
        className={`absolute bottom-0 text-gray-600 ${task.subTasks?.length ? '' : 'hidden'} cursor-pointer hover:opacity-70 left-1`}>expand</small>
    </article>
  )
}