import { useLocation } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent } from 'react';
import { BiCodeAlt } from 'react-icons/bi'
import { Components, NAVIGATE } from '../assets/navigator';
import { Categories } from '../data';

export const NewStory = () => {
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { posts, setPostData, setTypingEvent, setCanPost } = usePostContext() as PostContextType;
  const currentMode = localStorage.getItem('theme');
  const [inputValue, setInputValue] = useState<string>('');

  const [textareaValue, setTextareaValue] = useState<string>('');
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const debounceValue = useDebounceHook(
    {savedTitle: inputValue, savedBody: textareaValue, savedFontFamily: fontFamily}, 
    1000) as DebounceProps
  const { pathname } = useLocation()
  const postId = pathname.split('/')[2]
  const targetPost = posts?.find(pos => pos?._id == postId) as PostType;

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value);
    pathname != `/edit_story/${postId}` ? 
      localStorage.setItem('newStoryInputValue', value) 
      : localStorage.setItem('editStoryInputValue', value)
  }
  const handleBody = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setTextareaValue(value);
    pathname != `/edit_story/${postId}` ? 
      localStorage.setItem('newStoryTextareaValue', value)
        : localStorage.setItem('editStoryTextareaValue', value)
  }

  useEffect(() => {
    const savedTitle = (pathname != `/edit_story/${postId}` ? localStorage.getItem('newStoryInputValue') : localStorage.getItem('editStoryInputValue')) || targetPost?.title
    const savedBody = (pathname != `/edit_story/${postId}` ? localStorage.getItem('newStoryTextareaValue') : localStorage.getItem('editStoryTextareaValue')) || targetPost?.body

    setInputValue(savedTitle || '')
    setTextareaValue(savedBody || '')
    setTypingEvent(debounceValue?.typing )
  }, [setTypingEvent, debounceValue.typing, targetPost, postId, pathname])

  useEffect(() => {
    !debounceValue?.typing && (
      setPostData(prev => {
        return {...prev, 
          title: inputValue, 
          body: textareaValue,
          category: postCategory,
          fontFamily
        }
      })
    )
    setCanPost([inputValue, textareaValue].every(Boolean))
  }, [setCanPost, setPostData, postCategory, fontFamily, inputValue, textareaValue, debounceValue?.typing])
  
  const addCategory = (category: Categories) => {
    let categories: Categories[] = [...postCategory];
    if(!categories.includes(category)){
      categories.push(category)
    }
    else{
      categories = categories.filter(cat => cat != category)
    }
    setPostCategory([...categories])
  } 

  return (
    <section className={`${fontFamily} p-3 h-full flex flex-col gap-2 sm:items-center mt-2`}>
      <input 
        type="text"
        placeholder='Title'
        value={inputValue}
        onChange={handleTitle}
        className={`sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
      <textarea 
        name="" id=""
        placeholder='Share your story...'
        value={textareaValue}
        cols={30} rows={10}
        onChange={handleBody}
        className={`sm:w-3/5 text-xl p-2 ${currentMode == 'light' ? 'focus:outline-slate-300' : ''} ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
      <div className='bg-slate-500 w-1/2 md:w-1/5 p-1.5 rounded-md gap-2 flex items-center'>
        <BiCodeAlt title='Code Editor' className='text-3xl cursor-pointer hover:opacity-70 text-gray-300' />
        <div title='Scroll left/right' className='hidebars flex items-center w-full gap-1 h-full overflow-scroll rounded-md skew-x-6 pl-2 pr-2 shadow-lg shadow-slate-600'>
          {
            Object.values(NAVIGATE).map(nav => (
              <p
                onClick={() => addCategory(nav)}
                className={`p-1 bg-slate-600 rounded-md cursor-pointer hover:opacity-90 whitespace-nowrap transition-all ${postCategory.includes(nav) ? 'bg-slate-800' : ''}`}
                key={nav}>
                {nav}
              </p>
            ))
          }
        </div>
      </div>
    </section>
  )
}
//BiCodeBlock