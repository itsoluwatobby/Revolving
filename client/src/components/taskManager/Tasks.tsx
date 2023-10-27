import { format } from 'timeago.js';
import { toast } from 'react-hot-toast';
import { CiEdit } from 'react-icons/ci';
import { BsTrash } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import React, { useCallback } from 'react';
import { useThemeContext } from '../../hooks/useThemeContext';
import { setTask } from '../../features/story/taskManagerSlice';
import { ErrorStyle, reduceLength } from '../../utils/navigator';
import { ChatOption, Theme, ThemeContextType } from '../../types/posts';
import { ButtonType, EditTaskOption, ErrorResponse, TaskProp } from '../../types/data';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../../app/api/taskApiSlice';

type TaskProps = {
  task: TaskProp,
  theme: Theme, 
  setViewSingle: React.Dispatch<React.SetStateAction<ChatOption>>
}

export default function Tasks({ task, theme, setViewSingle }: TaskProps) {
  const {setLoginPrompt} = useThemeContext() as ThemeContextType
  const [updateTask, {isLoading: isLoadingUpdate, isError: isErrorUpdate, error: errorUpdate}] = useUpdateTaskMutation();
  const [deleteTask, {isLoading: isLoadingDelete, isError: isErrorDelete, error: errorDelete}] = useDeleteTaskMutation();
  const dispatch = useDispatch()
  const buttonClass = useCallback((theme: Theme, type: ButtonType) => {
    return `
    rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[22px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-900'}
    `
  }, [])

  const handleChecked = async() => {
    task = {...task, completed: !task?.completed}
    try{
      await updateTask({ userId: task.userId, task: task }).unwrap()
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (errorUpdate as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      isErrorUpdate && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
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

  const deleteOneTask = async() => {
    try{
      await deleteTask({ userId: task.userId, taskId: task._id }).unwrap()
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (errorDelete as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      isErrorDelete && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  return (
    <article 
      key={task._id}
      className={`relative flex items-center mobile:text-sm text-xs gap-1 p-0.5 pl-1.5 pb-2 rounded-md shadow-inner shadow-slate-600 ${(isLoadingUpdate || isLoadingDelete) ? 'animate-pulse' : ''}`}
    >
      <input 
        type="checkbox" 
        id={`${task?._id}`} 
        checked={task.completed}
        onChange={handleChecked}
        className={`absolute top-1.5 flex-none w-4 bg-blue-700 h-4 marker:bg-gray-500 cursor-pointer rounded-lg`} 
      />
      <p className="relative flex-auto flex items-center gap-3 p-0.5 pt-0 self-start max-h-14">
        <label 
          htmlFor={`${task?._id}`}
          className={`${task.completed && 'text-gray-400 line-through'} leading-tight pl-5 pt-0.5`}
        >
          {reduceLength(task.task, 20, 'word')}
        </label>
      </p>
      <p className={`flex-none w-8 shadow-lg rounded-md shadow-slate-600 h-full justify-center flex flex-col gap-1.5 p-0.5 items-center text-base`}>
        <CiEdit 
          onClick={() => viewTask(task._id, 'EDIT')}
          title="Edit" className={buttonClass(theme, 'EDIT')} />
        <BsTrash
          onClick={deleteOneTask} 
          title="Delete" className={buttonClass(theme, 'DELETE')} />
      </p>
      <small 
        onClick={() => viewTask(task._id, 'VIEW')}
        className={`absolute bottom-0 ${(task.task?.length > 130 ||task.subTasks?.length) ? '' : 'hidden'} ${theme == 'light' ? ' hover:opacity-70 text-gray-600' : 'text-gray-400 hover:opacity-90'} cursor-pointer left-1`}>expand</small>
        <small className="absolute right-10 bottom-0 text-gray-400 text-[10px]">{format(task.createdAt)}</small>
    </article>
  )
}