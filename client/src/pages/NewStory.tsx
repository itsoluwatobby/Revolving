import { useLocation, useParams } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent, useRef, LegacyRef } from 'react';
import { BiCodeAlt } from 'react-icons/bi'
import { Components, NAVIGATE } from '../utils/navigator';
import { Categories } from '../data';
import CodeBlock from '../components/codeBlock/CodeBlock';

export const NewStory = () => {
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { posts, setPostData, setTypingEvent, setCanPost } = usePostContext() as PostContextType;
  const { theme } = useThemeContext() as ThemeContextType;

  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null)

  const [codeEditor, setCodeEditor] = useState<boolean>(false);
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const debounceValue = useDebounceHook(
    {savedTitle: inputValue, savedBody: textareaValue, savedFontFamily: fontFamily}, 
    1000) as DebounceProps

  const { pathname } = useLocation()
  const { storyId } = useParams()

  const targetPost = posts?.find(story => story?._id == storyId) as PostType;

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value);
    pathname != `/edit_story/${storyId}` ? 
      localStorage.setItem('newStoryInputValue', value) 
      : localStorage.setItem('editStoryInputValue', value)
  }
  const handleBody = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setTextareaValue(value);
    pathname != `/edit_story/${storyId}` ? 
      localStorage.setItem('newStoryTextareaValue', value)
        : localStorage.setItem('editStoryTextareaValue', value)
  }

  useEffect(() => {
    const savedTitle = (pathname != `/edit_story/${storyId}` ? localStorage.getItem('newStoryInputValue') : localStorage.getItem('editStoryInputValue')) || targetPost?.title
    const savedBody = (pathname != `/edit_story/${storyId}` ? localStorage.getItem('newStoryTextareaValue') : localStorage.getItem('editStoryTextareaValue')) || targetPost?.body

    setInputValue(savedTitle || '')
    setTextareaValue(savedBody || '')
    setTypingEvent(debounceValue?.typing )
  }, [setTypingEvent, debounceValue.typing, targetPost, storyId, pathname])

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    targetPost && setPostCategory(targetPost?.category)
  }, [targetPost])

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
      {
        codeEditor ? <CodeBlock /> 
        : (
            <>
              <input 
                type="text"
                ref={inputRef}
                placeholder='Title'
                value={inputValue}
                onChange={handleTitle}
                className={`sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
              />
              <textarea 
                name="story" id=""
                placeholder='Share your story...'
                value={textareaValue}
                cols={30} rows={10}
                onChange={handleBody}
                className={`sm:w-3/5 text-xl p-2 ${theme == 'light' ? 'focus:outline-slate-300' : ''} ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
              />
            </>
          )
        }
      
      <div className='bg-slate-500 w-1/2 md:w-1/5 p-1.5 rounded-md gap-2 flex items-center'>
        <BiCodeAlt 
          onClick={() => setCodeEditor(prev => !prev)}
          title='Code Editor' className={`text-3xl cursor-pointer rounded-lg hover:opacity-70 ${codeEditor ? 'text-slate-800 bg-gray-400' : 'text-gray-300 bg-gray-500'}`} />
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