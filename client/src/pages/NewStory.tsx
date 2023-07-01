import { useLocation, useParams } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { BiCodeAlt } from 'react-icons/bi'
import { Components, NAVIGATE } from '../utils/navigator';
import { Categories } from '../data';
import CodeBlock from '../codeEditor/CodeEditor';
import { useGetStoryQuery } from '../app/api/storyApiSlice';
import { useDispatch } from 'react-redux';
import { setStoryData } from '../features/story/storySlice';

export const NewStory = () => {
  const { storyId } = useParams()
  const { fontFamily } = useThemeContext() as ThemeContextType;
  const { setTypingEvent, setCanPost } = usePostContext() as PostContextType;
  const { data: target } = useGetStoryQuery(storyId as string)
  const { theme } = useThemeContext() as ThemeContextType;
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null)
  const [targetStory, setTargetStory] = useState<PostType>()
  const [codeEditor, setCodeEditor] = useState<boolean>(false);
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const debounceValue = useDebounceHook(
    {savedTitle: inputValue, savedBody: textareaValue, savedFontFamily: fontFamily}, 
    1000) as DebounceProps
  const dispatch = useDispatch();

  const { pathname } = useLocation()

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value);
    pathname != `/edit_story/${storyId}` ? 
      localStorage.setItem(`newTitle?id=${currentUserId}`, value) 
      : localStorage.setItem(`editTitle?id=${currentUserId}`, value)
  }
  const handleBody = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setTextareaValue(value);
    pathname != `/edit_story/${storyId}` ? 
      localStorage.setItem(`newBody?id=${currentUserId}`, value)
        : localStorage.setItem(`editBody?id=${currentUserId}`, value)
  }

  useEffect(() => {
    let isMounted = true
    if(storyId){
      isMounted ? setTargetStory(target as PostType) : null
    }
    return () => {
      isMounted = false
    }
  }, [storyId, target])

  useEffect(() => {
    const savedTitle = (pathname !== `/edit_story/${storyId}` ? localStorage.getItem(`newTitle?id=${currentUserId}`) : (localStorage.getItem(`editTitle?id=${currentUserId}`)) || targetStory?.title)
    const savedBody = (pathname !== `/edit_story/${storyId}` ? localStorage.getItem(`newBody?id=${currentUserId}`) : (localStorage.getItem(`editBody?id=${currentUserId}`)) || targetStory?.body)

    setInputValue(savedTitle || '')
    setTextareaValue(savedBody || '')
    setTypingEvent(debounceValue?.typing )
  }, [setTypingEvent, debounceValue.typing, targetStory, currentUserId, storyId, pathname])

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    targetStory && setPostCategory(targetStory?.category)
  }, [targetStory])

  useEffect(() => {
    if(!debounceValue?.typing){
      const storyData = targetStory ? {
        ...targetStory,
        title: inputValue,
        body: textareaValue,
        category: postCategory,
        fontFamily
      } : {
        title: inputValue, 
        body: textareaValue,
        category: postCategory,
        userId: currentUserId,
        fontFamily
      }
    dispatch(setStoryData(storyData))
  }
  else{
    return
  }
    setCanPost([inputValue, textareaValue].every(Boolean))
  }, [setCanPost, currentUserId, dispatch, targetStory, postCategory, fontFamily, inputValue, textareaValue, debounceValue?.typing])
  
  const addCategory = (category: Categories) => {
    let categories: Categories[] = [...postCategory];
    if(!categories.includes(category)){
      categories.push(category)
    }
    else{
      categories = categories.filter(cat => cat !== category)
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
          title='Code Editor' className={`text-3xl cursor-pointer rounded-lg hover:opacity-70 ${codeEditor ? 'text-slate-800 bg-gray-300' : 'text-gray-300 bg-gray-500'}`} />
        <div title='Scroll left/right' className={`hidebars flex items-center w-full gap-1 h-full overflow-scroll rounded-md skew-x-6 pl-2 pr-2 shadow-lg shadow-slate-600 ${theme == 'light' ? 'text-white' : ''}`}>
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