import { ChangeEvent, useEffect, useRef, useState } from "react"
import { FaHourglassEnd } from "react-icons/fa"
import { IoIosSend, IoMdAdd } from "react-icons/io"
import { ChatOption, Theme } from "../../posts"
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types"
import { CreatePrompt, InputTaskProp } from "../../data"
import { useSelector } from "react-redux"
import { getTask } from "../../features/story/taskManagerSlice"

type FormProps = {
  currentUserId: string,
  theme: Theme,
  isLoading: boolean,
}

const DEBOUNCEDTIMEOUT = 350 as const
const DELAY = 15_000 as const
const SUB_DELAY = 10_000 as const

export default function Form({ currentUserId, isLoading, theme }: FormProps) {
  const { task, option } = useSelector(getTask)
  const [taskRequest, setTaskRequest] = useState<ChatOption>('Hide')
  const [prompt, setPrompt] = useState<CreatePrompt>('Hide')
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputTask, setTaskInput] = useState<string>()
  //const [editTask, setTaskEdit] = useState<Partial<TaskProp>>()
  const [debouncedInput, seDebouncedInput] = useState<InputTaskProp>({
    value: '', isTyping: 'notTyping'
  })
  const [stoppedTyping, setStoppedTyping] = useState<boolean>(false)

  const handleTaskEntry = (event: ChangeEvent<HTMLInputElement>) => setTaskInput(event.target.value)

  useEffect(() => {
    if(option === 'EDIT'){
      setTaskInput(task.task)
      setTaskRequest('Open')
      setPrompt('Hide')
    }
  }, [option, task])

  // DEBOUNCED INPUT
  useEffect(() => {
    let isMounted = true
    isMounted && seDebouncedInput(prev => ({...prev, isTyping: 'typing'}))
    const timerId = setTimeout(() => {
      seDebouncedInput({value: inputTask as string, isTyping: 'notTyping'})
    }, DEBOUNCEDTIMEOUT);
    return () => {
      isMounted = false
      clearTimeout(timerId)
    }
  }, [inputTask])

  useEffect(() => {
    if(taskRequest == 'Open' && inputRef?.current) inputRef?.current.focus()
  }, [taskRequest, prompt])

  // TYPING PAUSED
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
    const result = prompt === 'Idle' && taskRequest == 'Open' && inputTask?.length == 0
    if(result){
        timerId =setTimeout(() => {
          setPrompt('Nil')
          setTaskRequest('Hide')
          setTaskInput('')
        }, SUB_DELAY);
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [prompt, inputTask, taskRequest])
  
  useEffect(() => {
    let timerId: TimeoutId
    const result = (prompt !== 'Nil' && prompt !== 'Idle' && taskRequest == 'Open') && (inputTask == undefined || inputTask?.length == 0)
    if(result){
        timerId =setTimeout(() => {
          setPrompt('Open')
        }, SUB_DELAY);
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [prompt, inputTask, taskRequest])

  useEffect(() => {
    let timerId: TimeoutId
    const result = (prompt !== 'Open' && taskRequest == 'Open') && (inputTask == undefined || inputTask?.length == 0)
    if(result){
        timerId =setTimeout(() => {
          setTaskRequest('Hide')
          setPrompt('Hide')
        }, DELAY);
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [inputTask, taskRequest, prompt])

  const closePrompt = () => {
    setTaskInput('')
    setPrompt('Nil')
    setTaskRequest('Hide')
    setStoppedTyping(false)
  }

  const canSubmit = Boolean(inputTask)

  return (
    <div className="relative">
      {
        taskRequest == 'Hide' ?
        <div className={`transition-all ${taskRequest == 'Hide' ? 'block' : 'scale-0'} ${prompt == 'Open' ? 'animate-none' : 'animate-pulse'} bg-slate-600 flex items-center h-14 rounded-md `}>
          <p className={`flex-grow text-center text-lg font-serif`}>Create a new task</p>
          <IoMdAdd 
            title="Add task" 
          onClick={() => {
            setTaskRequest('Open')
            setPrompt('Hide')
          }}
          className={`flex-none w-10 text-center h-full rounded-md text-sm bg-slate-500 hover:opacity-50`}/>
        </div>
        :
        <form className={`flex-none transition-all ${taskRequest == 'Open' ? 'scale-100' : 'scale-0'} shadow-xl ${theme == 'light' ? 'shadow-slate-400 bg-slate-600' : 'shadow-slate-800 bg-slate-700'} sm:w-3/4 w-full h-14 p-1 rounded-md sm:self-center flex items-center`}>
          <input
            ref={inputRef}
            type="text"
            disabled={prompt == 'Open'}
            key={`task/${currentUserId}`}
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
      }
      <div className={`absolute ${prompt == 'Open' ? 'scale-100' : 'scale-0'} top-0 md:pr-4 md:pl-4 translate-x-1/2 flex w-36 flex-col items-center shadow-xl shadow-slate-600 gap-1 text-xs ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'} p-2.5 rounded-md`}>
        <p className="uppercase text-center font-medium tracking-wide">{stoppedTyping ? 'Continue typing?' : 'create a task?'}</p>
        <p className="flex items-center gap-1">
          <span 
            onClick={() => setPrompt('Idle')}
            className={taskButton(theme)}>Continue</span>
          <span 
            onClick={closePrompt}
            className={taskButton(theme)}>Exit</span>
        </p>
      </div>
    </div>
  )
}

function taskButton(theme: Theme){
  return `
    rounded-md cursor-pointer p-1 hover:opacity-50 transition-all, w-14 text-center active:opacity-100 ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-600'}
  `
}
