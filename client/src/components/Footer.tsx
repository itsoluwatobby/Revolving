import { Followers, TaskProp, UserProps } from '../data';
import { checkCount } from '../utils/navigator';
import { useEffect, useState, useCallback } from 'react';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostType, Theme, ThemeContextType } from '../posts';
import { useGetUserByIdQuery } from '../app/api/usersApiSlice';
import { useGetUserStoriesQuery } from '../app/api/storyApiSlice';

type FooterProps = {
  tasks: TaskProp[],
  userId: string
}
export const Footer = ({ tasks, userId }: FooterProps) => {
  const { theme } = useThemeContext() as ThemeContextType
  const completedTasks = tasks?.filter(task => task.completed)
  const activeTasks = tasks?.some(task => !task?.completed)
  const {data} = useGetUserStoriesQuery(userId)
  const {data: userData} = useGetUserByIdQuery(userId)
  const [userStories, setUserStories] = useState<PostType[]>([])
  const [user, setUser] = useState<UserProps>()
  const [taskCount, setTaskCount] = useState<TaskProp[]>([])
  const countStyle = useCallback((theme: Theme, property:'MAIN'|'NUM'='MAIN') => {
    return (`text-white ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'} ${property === 'MAIN' ? 'rounded-md bg-black tracking-wide mb-0.5 w-fit p-1 pt-0.5 pb-0.5' : 'font-bold mr-1'}
    `)
  }, [])

  useEffect(() => {
    let isMounted = true
    isMounted ? setUserStories(data as PostType[]) : null
    return () => {
      isMounted = false
    }
  }, [data])
  
  useEffect(() => {
    let isMounted = true
    isMounted ? setTaskCount(tasks) : null
    return () => {
      isMounted = false
    }
  }, [tasks])
  
  useEffect(() => {
    let isMounted = true
    isMounted ? setUser(userData as UserProps) : null
    return () => {
      isMounted = false
    }
  }, [userData])

  return (
    <footer className='flex-none h-20 w-full flex flex-col shadow-inner text-sm p-1 mobile:px-1.5'>
      <h2 className='text-center font-mono text-base font-bold'>ANALYTICS</h2>
      <div className={`flex items-end justify-evenly`}>
        <div className='flex flex-col'>
          <span className={countStyle(theme, 'MAIN')}>Active Tasks:  &nbsp;<span className={`${countStyle(theme, 'NUM')} capitalize`}>{activeTasks?.toString()}</span></span>
          <p className='flex items-center gap-4'>
            <span className={countStyle(theme, 'MAIN')}>Tasks completed: &nbsp;<span className={countStyle(theme, 'NUM')}>{checkCount(completedTasks)}</span></span>
            <span className={countStyle(theme, 'MAIN')}>Total Tasks: &nbsp;<span className={countStyle(theme, 'NUM')}>{checkCount(taskCount)}</span></span>
          </p>
        </div>
        <p className='flex flex-col'>
          <span className={countStyle(theme, 'MAIN')}>Followers: &nbsp;
            <span className={countStyle(theme, 'NUM')}>{checkCount(user?.followers as Followers[])}</span>
          </span>
          <span className={countStyle(theme, 'MAIN')}>Stories: &nbsp;<span className={countStyle(theme, 'NUM')}>{checkCount(userStories)}</span></span>
          <span className={countStyle(theme, 'MAIN')}>Total likes </span>
        </p>
      </div>
    </footer>
  )
}

{/* <p className='flex gap-1 items-center self-start cursor-pointer pl-3 hover:text-gray-800'>
          <AiOutlineMail className='text-xl' />
          <a href="mailto:itsoluwatobby@gmail.com">itsoluwatobby@gmail.com</a>
        </p> */}
{/**
<div className='flex justify-evenly w-full flex-wrap'>
        <p className={top_border}>
          <a href='https://github.com/itsoluwatobby' target='_blank' className={footer_list}>
            <FaGithub className={icon_style} />
            <span className='text-sm'>Github</span>
          </a>
        </p>
        <p className={top_border}>
          <a href='https://twiiter.com/itsoluwatobby' target='_blank' className={footer_list}>
            <FaTwitter className={icon_style} />
            <span className='text-sm'>Twitter</span>
          </a>
        </p>
        <p className={top_border}>
          <a href='https://linkedin.com/in/itsoluwatobby' target='_blank' className={footer_list}>
            <AiOutlineLinkedin className={icon_style} />
            <span className='text-sm'>LinkedIn</span>
          </a>
        </p>
      </div>
      <div className='flex flex-col items-center relative w-full place-content-center'>
        
        <span className='font-mono text-center md:text-center text-sm pt-2 bg-slate-200 w-full'>
          Thanks visiting. Follow me on any of the social media accounts above
        </span>
      </div>
*/}