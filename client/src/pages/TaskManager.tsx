import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { REFRESH_RATE } from "../utils/navigator";
import Form from "../components/taskManager/Form";
import Tasks from "../components/taskManager/Tasks";
import { LeftSection } from "../components/LeftSection";
import { ErrorResponse, TaskProp } from "../types/data";
import { useThemeContext } from "../hooks/useThemeContext";
import { ChatOption, ThemeContextType } from "../types/posts";
import { useGetUserTasksQuery } from "../app/api/taskApiSlice";
import Taskbin from "../components/taskManager/TaskBin/Taskbin";
import { setAllTasks } from "../features/story/taskManagerSlice";
import { SkeletonTask } from "../components/skeletons/SkeletonTask";
import { ViewSingleTask } from "../components/taskManager/ViewSingleTask";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";

type TogglerPosition = 'LEFT' | 'RIGHT'
export default function TaskManager() {
  const { theme } = useThemeContext() as ThemeContextType
  const { userId } = useParams()
  const {data, isLoading: loadingTasks, isError, error, refetch} = useGetUserTasksQuery(userId as string)
  const [viewSingle, setViewSingle] = useState<ChatOption>('Hide')
  const [toggleButton, setToggleButton] = useState<TogglerPosition>('LEFT')
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
    if(!data?.length && (isError && errorMsg?.status != 404)){
      timerId = setInterval(async() => {
        await refetch()
      }, REFRESH_RATE)
    }
    return () => clearInterval(timerId)
  }, [data, isError, errorMsg?.status, refetch])

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
    <p className='text-center mt-5 text-sm whitespace-pre-wrap'>
    {
      errorMsg?.status === 'FETCH_ERROR' ?
        <span>SERVER ERROR</span> 
        : 
      errorMsg?.status == 404 ? 
        <span className='flex flex-col gap-2 font-serif'>
          <small>No Tasks</small>
        </span> 
        : 
      errorMsg?.status == 401 ? 
        <span>Please login, Session ended</span>
        : 
        <span>Network Error, Please check your connection</span>
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
    <main className={`w-full flex`}>
      
      <LeftSection />

      <div className={`taskManager_page w-full flex flex-col pt-2`}>
        <section className="relative flex-grow flex justify-between p-2">

          <div className={`flex-grow ${theme == 'light' ? 'bg-slate-50' : ''} p-2 rounded-md w-[75%] ${toggleButton === 'LEFT' ? 'flex mobile:flex' : 'flex mobile:hidden'} flex-col maxscreen:items-center gap-3 h-[28rem] box-border`}>

            <h2 className="font-bold text-4xl text-center sm:text-left">Tasks Manager</h2>
            <section className={`hidebars relative shadow-md shadow-slate-800 max-h-96 flex flex-col gap-2 w-[95%] sm:w-3/4 mobile:w-full pb-1.5 rounded-lg border border-dotted border-slate-400`}>
              <Form 
                currentUserId={userId as string}
              />
              <div className={`taskbars overflow-y-scroll p-1 flex flex-col gap-2 h-full w-full`}>
                {taskContent}
              </div>
              <ViewSingleTask 
                theme={theme}
                viewSingle={viewSingle}
                setViewSingle={setViewSingle} 
              />
            </section>
          </div>

          <div className={`flex-none p-2 pt-6 mobile:pt-14 mobile:w-[95%] mobile:translate-x-2 mobile:items-center rounded-md w-[40%] h-[28rem] ${toggleButton === 'RIGHT' ? 'flex mobile:flex' : 'flex mobile:hidden'}`}>
            <Taskbin 
              userId={userId as string}
            />
          </div>
          {/* Toggler Button */}
          <div 
            className={`absolute hidden mobile:block w-14 h-7 bg-slate-500 p-0.5 rounded-full left-5 top-7 items-center transition-all`}>
            <p 
              title={toggleButton === 'LEFT' ? 'View Bin' : 'View Tasks'}
              onClick={() => setToggleButton(prev => prev === 'LEFT' ? prev = 'RIGHT' : prev = 'LEFT')}  
              className={`w-1/2 h-full duration-300 ${toggleButton === 'LEFT' ? 'bg-gray-50' : 'translate-x-6 bg-green-500'} shadow-2xl cursor-pointer transition-all hover:bg-opacity-80 active:bg-opacity-100 rounded-full`}
            />
          </div>

        </section>

        <Footer 
          tasks={tasks}
          userId={userId as string}
        />

    </div>

    </main>
  )
}

