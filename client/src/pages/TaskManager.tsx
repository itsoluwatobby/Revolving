import { Footer } from "../components/Footer"
import { useThemeContext } from "../hooks/useThemeContext"
import { ChatOption, ThemeContextType } from "../posts"
import { useState } from "react"
import { tasks } from "../tasks"
import Tasks from "../components/taskManager/Tasks"
import { ViewSingleTask } from "../components/taskManager/ViewSingleTask"
import Form from "../components/taskManager/Form"

export default function TaskManager() {
  const { theme } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [viewSingle, setViewSingle] = useState<ChatOption>('Hide')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <main className={`w-full h-full flex flex-col`}>
      <div className={`flex-grow ${theme == 'light' ? 'bg-slate-50' : ''} p-2 rounded-md w-full flex flex-col gap-3 h-4/6`}>

        <h2 className="font-bold text-4xl text-center sm:text-left">Tasks Manager</h2>
        <section className="hidebars relative shadow-2xl shadow-slate-900 h-[85%] flex flex-col gap-2 w-3/5 sm:w-1/2 mobile:w-full pb-1.5 rounded-lg">
          <Form 
            isLoading={isLoading}
            theme={theme}
            currentUserId={currentUserId}
          />
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

