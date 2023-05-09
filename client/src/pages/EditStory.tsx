import { sub } from 'date-fns';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';

export const EditStory = () => {
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { posts, setEditPost } = usePostContext() as PostContextType;
  const currentMode = localStorage.getItem('theme');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');
  const { postId } = useParams()
  
  const handleEditTitle = (event: ChangeEvent<HTMLInputElement>) => setEditTitle(event.target.value);
  const handleEditBody = (event: ChangeEvent<HTMLTextAreaElement>) => setEditBody(event.target.value);

  const targetPost = posts?.find(pos => pos?.postId == postId) as PostType;

  useEffect(() => {
    setEditTitle(targetPost?.title)
    setEditBody(targetPost?.body)
  }, [targetPost])

  useEffect(() => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    setEditPost({
      ...targetPost,
      title: editTitle,  
      body: editBody, 
      editDate: dateTime 
    })
  }, [editTitle, editBody])

  return (
    <section className={`${fontFamily} p-3 h-full flex flex-col gap-2 sm:items-center mt-2`}>
      <input 
        type="text"
        placeholder='Title'
        value={editTitle}
        onChange={handleEditTitle}
        className={`sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
      <textarea 
        name="" id=""
        placeholder='Share your story...'
        value={editBody}
        cols={30} rows={12}
        onChange={handleEditBody}
        className={`sm:w-3/5 text-xl p-2 ${currentMode == 'light' ? 'focus:outline-slate-300' : ''} ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
    </section>
  )
}
