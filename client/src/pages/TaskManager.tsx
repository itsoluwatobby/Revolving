import { FaHourglassEnd } from "react-icons/fa"
import { Footer } from "../components/Footer"
import { useThemeContext } from "../hooks/useThemeContext"
import { ChatOption, Theme, ThemeContextType } from "../posts"
import { IoIosSend } from "react-icons/io"
import { ChangeEvent, useState } from "react"
import { tasks } from "../tasks"
import { reduceLength } from "../utils/navigator"
import { format } from "timeago.js"
import { BsTrash } from "react-icons/bs"
import { CiEdit } from "react-icons/ci"
import { TaskProp } from "../data"
import { MdOutlineCancelPresentation } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { getTask, setTask } from "../features/story/taskManagerSlice"
import Tasks from "../components/taskManager/Tasks"
import { ViewSingleTask } from "../components/taskManager/ViewSingleTask"

export default function TaskManager() {
  const { theme } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [viewSingle, setViewSingle] = useState<ChatOption>('Hide')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputTask, setTaskInput] = useState<string>()
  const dispatch = useDispatch()
  
  const handleTaskEntry = (event: ChangeEvent<HTMLInputElement>) => setTaskInput(event.target.value)

  const canSubmit = Boolean(inputTask)

  return (
    <main className={`w-full h-full flex flex-col`}>
      <div className={`flex-grow ${theme == 'light' ? 'bg-slate-50' : ''} p-2 rounded-md w-full flex flex-col gap-3 h-4/6`}>

        <h2 className="font-bold text-4xl text-center sm:text-left">Tasks Manager</h2>
        <section className="hidebars relative shadow-2xl shadow-slate-900 h-[85%] flex flex-col gap-2 w-3/5 sm:w-1/2 mobile:w-full pb-1.5 rounded-lg">
          <form className={`flex-none shadow-xl ${theme == 'light' ? 'shadow-slate-400 bg-slate-600' : 'shadow-slate-800 bg-slate-700'} sm:w-3/4 w-full h-14 p-1 rounded-md sm:self-center flex items-center`}>
            <input 
              type="text"
              id={`task/${currentUserId}`}
              placeholder="Your new task"
              value={inputTask}
              onChange={handleTaskEntry}
              className={`placeholder:text-xl placeholder:font-serif text-xl rounded-md w-full h-full focus:outline-none pl-2 pr-2 ${theme == 'light' ? '' : 'text-black'}`}
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-12 grid place-content-center text-2xl ${canSubmit ? 'hover:opacity-50' : ''} text-green-400`}
            >
              {isLoading ?
                <FaHourglassEnd />
                :
                <IoIosSend />
              }
            </button>
          </form>
          <div className={`taskbars overflow-y-scroll p-1 flex flex-col gap-2 h-full`}>
            {
              tasks.map(task => (
                <Tasks 
                  key={task?._id}
                  task={task}
                  theme={theme}
                  setViewSingle={setViewSingle}
                />
              ))  
            }
          </div>
          <ViewSingleTask 
            theme={theme}
            viewSingle={viewSingle}
            setViewSingle={setViewSingle} 
          />
        </section>
      </div>
      <div>Recycle bin</div>
      <Footer />
    </main>
  )
}

