import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent } from 'react';

export const NewStory = () => {
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { setPostData } = usePostContext() as PostContextType;
  const currentMode = localStorage.getItem('theme');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  
  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value);
  const handleBody = (event: ChangeEvent<HTMLTextAreaElement>) => setBody(event.target.value);

  useEffect(() => {
    setPostData(prev => {
      return {...prev, title, body, fontFamily}
    })
  }, [title, body])
  
  return (
    <section className={`${fontFamily} p-3 h-full flex flex-col gap-2 sm:items-center mt-2`}>
      <input 
        type="text"
        placeholder='Title'
        value={title}
        onChange={handleTitle}
        className={`sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
      <textarea 
        name="" id=""
        placeholder='Share your story...'
        value={body}
        cols={30} rows={12}
        onChange={handleBody}
        className={`sm:w-3/5 text-xl p-2 ${currentMode == 'light' ? 'focus:outline-slate-300' : ''} ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
    </section>
  )
}
