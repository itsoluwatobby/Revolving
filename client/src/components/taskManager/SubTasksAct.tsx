import { BsTrash } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { Theme } from "../../types/posts";
import { ChangeEvent, useState } from "react";
import { ButtonType, SubTasks } from "../../types/data";

type SubTasksProps = {
  sub: SubTasks,
  theme: Theme
}

export default function SubTasksAct({ sub, theme }: SubTasksProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => setIsChecked(event.target.checked)

  return (
    <article className="relative flex cursor-pointer hover:opacity-80 rounded-md hover:pb-0.5 p-1 items-center justify-between w-52">
      <label 
        htmlFor={`${sub?.title}`} 
        className={`flex flex-col ${isChecked && 'text-gray-400 line-through'}`}
      >
        <span className="capitalize underline underline-offset-2">{sub?.title}</span>
        <span className="">{sub?.body}</span>
      </label>
      <input 
        type="checkbox" 
        id={`${sub?.title}`} 
        checked={isChecked}
        onChange={handleChecked}
      />
      <div 
        className="absolute flex items-center gap-0.5">
        <IoMdAdd
          title="Add task" 
          onClick={() => ''}
          className={`flex-none w-4 h-4 text-center rounded-md text-sm bg-slate-900 hover:opacity-90 cursor-pointer`}
        />
         <BsTrash title="Delete" className={buttonClass(theme, 'DELETE')} />
      </div>
    </article>
  )
}

function buttonClass(theme: Theme, type: ButtonType){
  return `
  rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[20px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-900'}
  `
}
