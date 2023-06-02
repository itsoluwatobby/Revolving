import { useCallback, useEffect } from 'react'
import { IoIosArrowForward, IoIosArrowBack} from 'react-icons/io'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';
import { Components, NAVIGATE } from '../assets/navigator';

type TopHomeProps={
  navigationTab: string,
  setNavigationTab: React.Dispatch<React.SetStateAction<Components>>
}

const list_style = 'cursor-pointer touch-pan-x whitespace-nowrap text-gray-500 active:text-gray-500 duration-200 ease-in-out';

const arrow_class= "text-xl text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out text-xl z-50";

export const TopHome = ({ navigationTab, setNavigationTab }: TopHomeProps) => {
  const {theme, setOpenComment} = useThemeContext() as ThemeContextType;

  // const scrollNavBar = useCallback((node: any) => {
  //   node && node.scrollIntoView({ smooth: true })
  // }, [])
  
  useEffect(() => {
    localStorage.setItem('NAVIGATE', navigationTab)
  }, [navigationTab])

  const content = (
    <header
      onClick={() => setOpenComment(false)}
      className={`sticky top-0 z-30 max-w-full overflow-hidden flex-none flex items-center bg-inherit mt-4 border $ border-l-0 border-r-0 border-t-1 duration-300 border-b-1 pr-2 ${theme == 'dark' ? 'border-gray-700 dark:bg-slate-800' : 'border-gray-200 bg-white'}`}>
      <div className={`md:hidden h-14 w-10 grid place-content-center z-50`}>
        <IoIosArrowBack 
          // onClick={scrollLeftHandler}
          className={arrow_class} />
      </div>
      <ul className={`hidebars p-4 w-full text-gray-700 flex items-center sm:justify-between gap-3 overflow-x-scroll`}>
        {//topHeader
          Object.entries(NAVIGATE).map(([key, value], i) => (
            <li 
              key={key}
              // ref={scrollNavBar}
              onClick={() => setNavigationTab((Object.values(NAVIGATE)[i]))}
              className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'} ${value === navigationTab && 'font-bold'}`}>
              {value}
            </li>
          ))
        }
      </ul>
      <div 
        className={`h-14 w-10 md:hidden grid place-content-center z-50`}>
        <IoIosArrowForward 
          className={arrow_class} /> 
      </div>
    </header>
  )

  return content
}
