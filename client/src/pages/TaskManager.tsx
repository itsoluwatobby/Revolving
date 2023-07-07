import { Footer } from "../components/Footer"
import { useThemeContext } from "../hooks/useThemeContext"
import { ChatOption, ThemeContextType } from "../posts"
import { useState, useEffect } from "react"
import Tasks from "../components/taskManager/Tasks"
import { ViewSingleTask } from "../components/taskManager/ViewSingleTask"
import Form from "../components/taskManager/Form"
import { useGetUserTasksQuery } from "../app/api/taskApiSlice";
import { ErrorResponse, TaskProp } from "../data"
import { SkeletonTask } from "../components/skeletons/SkeletonTask"
import { useDispatch } from "react-redux"
import { setAllTasks } from "../features/story/taskManagerSlice"
import { useParams } from "react-router-dom"
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types"
// import { tasks } from "../tasks"

const REFRESH_RATE = 10_000 as const

export default function TaskManager() {
  const { theme } = useThemeContext() as ThemeContextType
  const { userId } = useParams()
  const {data, isLoading: loadingTasks, isError, error, refetch} = useGetUserTasksQuery(userId as string)
  const [viewSingle, setViewSingle] = useState<ChatOption>('Hide')
  const [tasks, setTasks] = useState<TaskProp[]>([])
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true
    isMounted ? setTasks(data as TaskProp[]) : null
    isMounted ? dispatch(setAllTasks(data as TaskProp[])) : null
    return () => {
      isMounted = false
    }
  }, [data, dispatch])

  useEffect(() => {
    let timerId: TimeoutId
    if(!tasks?.length && isError && errorMsg?.status != 404){
      timerId = setInterval(async() => {
        await refetch()
      }, REFRESH_RATE)
    }
    return () => clearInterval(timerId)
  }, [tasks, isError, errorMsg?.status, refetch])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  let taskContent;

  loadingTasks ? taskContent = (
    <SkeletonTask />
  ) : isError ? taskContent = (
    <p className='text-center mt-5 text-sm'>
    {
      errorMsg?.status == 404 ? 
        <span className='flex flex-col gap-2 font-serif'>
          <small>No Tasks</small>
        </span> 
        : errorMsg?.status == 401 ? 
        <span>Please login, Session ended</span>
        :  <span>Network Error, Please check your connection</span>
      }
    </p>
  ) : taskContent = (
    <>
      {tasks?.length ?
        tasks?.map(task => (
          <Tasks 
            key={task?._id}
            task={task}
            theme={theme}
            setViewSingle={setViewSingle}
          />
        )) : null
      }
    </>
  )


  return (
    <main className={`w-full h-full flex flex-col`}>
      <div className={`flex-grow ${theme == 'light' ? 'bg-slate-50' : ''} p-2 rounded-md w-full flex flex-col gap-3 h-4/6`}>

        <h2 className="font-bold text-4xl text-center sm:text-left">Tasks Manager</h2>
        <section className="hidebars relative shadow-2xl shadow-slate-900 max-h-96 flex flex-col gap-2 w-3/5 sm:w-1/2 mobile:w-full pb-1.5 rounded-lg border border-dotted border-slate-400">
          <Form 
            currentUserId={userId as string}
          />
          <div className={`taskbars overflow-y-scroll p-1 flex flex-col gap-2 h-full`}>
            {taskContent}
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

