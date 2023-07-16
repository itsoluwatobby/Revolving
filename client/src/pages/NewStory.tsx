import { useLocation, useParams } from 'react-router-dom';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { ImageType, ImageUrlsType, PostContextType, PostType, ThemeContextType } from '../posts';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { BiCodeAlt } from 'react-icons/bi'
import { Components, NAVIGATE } from '../utils/navigator';
import { Categories, ErrorResponse, OpenSnippet } from '../data';
import CodeBlock from '../codeEditor/CodeEditor';
import { useGetStoryCondMutation, useUploadImageMutation } from '../app/api/storyApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getLoading, getUrl, setStoryData, setUrl } from '../features/story/storySlice';
import { CodeSnippets } from '../components/codeSnippets/CodeSnippets';
import { FaRegImages } from 'react-icons/fa';
import { nanoid } from '@reduxjs/toolkit';

let uploadedImageIds = [] as string[]
export const NewStory = () => {
  const MAX_SIZE = 1_535_000 as const // 1.53mb 
  const { storyId } = useParams()
  const loading = useSelector(getLoading)
  const { imagesFiles, setImagesFiles, setTypingEvent, setCanPost, codeStore } = usePostContext() as PostContextType;
  const [getStoryCond, { data: target, isLoading, isError }] = useGetStoryCondMutation()
  const { theme, isPresent, success, fontFamily, codeEditor, setCodeEditor, setIsPresent, setLoginPrompt, setSuccess } = useThemeContext() as ThemeContextType;
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const [snippet, setSnippet] = useState<OpenSnippet>('Nil');
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadToServer] = useUploadImageMutation()
  const [targetStory, setTargetStory] = useState<PostType>()
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const debounceValue = useDebounceHook(
    {savedTitle: inputValue, savedBody: textareaValue, savedFontFamily: fontFamily}, 
    1000) as DebounceProps;
  const url = useSelector(getUrl);
  const dispatch = useDispatch();

  const { pathname } = useLocation()

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = (event.target as HTMLInputElement).files as FileList
    setFiles([...files])
  }

  useEffect(() => {
    if (storyId) {
      getStoryCond(storyId);
    }
  }, [storyId, getStoryCond])

  // Check image size
  useEffect(() => {
    let isMounted = true
    const checkSizeAndUpload = () => {
      files.slice(0, 3).map(async(file) => {
        if(file.size > MAX_SIZE){
          setFiles([])
          return alert('MAX ALLOWED FILE SIZE IS 1.53MB')
        }
        else{
          const imageId = nanoid()
          const newImage = { imageId, image: file } as ImageType
          console.log(imagesFiles.length)
          if(imagesFiles.length < 5){
            //  if(uploadedImageIds.includes(newImage.imageId)) return
            setImagesFiles(prev => ([...prev, newImage]))
            setFiles([])
          }
          else{
            setFiles([])
            console.log('filled')
          }
        }
      })
    }
    isMounted ? checkSizeAndUpload() : null

    return () => {
      isMounted = false
    }
  }, [files, imagesFiles, setImagesFiles])

  // reset uploadedImageIds container
  useEffect(() => {
    if(uploadedImageIds.length && !url.length){
      uploadedImageIds = []
    }
  }, [url])

  useEffect(() => {
    const uploadImages = async() => {
      console.log(imagesFiles)
      await Promise.all(imagesFiles.map(async(image) => {
        if(uploadedImageIds.includes(image.imageId)) return
        console.log('running')
          const imageData = new FormData()
          imageData.append('image', image.image)
          await uploadToServer(imageData).unwrap()
          .then((data) => {
            const res = data as unknown as { url: string }
            const composed = {imageId: image.imageId, url: res.url} as ImageUrlsType
            dispatch(setUrl(composed))
            uploadedImageIds.push(image.imageId)
          }).catch(error => {
            const errors = error as ErrorResponse
            errors?.originalStatus == 401 && setLoginPrompt('Open')
          })
        //}
      }))
    }
    imagesFiles.length >= 1 ? uploadImages() : null
  }, [imagesFiles, dispatch, setLoginPrompt, uploadToServer])

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
    setTypingEvent(debounceValue?.typing)
  }, [setTypingEvent, debounceValue.typing, targetStory?.title, targetStory?.body, currentUserId, storyId, pathname])

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    targetStory && setPostCategory(targetStory?.category)
  }, [targetStory])

  useEffect(() => {
    if(debounceValue?.typing == 'notTyping'){
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
    setCanPost(Boolean(textareaValue))
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

  const activateSnippet = (type: OpenSnippet) => {
    codeStore.length !== 0 
      ? setSnippet(type) 
        : imagesFiles.length !== 0 
          ? setSnippet(type) : setSnippet('Nil')
  }
  
console.log({loading})
  return (
    <section className={`relative ${loading ? 'animate-pulse bg-opacity-20' : ''} ${fontFamily} p-3 h-full text-sm flex flex-col gap-2 sm:items-center mt-2`}>
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
                className={`${isLoading ? 'animate-pulse' : ''} sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : 'shadow-2xl'}`}
              />
              <textarea 
                name="story" id=""
                placeholder='Share your story...'
                value={textareaValue}
                cols={30} rows={8}
                onChange={handleBody}
                className={`${isLoading ? 'animate-pulse' : ''} sm:w-3/5 text-lg p-2 ${theme == 'light' ? 'focus:outline-slate-300' : ''} ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : 'shadow-2xl'}`}
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
            title={imagesFiles.length < 4 ? 'Add images' : 'MAX'}
            role='Add images'
            className={`absolute ${codeEditor ? 'scale-0' : 'scale-100'} right-4 bottom-[47.5%] ${theme === 'light' ? 'bg-opacity-50 hover:opacity-60' : 'hover:opacity-50'} transition-all active:opacity-30 ${imagesFiles.length < 4 ? 'bg-slate-400 bg-opacity-30' : 'bg-red-500'} grid place-content-center sm:right-[21%] mobile:bottom-[62%] midmobile:bottom-[52%] w-10 h-10 rounded-md xl:right-[20.8%] xl:bottom-[49%]`}>
            <label htmlFor={imagesFiles.length < 4 ? 'image-upload' : ''} className='relative cursor-pointer h-full w-full' >
              <FaRegImages 
                className={`text-2xl`}
              />
            <span className={`absolute ${imagesFiles.length ? 'scale-100' : 'scale-0'} transition-all bottom-0 rounded-full bg-slate-950 text-white font-bold right-0 w-4 grid place-content-center h-4 p-1`}>{imagesFiles.length}</span>
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
            onClick={() => activateSnippet('Snippet')}
            className={`${codeStore.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Snippet' ? 'bg-slate-700' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-60 transiton-all cursor-pointer`}>Code snippets</p>
          <p 
            onClick={() => activateSnippet('Image')}
            className={`${imagesFiles.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Image' ? 'bg-slate-700' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-60 transiton-all cursor-pointer`}>Images</p>
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