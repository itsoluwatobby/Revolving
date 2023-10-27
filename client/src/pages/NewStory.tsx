import { nanoid } from '@reduxjs/toolkit';
import { BiCodeAlt } from 'react-icons/bi';
import { FaRegImages } from 'react-icons/fa';
import { imageUpload } from '../utils/helperFunc';
import { useDispatch, useSelector } from 'react-redux';
import { usePostContext } from '../hooks/usePostContext';
import { Components, NAVIGATE } from '../utils/navigator';
import { useThemeContext } from '../hooks/useThemeContext';
import CodeBlock from '../components/codeEditor/CodeEditor';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useGetStoryCondMutation } from '../app/api/storyApiSlice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CodeSnippets } from '../components/codeSnippets/CodeSnippets';
import { Categories, ImageReturnType, OpenSnippet } from '../types/data';
import { DebounceProps, useDebounceHook } from '../hooks/useDebounceHook';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import { getLoading, getUrl, setStoryData, setUrl } from '../features/story/storySlice';
import { CodeStoreType, ImageType, ImageUrlsType, PostContextType, PostType, ThemeContextType } from '../types/posts';

let uploadedImageIds = [] as string[]
let imagesNames = [] as string[]
export const NewStory = () => {
  const MAX_SIZE = 800_000 as const // 800kb 
  const { storyId, storyUserId } = useParams()
  const navigate = useNavigate()
  const loading = useSelector(getLoading)
  const { imagesFiles, setImagesFiles, setTypingEvent, setCanPost, codeStore, setCodeStore } = usePostContext() as PostContextType;
  const [getStoryCond, { data: target, isLoading }] = useGetStoryCondMutation()
  const { theme, isPresent, success, fontFamily, codeEditor, setCodeEditor, setIsPresent, setLoginPrompt, setSuccess } = useThemeContext() as ThemeContextType;
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const [snippet, setSnippet] = useState<OpenSnippet>('Nil');
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null)
  const [targetStory, setTargetStory] = useState<PostType>()
  const [postCategory, setPostCategory] = useState<Components[]>(['General']);
  const [includesId, setIncludesId] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
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
    let isMounted = true
    if(isMounted && pathname === `/edit_story/${storyId}/${storyUserId}`){
      if(storyUserId !== targetStory?.userId) navigate('/unauthorized')
      else return
    }
    return () => {
      isMounted = false
    }
  }, [pathname, storyId, navigate, targetStory?.userId, storyUserId])

  useEffect(() => {
    let isMounted = true
    if (isMounted && storyId) {
      getStoryCond(storyId);
    }
    return () => {
      isMounted = false
    }
  }, [storyId, getStoryCond])

  // Check image size
  useEffect(() => {
    let isMounted = true
    const checkSizeAndUpload = () => {
      files.slice(0, 2).map(file => {
        if(file.size > MAX_SIZE){
          setFiles([])
          return alert('MAX ALLOWED FILE SIZE IS 800kb')
        }
        else{
          const imageId = nanoid()
          const newImage = { imageId, image: file } as ImageType
          if(imagesNames.includes(file?.name) || imagesFiles?.length > 2) return setFiles([])
          setImagesFiles(prev => ([...prev, newImage]))
          imagesNames.push(file?.name)
        }
      })
      setFiles([])
    }
    if(isMounted && files.length) checkSizeAndUpload()
    return () => {
      isMounted = false
    }
  }, [files, imagesFiles, setImagesFiles])

  // reset uploadedImageIds container
  useEffect(() => {
    let isMounted = true
    if(isMounted && uploadedImageIds.length && !url.length){
      uploadedImageIds = []
      imagesNames = []
    }
    return () => {
      isMounted = false
    }
  }, [url])

  useEffect(() => {
    let isMounted = true;
    const uploadImages = async() => {
      await Promise.all(imagesFiles.map(async(image) => {
        if(uploadedImageIds.includes(image.imageId)) return
        setLoadingImage(true)
        imageUpload(image.image, 'story')   
        .then((data: ImageReturnType) => {
          const composed = {imageId: image.imageId, url: data.url} as ImageUrlsType
          dispatch(setUrl(composed))
          uploadedImageIds.push(composed.imageId)
        }).catch((error: unknown) => {
          void(error)
          setErrorMsg(true)
        })
        .finally(() => setLoadingImage(false))
      }))
    }
    if(isMounted && imagesFiles.length >= 1) uploadImages()
    return () => {
      isMounted = false
    }
  }, [imagesFiles, dispatch, setLoginPrompt])

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value);
    pathname != `/edit_story/${storyId}/${storyUserId}` ? 
      localStorage.setItem(`newTitle?id=${currentUserId}`, value) 
      : localStorage.setItem(`editTitle?id=${currentUserId}`, value)
  }

  const handleBody = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setTextareaValue(value);
    pathname != `/edit_story/${storyId}/${storyUserId}` ? 
      localStorage.setItem(`newBody?id=${currentUserId}`, value)
        : localStorage.setItem(`editBody?id=${currentUserId}`, value)
  }

  useEffect(() => {
    let isMounted = true
    if(isMounted && storyId && target) setTargetStory(target as PostType)
    return () => {
      isMounted = false
    }
  }, [storyId, target])

  useEffect(() => {
    let isMounted = true
    if(isMounted){
      const savedTitle = (pathname !== `/edit_story/${storyId}/${storyUserId}` ? localStorage.getItem(`newTitle?id=${currentUserId}`) : (localStorage.getItem(`editTitle?id=${currentUserId}`)) || targetStory?.title)
      const savedBody = (pathname !== `/edit_story/${storyId}/${storyUserId}` ? localStorage.getItem(`newBody?id=${currentUserId}`) : (localStorage.getItem(`editBody?id=${currentUserId}`)) || targetStory?.body)
      const getStore = JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] ?? []
      if(targetStory?.code?.length || getStore?.length){ 
        const putInStore = targetStory?.code?.map(code => {
          return { 
            langType: code?.language, code: code?.body, 
            codeId: nanoid(8), date: code?.createdAt 
          }
        }) ?? getStore
        const codeBodies = putInStore?.map(code => code?.code)
        const isPresent = getStore?.find(code => codeBodies?.includes(code?.code as string))
        if(!isPresent){
          const allCodes = [...putInStore, ...getStore]
          localStorage.setItem('revolving-codeStore', JSON.stringify([...allCodes]))
          setCodeStore([...allCodes])
        }
      }
      else{
        // localStorage.setItem('revolving-codeStore', JSON.stringify([...getStore]))
        setCodeStore([])
      }
      setInputValue(savedTitle?.trim() || '')
      setTextareaValue(savedBody?.trim() || '')
      setTypingEvent(debounceValue?.typing)
    }
    return () => {
      isMounted = false
    }
  }, [setTypingEvent, debounceValue.typing, targetStory?.code, storyUserId, setCodeStore, targetStory?.title, targetStory?.body, currentUserId, storyId, pathname])

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    let isMounted = true
    if(isMounted && targetStory?.category) setPostCategory(targetStory?.category)  
    return () => {
      isMounted = false
    }
  }, [targetStory?.category])
  
  useEffect(() => {
    let isMounted = true, timeoutId: TimeoutId;
    if(isMounted && errorMsg){
      timeoutId = setTimeout(() => {
        setErrorMsg(false)
      }, 8000);
    }
  return () => {
    isMounted = false
    clearTimeout(timeoutId)
  }
  }, [errorMsg])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && !codeStore?.length) setSnippet('Nil')
  return () => {
    isMounted = false
  }
  }, [codeStore])

  useEffect(() => {
    if(debounceValue?.typing == 'notTyping'){
      const storyData = targetStory ? {
        ...targetStory, title: inputValue.trim(), code: [], fontFamily,
        body: textareaValue.trim(), category: postCategory
      } : {
        title: inputValue.trim(), body: textareaValue.trim(), fontFamily,
        category: postCategory, userId: currentUserId
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

  return (
    <section className={`hidebars relative ${fontFamily} ${loading ? 'cursor-none' : ''} p-3 h-full text-sm flex flex-col overflow-y-scroll gap-2 sm:items-center mt-2 ${theme == 'light' ? 'bg-gray-100' : ''}`}>
      {
        codeEditor ? <CodeBlock /> 
        : (
            <>
              <input 
                type="text" ref={inputRef}
                placeholder='Title' value={inputValue}
                onChange={handleTitle}
                className={`${(isLoading || loading) ? 'animate-pulse cursor-none' : ''} sm:w-4/5 md:w-3/4 lg:w-3/5 rounded-md text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : 'bg-gray-200 shadow-2xl'}`}
              />
              <textarea 
                name="story" key={currentUserId}
                placeholder='Share your story...'
                value={textareaValue}
                cols={30} rows={9}
                onChange={handleBody}
                className={`${(isLoading || loading) ? 'animate-pulse cursor-none' : ''} sm:w-4/5 md:w-3/4 lg:w-3/5 text-lg p-2 ${theme == 'light' ? 'focus:outline-slate-300' : ''} ${theme == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : 'bg-slate-100 shadow-2xl'}`}
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
            title={imagesFiles.length < 2 ? 'Add images' : 'MAX'}
            role='Add images'
            className={`absolute ${codeEditor ? 'scale-0' : 'scale-100'} right-3 md:right-20 top-4 ${theme === 'light' ? 'bg-opacity-50 hover:opacity-60' : 'hover:opacity-50'} transition-all active:opacity-30 ${imagesFiles.length < 2 ? 'bg-slate-400 bg-opacity-30' : 'bg-red-500'} grid place-content-center w-10 h-10`}>
            <label htmlFor={(imagesFiles.length < 2 && currentUserId) ? 'image-upload' : ''} className='relative cursor-pointer h-full w-full' >
              <FaRegImages 
                className={`text-2xl`}
              />
            <span className={`absolute ${imagesFiles.length ? 'scale-100' : 'scale-0'} transition-all bottom-0 rounded-full bg-slate-950 text-white font-bold right-0 w-4 grid place-content-center h-4 p-1`}>{imagesFiles.length}</span>
            </label>
          </button>
        </div>

      <div className='w-full flex items-center justify-between sm:w-[80%] md:w-3/4 lg:w-3/5'>

        <div className={`${theme == 'light' ? 'bg-slate-200' : 'bg-slate-500'} transition-all ${codeEditor ? 'w-10' : 'max-w-[50%] sm:w-1/2'} p-1.5 rounded-md gap-2 flex items-center`}>

          <BiCodeAlt 
            onClick={() => setCodeEditor(prev => !prev)}
            title='Code Editor' className={`text-3xl min-w-fit border-2 border-slate-600 cursor-pointer rounded-lg hover:opacity-90 ${codeEditor ? 'text-slate-800 bg-gray-300' : 'text-gray-200 bg-gray-600'}`} 
          />

          <div title='Scroll left | right' className={`hidebars text-sm ${codeEditor ? 'hidden' : 'flex'} items-center w-full font-sans gap-1 h-full overflow-x-scroll rounded-md py-1 pl-2 pr-2 shadow-inner shadow-slate-900 text-white`}>
            {
              Object.values(NAVIGATE).map(category => (
                <p
                  onClick={() => addCategory(category)}
                  className={`p-1 bg-slate-600 rounded-md cursor-pointer hover:opacity-95 whitespace-nowrap transition-all ${postCategory.includes(category) ? 'bg-slate-800' : ''}`}
                  key={category}>
                  {category}
                </p>
              ))
            }
          </div>

        </div>

        <div className={`${(codeStore.length >= 1 || imagesFiles.length >= 1) ? 'scale-100' : 'scale-0'} flex items-center transition-all ${theme == 'light' ? 'text-white bg-slate-300 ' : 'bg-slate-500'} w-fit gap-2 p-1 text-sm font-sans rounded-md shadow-lg`}>
          <p 
            onClick={() => activateSnippet('Snippet')}
            className={`${codeStore.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Snippet' ? 'bg-slate-700' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-95 transiton-all cursor-pointer`}>Code snippets</p>
          <p 
            onClick={() => activateSnippet('Image')}
            className={`${imagesFiles.length >= 1 ? 'scale-100' : 'scale-0 hidden'} ${snippet == 'Image' ? 'bg-slate-700' : ''} rounded-md p-1.5 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} hover:opacity-95 transiton-all cursor-pointer`}>Images</p>
        </div>

      </div>

      <CodeSnippets 
        errorMsg={errorMsg} loadingImage={loadingImage}
        setIsPresent={setIsPresent} setSnippet={setSnippet} success={success}
        theme={theme} snippet={snippet} isPresent={isPresent} codeEditor={codeEditor} 
        setSuccess={setSuccess} includesId={includesId} setIncludesId={setIncludesId}
      />
      
      <div 
        className={`absolute bottom-8 text-base p-2 bg-slate-300 bg-opacity-50 rounded-md ${(snippet === 'Snippet' && !codeEditor && codeStore?.length) ? 'scale-100' : 'scale-0'} transition-all font-bold`}
        >Please check before publishing your post</div>
    </section>
  )
}
//BiCodeBlock