import React, { ChangeEvent, useState } from 'react'
import { TaskProp } from '../../data'
import { reduceLength } from '../../utils/navigator'
import { format } from 'timeago.js'
import { CiEdit } from 'react-icons/ci'
import { BsTrash } from 'react-icons/bs'
import { ChatOption, Theme } from '../../posts'
import { useDispatch } from 'react-redux'
import { tasks } from '../../tasks'
import { setTask } from '../../features/story/taskManagerSlice'

type TaskProps = {
  task: TaskProp,
  theme: Theme, 
  setViewSingle: React.Dispatch<React.SetStateAction<ChatOption>>
}

type ButtonType = 'EDIT' | 'DELETE'

function buttonClass(theme: Theme, type: ButtonType){
  return `
  rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[22px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-900'}
  `
}

export default function Tasks({ task, theme, setViewSingle }: TaskProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const dispatch = useDispatch()

  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => setIsChecked(event.target.checked)

  const viewTask = (taskId: string) => {
    setViewSingle('Open')
    const task = tasks.find(task => task._id == taskId) as TaskProp
    dispatch(setTask(task))
  }

  return (
    <article 
      title="Double tap to view"
      key={task._id}
      className="flex items-center gap-1 p-0.5 text-sm rounded-md shadow-inner shadow-slate-600"
    >
      <p className="flex-auto flex flex-col p-1">
        <span className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id={`${task?._id}`} 
            checked={isChecked}
            onChange={handleChecked}
            className={`flex-none w-5 bg-blue-700 rounded-md h-5 marker:bg-gray-500`} 
          />
          <label 
            htmlFor={`${task?._id}`}
            onDoubleClick={() => viewTask(task._id)}
            className={`${isChecked && 'text-gray-400 line-through'}`}
          >
            {reduceLength(task.task, 20, 'word')}
          </label>
        </span>
        <small className="text-right text-gray-400">{format(task.createdAt)}</small>
      </p>
      <p className={`flex-none w-8 shadow-lg rounded-md shadow-slate-600 h-full justify-center flex flex-col gap-1.5 p-0.5 items-center text-base`}>
        <CiEdit title="Edit" className={buttonClass(theme, 'EDIT')} />
        <BsTrash title="Delete" className={buttonClass(theme, 'DELETE')} />
      </p>
    </article>
  )
}