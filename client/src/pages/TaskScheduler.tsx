import { FaHourglassEnd } from "react-icons/fa"
import { Footer } from "../components/Footer"
import { useThemeContext } from "../hooks/useThemeContext"
import { ThemeContextType } from "../posts"
import { IoIosSend } from "react-icons/io"
import { ChangeEvent, useState } from "react"
import { tasks } from "../tasks"
import { reduceLength } from "../utils/navigator"


export default function TaskScheduler() {
  const { theme } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputTask, setTaskInput] = useState<string>()

  const handleTaskEntry = (event: ChangeEvent<HTMLInputElement>) => setTaskInput(event.target.value)

  return (
    <main className={`relative w-full h-full`}>
      <div className={`${theme == 'light' ? 'bg-slate-300' : ''} p-2 shadow-lg shadow-slate-400 rounded-md w-full`}>

        <h2 className="font-bold text-4xl">Tasks Manager</h2>
        <section className="flex flex-col gap-2">
          <form className="sm:w-1/3 w-4/5 h-14 bg-slate-500 p-1 rounded-md flex items-center">
            <input 
              type="text"
              id={`task/${currentUserId}`}
              placeholder="Your new task"
              value={inputTask}
              onChange={handleTaskEntry}
              className="placeholder:text-xl placeholder:font-serif text-xl rounded-md w-full h-full focus:outline-none pl-1 pr-1"
            />
            <button
              type="submit"
              className="w-10 grid place-content-center text-2xl text-green-400"
            >
              {
                <FaHourglassEnd />
                ||
                <IoIosSend />
              }
            </button>
          </form>
          <div>
              {
                tasks.map(task => (
                  <div 
                    key={task._id}
                    className="flex flex-col text-sm"
                  >
                    <span className='text-justify'>{reduceLength(task.tasks, 15, 'word')}</span>
                    <span>{task.createdAt}</span>
                  </div>
                ))
              }
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}