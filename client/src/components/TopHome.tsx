import { useRef } from 'react'
import { IoIosArrowForward, IoIosArrowBack} from 'react-icons/io'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';

const list_style = 'cursor-pointer touch-pan-x whitespace-nowrap text-gray-500 active:text-gray-500 duration-200 ease-in-out';

const arrow_class= "text-xl text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out text-xl z-50";

const topHeader = ['General', 'Software Development', 'React', 'NodeJS', 'Bash scripting']

export const TopHome = () => {
  // const [scroll, setScroll] = useState(0);
  const scrollContainerRef = useRef(null)
  const {theme} = useThemeContext() as ThemeContextType;
  

  // const scrollLeftHandler = () => {
  //   scrollContainerRef.current.scrollLeft -= 100
  // }

  // const scrollRightHandler = () => {
  //   scrollContainerRef.current.scrollRight += 100
  // }
// ${theme == 'light' ? null : 'bg-slate-800'}
  const content = (
    <header 
      className={`sticky top-0 z-30 max-w-full overflow-hidden flex-none flex items-center bg-opacity-95 mt-4 border $ border-l-0 border-r-0 border-t-1 border-b-1 pr-2 ${theme == 'dark' ? 'border-gray-700 bg-slate-800' : 'border-gray-300 bg-white'}`}>
      <div className={`md:hidden h-14 w-10 grid place-content-center z-50`}>
        <IoIosArrowBack 
          // onClick={scrollLeftHandler}
          className={arrow_class} />
      </div>
      <ul ref={scrollContainerRef} className={`p-4 w-full md:justify-between text-gray-700 flex items-center sm:justify-between gap-3 mobile:overflow-x-scroll}`}>
        {
          topHeader.map((head, i) => (
            <p key={i} className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>
              {head}
            </p>
          ))
        }
      </ul>
      <div 
        className={`h-14 w-10 md:hidden grid place-content-center z-50`}>
        <IoIosArrowForward 
          // onClick={scrollRightHandler}
          className={arrow_class} /> 
      </div>
    </header>
  )

  return content
}
