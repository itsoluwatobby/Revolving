import { ChangeEvent, useState } from "react"
import { SubTasks } from "../../data"

type SubTasksProps = {
  sub: SubTasks
}

export default function SubTasksAct({ sub }: SubTasksProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => setIsChecked(event.target.checked)

  return (
    <article className="flex cursor-pointer hover:opacity-80 rounded-md hover:pb-0.5 p-1 items-center justify-between w-52">
      <label 
        htmlFor={`${sub?.title}`} 
        className={`flex flex-col ${isChecked && 'text-gray-400 line-through'}`}
      >
        <span>{sub?.title}</span>
        <span className="">{sub?.body}</span>
      </label>
      <input 
        type="checkbox" 
        id={`${sub?.title}`} 
        checked={isChecked}
        onChange={handleChecked}
      />
    </article>
  )
}