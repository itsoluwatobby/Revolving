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

type ButtonType = 'EDIT' | 'DELETE'

function buttonClass(theme: Theme, type: ButtonType){
  return `
  rounded-md ${type === 'EDIT' ? 'text-2xl' : 'text-[22px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-900'}
  `
}

export default function TaskManager() {
  const { theme } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [viewSingle, setViewSingle] = useState<ChatOption>('Hide')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputTask, setTaskInput] = useState<string>()
  const [task, setTask] = useState<TaskProp>()

  const handleTaskEntry = (event: ChangeEvent<HTMLInputElement>) => setTaskInput(event.target.value)

  const viewTask = (task: TaskProp) => {
    setViewSingle('Open')
    setTask(task)
  }

  return (
    <main className={`w-full h-full flex flex-col`}>
      <div className={`flex-grow ${theme == 'light' ? 'bg-slate-50' : ''} p-2 rounded-md w-full flex flex-col gap-3 h-4/6`}>

        <h2 className="font-bold text-4xl text-center sm:text-left">Tasks Manager</h2>
        <section className="hidebars relative shadow-2xl shadow-slate-900 h-[85%] flex flex-col gap-2 w-3/5 sm:w-1/2 pb-1.5 rounded-lg">
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
              className="w-12 grid place-content-center text-2xl text-green-400 "
            >
              {
                <FaHourglassEnd />
                ||
                <IoIosSend />
              }
            </button>
          </form>
          <div className={`taskbars overflow-y-scroll p-1 flex flex-col gap-2 h-full`}>
            {
              tasks.map(task => (
                <article 
                  key={task._id}
                  onClick={() => viewTask(task)}
                  className="flex items-center gap-1 p-0.5 text-sm rounded-md shadow-inner shadow-slate-600"
                >
                  <p className="flex-auto flex flex-col p-1">
                    <span className='text-justify tracking-tight cursor-grab'>{reduceLength(task.task, 22, 'word')}</span>
                    <small className="text-right text-gray-400">{format(task.createdAt)}</small>
                  </p>
                  <p className={`flex-none w-8 shadow-lg rounded-md shadow-slate-600 h-full justify-center flex flex-col gap-1.5 p-0.5 items-center text-base`}>
                    <CiEdit className={buttonClass(theme, 'EDIT')} />
                    <BsTrash className={buttonClass(theme, 'DELETE')} />
                  </p>
                </article>
              ))  
            }
          </div>
          <ViewWholeTaskCard 
            task={task as TaskProp}
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

type TaskType = {
  task: TaskProp,
  theme: Theme,
  viewSingle: ChatOption,
  setViewSingle: React.Dispatch<React.SetStateAction<ChatOption>>
}

const ViewWholeTaskCard = ({ task, theme, viewSingle, setViewSingle }: TaskType) => {

  return (
    <article className={`absolute left-1 top-16 h-[83%] transition-all grid place-content-center shadow-xl ${viewSingle == 'Open' ? 'scale-100' : 'scale-0'} ${theme == 'light' ? 'bg-slate-500 bg-opacity-40' : 'bg-slate-900 bg-opacity-60 shadow-slate-700'} w-[98%] z-10  rounded-md`}>
      <div className={`relative flex flex-col z-50 h-36 w-[98%] bg-red-600 rounded-md ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
        <p className="sticky top-0 flex items-center justify-center w-full bg-slate-300 rounded-t-md">
          <span className="text-lg font-medium">Task</span>
          <MdOutlineCancelPresentation 
            onClick={() => setViewSingle('Hide')}
            className={` absolute right-0.5 text-2xl cursor-pointer ${theme == 'light' ? 'hover:text-gray-500 active:text-gray-700 text-gray-700' : 'text-gray-300 hover:text-gray-100'} transition-all active:text-gray-300`}
          />
        </p>
        <div 
          className="taskbars text-justify text-[13px] whitespace-pre-wrap p-2 pt-0 overflow-y-scroll">{task?.task}
          <p className={`${task?.subTasks?.length ? 'block' : 'hidden'}`}>
            {
              task?.subTasks?.map(sub => (
                  <span>
                    <small>{sub?.title}</small>
                    <small>{sub?.body}</small>
                  </span>
                ))
            }
          </p>
        </div>
      </div>
    </article>
  )
}