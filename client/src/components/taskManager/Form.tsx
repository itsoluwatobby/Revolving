import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState  } from "react"
import { FaHourglassEnd } from "react-icons/fa"
import { IoIosSend, IoMdAdd } from "react-icons/io"
import { ChatOption, Theme, ThemeContextType } from "../../posts"
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types"
import { CreatePrompt, ErrorResponse, InputTaskProp, TaskProp } from "../../data"
import { useDispatch, useSelector } from "react-redux"
import { getTask, setTask, singleTask } from "../../features/story/taskManagerSlice"
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../app/api/taskApiSlice"
import { RootState } from "../../app/store"
import { toast } from "react-hot-toast"
import { useThemeContext } from "../../hooks/useThemeContext"
import { ErrorStyle } from "../../utils/navigator"

type FormProps = {
  currentUserId: string
}

const DEBOUNCEDTIMEOUT = 350 as const
const DELAY = 15_000 as const
const SUB_DELAY = 10_000 as const

export default function Form({ currentUserId }: FormProps) {
  const { taskId, option } = useSelector(getTask);
  const { setLoginPrompt, theme } = useThemeContext() as ThemeContextType;
  const [taskRequest, setTaskRequest] = useState<ChatOption>('Hide');
  const task = useSelector((state: RootState) => singleTask(state, taskId));
  const [prompt, setPrompt] = useState<CreatePrompt>('Hide');
  const [noActivity, setNoActivity] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [taskInput, setTaskInput] = useState<string>('');
  const dispatch = useDispatch()
  const [createTask, {isLoading, isError, error}] = useCreateTaskMutation();
  const [updateTask, {isLoading: isLoadingUpdate}] = useUpdateTaskMutation();
  const [debouncedInput, setDebouncedInput] = useState<InputTaskProp>({
    value: '', isTyping: 'notTyping'
  });
  const [stoppedTyping, setStoppedTyping] = useState<boolean>(false)
  const getTaskButtonClass = useCallback((theme: Theme) => {
    return `
      rounded-md cursor-pointer p-1 hover:opacity-50 transition-all, w-14 text-center active:opacity-100 ${theme === 'light' ? 'bg-slate-500' : 'bg-slate-600'}
    `
  }, [])

  const handleTaskEntry = (event: ChangeEvent<HTMLInputElement>) => setTaskInput(event.target.value);

  useEffect(() => {
    if(option === 'EDIT'){
      setTaskInput(task?.task as string)
      setTaskRequest('Open')
      setPrompt('Hide')
    }
  }, [option, task?.task])

  // DEBOUNCED INPUT.
  useEffect(() => {
    let isMounted = true
    isMounted && setDebouncedInput(prev => ({...prev, isTyping: 'typing'}))
    const timerId = setTimeout(() => {
      setDebouncedInput({value: taskInput as string, isTyping: 'notTyping'})
    }, DEBOUNCEDTIMEOUT);
    return () => {
      isMounted = false
      clearTimeout(timerId)
    }
  }, [taskInput])

  // focus cursor on task request
  useEffect(() => {
    if(taskRequest == 'Open' && inputRef?.current) inputRef?.current.focus()
  }, [taskRequest, prompt])

  // WHEN TYPING IS PAUSED
  useEffect(() => {
    let timerId: TimeoutId
    if(debouncedInput.isTyping === 'notTyping' && debouncedInput.value?.length >= 1){
      timerId = setTimeout(() => {
        setPrompt('Open')
        setStoppedTyping(true)
      }, 20000);
    }
    return () => {
      clearTimeout(timerId)
    }
  }, [debouncedInput.isTyping, debouncedInput.value, prompt])

  // NO ACTIVITY && CLOSE PROMPT
  useEffect(() => {
    let timerId: TimeoutId
    const result = prompt === 'Idle' && taskRequest == 'Open' && taskInput?.length == 0
    if(result){
        timerId =setTimeout(() => {
          setPrompt('Nil')
          setTaskRequest('Hide')
          setTaskInput('')
        }, SUB_DELAY);
    }
    return () => clearTimeout(timerId)
  }, [prompt, taskInput, taskRequest])
  
  // task request is open and no entry is been made
  useEffect(() => {
    let timerId: TimeoutId
    const result = (prompt !== 'Nil' && prompt !== 'Idle' && taskRequest == 'Open') && (taskInput == undefined || taskInput?.length == 0)
    if(result){
        timerId =setTimeout(() => {
          setPrompt('Open')
        }, SUB_DELAY);
    }
    return () => clearTimeout(timerId)
  }, [prompt, taskInput, taskRequest])

  useEffect(() => {
    let timerId: TimeoutId
    const result = (prompt !== 'Open' && taskRequest == 'Open') && (taskInput == undefined || taskInput?.length == 0)
    if(result){
        timerId =setTimeout(() => {
          setTaskRequest('Hide')
          setPrompt('Hide')
        }, DELAY);
    }
    return () => clearTimeout(timerId)
  }, [taskInput, taskRequest, prompt])


  // for creating and editing tasks
  const createNewTask = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if(!debouncedInput.value?.length) return
    const newTask = option !== 'EDIT' ? 
          {
            userId: currentUserId,
            completed: false,
            task: debouncedInput.value
          } as Partial<TaskProp> 
          :
          {
            ...task,
            task: debouncedInput.value,
            completed: task?.completed
          }
    try{
      option !== 'EDIT' 
          ? await createTask({ userId: currentUserId, task: newTask }).unwrap() 
              : await updateTask({ userId: currentUserId, task: newTask }).unwrap()
      setTaskInput('')
      setDebouncedInput({value: '', isTyping: 'notTyping'})
      setTaskRequest('Open')
      setPrompt('Hide')
      dispatch(setTask({taskId: '', option: 'NIL'}))
      //dispatch(taskApiSlice.util.invalidateTags(['TASK']))
    }
    catch(err){
      const errors = (error as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      err && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  // no activity after 30 seconds
  useEffect(() => {
    let timerId: TimeoutId
    if(!stoppedTyping && !isLoading && !isLoadingUpdate && (prompt == 'Nil' || prompt == 'Hide') && taskRequest == 'Hide'){
      timerId =setTimeout(() => {
        setNoActivity(true)
      }, DELAY);
    }
    return () => clearTimeout(timerId)
  }, [prompt, taskRequest, stoppedTyping, isLoading, isLoadingUpdate])

  // not activity after stoppedTyping prompt
  useEffect(() => {
    let timerId: TimeoutId
    if(stoppedTyping && !isLoading && !isLoadingUpdate){
        timerId =setTimeout(() => {
          setTaskInput('')
          setPrompt('Nil')
          setTaskRequest('Hide')
          setStoppedTyping(false)
          setDebouncedInput({value: '', isTyping: 'notTyping'})
          dispatch(setTask({taskId: '', option: 'NIL'}))
        }, DELAY);
    }
    return () => clearTimeout(timerId)
  }, [stoppedTyping, dispatch, isLoading, isLoadingUpdate])

  const closePrompt = () => {
    setTaskInput('')
    setPrompt('Nil')
    setTaskRequest('Hide')
    setStoppedTyping(false)
    setDebouncedInput({value: '', isTyping: 'notTyping'})
    dispatch(setTask({taskId: '', option: 'NIL'}))
  }

  const canSubmit = Boolean(taskInput)

  return (
    <div className="relative">
      {
        taskRequest == 'Hide' ?
        <div 
          onClick={() => {
            setTaskRequest('Open')
            setPrompt('Hide')
            setNoActivity(false)
          }}
          className={`transition-all ${taskRequest == 'Hide' ? 'block' : 'scale-0'} ${prompt == 'Open' ? 'animate-none' : (!noActivity && 'animate-pulse')} ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-600'} flex items-center h-14 rounded-md an`}>
          <p className={`flex-grow text-center text-lg font-serif cursor-default`}>Create a new task</p>
          <IoMdAdd 
            title="Add task"
            className={`flex-none w-12 text-center h-full rounded-md text-sm ${theme == 'light' ? 'bg-slate-400' : 'bg-slate-500'} hover:opacity-50 cursor-pointer`}
          />
        </div>
        :
        <form onSubmit={createNewTask} className={`flex-none transition-all ${taskRequest == 'Open' ? 'scale-100' : 'scale-0'} shadow-xl ${theme == 'light' ? 'shadow-slate-300 bg-slate-600' : 'shadow-slate-800 bg-slate-700'} w-full h-14 p-1 rounded-md flex items-center`}>
          <input
            ref={inputRef}
            type="text"
            disabled={prompt == 'Open'}
            key={`task/${currentUserId}`}
            id={`task/${currentUserId}`}
            placeholder="Your new task"
            value={taskInput}
            onChange={handleTaskEntry}
            className={`placeholder:text-xl placeholder:font-serif text-xl rounded-md w-full h-full focus:outline-none pl-2 pr-2 ${theme == 'light' ? '' : 'text-black'}`}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-12 grid place-content-center text-2xl ${canSubmit ? 'hover:opacity-50' : ''} text-green-400`}
          >
            {(isLoading || isLoadingUpdate) ?
              <FaHourglassEnd className="animate-spin"/>
              :
              <IoIosSend />
            }
          </button>
        </form>
      }
      <div className={`absolute ${prompt == 'Open' ? 'scale-100' : 'scale-0'} top-0 md:pr-4 md:pl-4 translate-x-1/2 flex w-36 flex-col items-center shadow-xl shadow-slate-600 gap-1 text-xs sm:w-fit ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'} p-2.5 rounded-md`}>
        <p className="uppercase text-center font-medium tracking-wider">{stoppedTyping ? 'Continue typing?' : 'create a task?'}</p>
        <p className="flex items-center gap-1">
          <span 
            onClick={() => setPrompt('Idle')}
            className={getTaskButtonClass(theme)}>Continue</span>
          <span 
            onClick={closePrompt}
            className={getTaskButtonClass(theme)}>Exit</span>
        </p> 
      </div>
    </div>
  )
}

// function taskButton(theme: Theme){
//   return `
//     rounded-md cursor-pointer p-1 hover:opacity-50 transition-all, w-14 text-center active:opacity-100 ${theme === 'light' ? 'bg-slate-500' : 'bg-slate-600'}
//   `
// }
