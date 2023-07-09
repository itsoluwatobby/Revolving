import { useLocation, useParams } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { ImageType, PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { BiCodeAlt } from 'react-icons/bi'
import { Components, NAVIGATE } from '../utils/navigator';
import { Categories, OpenSnippet } from '../data';
import CodeBlock from '../codeEditor/CodeEditor';
import { useGetStoryQuery } from '../app/api/storyApiSlice';
import { useDispatch } from 'react-redux';
import { setStoryData } from '../features/story/storySlice';
import { CodeSnippets } from '../components/codeSnippets/CodeSnippets';
import { FaRegImages } from 'react-icons/fa';
import { nanoid } from '@reduxjs/toolkit';

export const NewStory = () => {
  const MAX_SIZE = 2_535_000 as const // 2mb 
  const { storyId } = useParams()
  const { fontFamily, codeEditor, setCodeEditor } = useThemeContext() as ThemeContextType;
  const { imagesFiles, setImagesFiles, setTypingEvent, setCanPost, codeStore, url, uploadToCloudinary } = usePostContext() as PostContextType;
  const { data: target } = useGetStoryQuery(storyId as string)
  const { theme, isPresent, success, setIsPresent, setSuccess } = useThemeContext() as ThemeContextType;
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const [snippet, setSnippet] = useState<OpenSnippet>('Nil');
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null)
  const [targetStory, setTargetStory] = useState<PostType>()
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const debounceValue = useDebounceHook(
    {savedTitle: inputValue, savedBody: textareaValue, savedFontFamily: fontFamily}, 
    1000) as DebounceProps
  const dispatch = useDispatch();

  const { pathname } = useLocation()

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = (event.target as HTMLInputElement).files as FileList
    setFiles([...files])
  }

  // Check image size
  useEffect(() => {
    let isMounted = true
    const checkSizeAndUpload = () => {
      files.slice(0, 3).map(async(file) => {
        if(file.size > MAX_SIZE){
          setFiles([])
          return alert('MAX ALLOWED FILE SIZE IS 2.53MB')
        }
        else{
          const imageId = nanoid()
          const newImage = { imageId, image: file } as ImageType
          setImagesFiles(prev => ([...prev, newImage]))
          setFiles([])
        }
      })
    }
    isMounted ? checkSizeAndUpload() : null

    return () => {
      isMounted = false
    }
  }, [files, uploadToCloudinary, setImagesFiles])

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
  }, [setTypingEvent, debounceValue.typing, targetStory?.title, targetStory?.body, currentUserId, storyId, pathname])

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
  }, [setCanPost, currentUserId, dispatch, url, targetStory, postCategory, fontFamily, inputValue, textareaValue, debounceValue?.typing])
  
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

  const setClickable = (type: OpenSnippet) => {
    codeStore.length !== 0 
      ? setSnippet(type) 
        : imagesFiles.length !== 0 
          ? setSnippet(type) : setSnippet('Nil')
  }

  return (
    <section className={`relative ${fontFamily} p-3 h-full text-sm flex flex-col gap-2 sm:items-center mt-2`}>
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
                cols={30} rows={8}
                onChange={handleBody}
                className={`sm:w-3/5 text-lg p-2 ${theme == 'light' ? 'focus:outline-slate-300' : ''} ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
              />
            </>
          )
        }
        <input 
          type="file" 
          hidden 
          size={MAX_SIZE}
          multiple
          id='image-upload' 
          accept="image/*.{jpg,jpeg,png}" 
          onChange={handleImages}
        />
        <div>
          <button 
            title='Add images'
            role='Add images' 
            className={`absolute ${codeEditor ? 'scale-0' : 'scale-100'} right-4 bottom-[47.5%] ${theme === 'light' ? 'opacity-50 hover:opacity-60' : 'opacity-30 hover:opacity-50'} transition-all active:opacity-30 bg-slate-400 grid place-content-center sm:right-[21%] mobile:bottom-[62%] midmobile:bottom-[52%] w-10 h-10 rounded-md xl:right-[20.8%] xl:bottom-[49%]`}>
            <label htmlFor='image-upload' className='cursor-pointer h-full w-full' >
              <FaRegImages 
                className={`text-2xl`}
              />
            </label>
          </button>
        </div>
      <div className='w-full flex items-center justify-between sm:w-[60%]'>

        <div className={`${theme == 'light' ? 'bg-slate-200' : 'bg-slate-500'} transition-all ${codeEditor ? 'w-10' : 'max-w-[50%] sm:w-1/2'} p-1.5 rounded-md gap-2 flex items-center`}>
          <BiCodeAlt 
            onClick={() => setCodeEditor(prev => !prev)}
            title='Code Editor' className={`text-3xl min-w-fit border-2 border-slate-600 cursor-pointer rounded-lg hover:opacity-70 ${codeEditor ? 'text-slate-800 bg-gray-300' : 'text-gray-300 bg-gray-500'}`} />
          <div title='Scroll left/right' className={`hidebars text-sm ${codeEditor ? 'hidden' : 'flex'} items-center w-full font-sans gap-1 h-full overflow-scroll rounded-md skew-x-6 pl-2 pr-2 shadow-lg shadow-slate-600 ${theme == 'light' ? 'text-white' : ''}`}>
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

        <div className={`${(codeStore.length >= 1 || imagesFiles.length >= 1) ? 'scale-100' : 'scale-0'} flex items-center transition-all ${theme == 'light' ? 'text-white bg-slate-300 ' : 'bg-slate-500'} w-fit gap-2 p-1 text-sm font-sans rounded-md shadow-lg`}>
          <p 
            onClick={() => setClickable('Snippet')}
            className={`${codeStore.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Snippet' ? 'bg-slate-800' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-60 transiton-all cursor-pointer`}>Code snippets</p>
          <p 
            onClick={() => setClickable('Image')}
            className={`${imagesFiles.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Image' ? 'bg-slate-800' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-60 transiton-all cursor-pointer`}>Images</p>
        </div>

      </div>

      <CodeSnippets 
        theme={theme} 
        snippet={snippet}
        isPresent={isPresent} 
        codeEditor={codeEditor} 
        setIsPresent={setIsPresent}
        setSnippet={setSnippet}
        success={success}
        setSuccess={setSuccess}
      />
    </section>
  )
}
//BiCodeBlock