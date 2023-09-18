import { TextRules } from "../fonts";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { BsArrowBarRight } from 'react-icons/bs';
import Aside from "../components/singlePost/Aside";
import { useEffect, useRef, useState } from "react";
import { PostType, ThemeContextType } from "../posts";
import { WindowScroll } from "../components/WindowScroll";
import { useThemeContext } from "../hooks/useThemeContext";
import ArticleComp from "../components/singlePost/ArticleComp";
import { SinglePageSidebar } from "../components/singlePost/SinglePageSidebar";
import { useGetStoriesQuery, useGetStoryQuery } from "../app/api/storyApiSlice";
import { useAverageReadTimePerStory } from "../hooks/useAverageReadTimePerStory";

export default function SingleStoryPage() {
  const { storyId } = useParams() as {storyId: string}
  const [sidebar, setSidebar] = useState<boolean>(false);
  const { loginPrompt, fontOption, setFontOption, theme } = useThemeContext() as ThemeContextType
  const { data: target, isLoading, isError } = useGetStoryQuery(storyId);
  const { data, isLoading: loading } = useGetStoriesQuery()
  const [stories, setStories] = useState<PostType[]>([])
  const [options, setOptions] = useState<string>('')
  const [isBarOpen, setIsBarOpen] = useState<boolean>(false)
  const [targetStory, setTargetStory] = useState<PostType>();
  const averageReadingTime = useAverageReadTimePerStory(targetStory?.body as string)
  const watchWords = TextRules.keywords as string[]
  const storyRef = useRef<HTMLDivElement>(null)

  const printPDF = useReactToPrint({
    content: () => storyRef?.current,
    pageStyle: `{ padding: 2rem 1rem 1rem }`,
    documentTitle: target?.title?.toUpperCase(),
    onAfterPrint: () => alert('Document downloaded successsfully'),
    onPrintError: () => alert('Error printing document')
  })

  // const end = averageReadingTime.split(' ')[1]
  // averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end;
  const triggerPrint = () => printPDF()

  useEffect(() => {
    let isMounted = true
    isMounted ? setTargetStory(target as PostType) : null
    return () => {
      isMounted = false
    }
  }, [target])

  useEffect(() => {
    let isMounted = true
    isMounted ? setStories(data as PostType[]) : null
    return () => {
      isMounted = false
    }
  }, [data])
  
  const bodyContent = targetStory ? targetStory?.body.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-400 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'text-red-500 bg-gray-400 rounded-sm' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  return (
    <WindowScroll>
      <main className={`single_page h-full ${loginPrompt == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-4 drop-shadow-2xl`}>
        <div className="flex h-full">
          {(Array.isArray(stories) && stories.length)
            ? <Aside 
                sidebar={sidebar} setIsBarOpen={setIsBarOpen}
                setSidebar={setSidebar} stories={stories as PostType[]} 
              /> 
            : null
          }
          <ArticleComp 
            isError={isError} storyRef={storyRef} triggerPrint={triggerPrint}
            story={targetStory as PostType} bodyContent={bodyContent as JSX.Element[]}
            averageReadingTime={averageReadingTime} sidebar={sidebar} isLoading={isLoading} 
          />
        </div>
        <BsArrowBarRight 
          title='Recent stories'
          onClick={() => setSidebar(true)}
          className={`${isBarOpen ? '' : 'hidden'} fixed md:hidden left-0 top-[40%] opacity-30 animate-bounce bg-slate-400 cursor-pointer rounded-tr-md rounded-br-md hover:opacity-80 p-1 text-[30px]`} />

        {
          <SinglePageSidebar
          fontOption={fontOption} options={options} triggerPrint={triggerPrint}
          setOptions={setOptions} storyId={storyId} theme={theme} setFontOption={setFontOption}
          />  
        }
      </main>
    </WindowScroll>
  )
}
