import { useLocation } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent } from 'react';

export const NewStory = () => {
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { posts, setPostData, setTypingEvent, setCanPost } = usePostContext() as PostContextType;
  const currentMode = localStorage.getItem('theme');
  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
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
          fontFamily
        }
      })
    )
    setCanPost([inputValue, textareaValue].every(Boolean))
  }, [setCanPost, setPostData, fontFamily, inputValue, textareaValue, debounceValue?.typing])

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
        cols={30} rows={12}
        onChange={handleBody}
        className={`sm:w-3/5 text-xl p-2 ${currentMode == 'light' ? 'focus:outline-slate-300' : ''} ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
    </section>
  )
}
