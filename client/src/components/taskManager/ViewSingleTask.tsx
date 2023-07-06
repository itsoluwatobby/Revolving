import { useSelector } from "react-redux"
import { getTask, singleTask } from "../../features/story/taskManagerSlice"
import { ChatOption, Theme } from "../../posts"
import { MdOutlineCancelPresentation } from "react-icons/md"
import SubTasksAct from "./SubTasksAct"
import { RootState } from "../../app/store"

type TaskType = {
  theme: Theme,
  viewSingle: ChatOption,
  setViewSingle: React.Dispatch<React.SetStateAction<ChatOption>>
}

export const ViewSingleTask = ({ theme, viewSingle, setViewSingle }: TaskType) => {
  const { taskId } = useSelector(getTask)
  const task = useSelector((state: RootState) => singleTask(state, taskId))
  
  return (
    <article 
      className={`absolute left-1 top-16 h-[75%] transition-all grid place-content-center shadow-xl ${viewSingle == 'Open' ? 'scale-100' : 'scale-0'} ${theme == 'light' ? 'bg-slate-500 bg-opacity-40' : 'bg-slate-200 bg-opacity-60 shadow-slate-700'} w-[98%] z-10  rounded-md`}>
      <div className={`relative flex flex-col z-50 max-h-40 min-h-max maxscreen:w-[275px] sm:w-[245px] md:max-w-[400px] rounded-md ${theme == 'light' ? 'bg-slate-50' : 'bg-slate-700'}`}>
        <p className={`sticky top-0 flex items-center justify-center w-full ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-600'} rounded-t-md`}>
          <span className="font-medium">Task</span>
          <MdOutlineCancelPresentation
            onClick={() => setViewSingle('Hide')}
            className={`absolute right-0.5 text-2xl cursor-pointer ${theme == 'light' ? 'hover:text-gray-500 active:text-gray-700 text-gray-700' : 'text-gray-300 hover:text-gray-100'} transition-all active:text-gray-300`}
          />
        </p>
        <div 
          className="taskbars text-justify text-[12px] whitespace-pre-wrap p-2 pt-1 first-letter:uppercase overflow-y-scroll flex flex-col gap-1">
            {task?.task}
          <div className={`${task?.subTasks?.length ? 'block' : 'hidden'} text-xs text-gray-200 flex flex-col items-center bg-slate-800 rounded-md`}>
            <h4 className="font-extrabold font-mono tracking-widest uppercase bg-slate-600 p-1 pt-0.5 pb-0.5 w-full text-center shadow-inner shadow-slate-800">Sub Tasks</h4>
            {task?.subTasks?.length ? (
              task?.subTasks?.map((sub, index) => (
                  <SubTasksAct 
                    key={index}
                    sub={sub} 
                    theme={theme}
                  />
                ))
              ) : (
                <p className='cursor-pointer'>Tap to add</p>
              )
            }
          </div>
        </div>
      </div>
    </article>
  )
}