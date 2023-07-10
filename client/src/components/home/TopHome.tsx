import { useEffect } from 'react'
import { GiHamburgerMenu} from 'react-icons/gi'
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import { Components, NAVIGATE } from '../../utils/navigator';
import { useSelector, useDispatch } from 'react-redux';
import { getTabCategory, setNavigation } from '../../features/story/navigationSlice';

const list_style = 'cursor-pointer touch-pan-x whitespace-nowrap text-gray-500 active:text-gray-500 duration-200 ease-in-out';

const arrow_class= "text-2xl md:hidden text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out text-xl z-50";

export const TopHome = () => {
  const {theme, setOpenComment, toggleLeft, setToggleLeft} = useThemeContext() as ThemeContextType;
  const getNavigation = useSelector(getTabCategory)
  const dispatch = useDispatch()
  // const scrollNavBar = useCallback((node: any) => {
  //   node && node.scrollIntoView({ smooth: true })
  // }, [])

  useEffect(() => {
    localStorage.setItem('NAVIGATE', getNavigation)
  }, [getNavigation])

  const content = (
    <header
      onClick={() => setOpenComment({option: 'Hide', storyId: ''})}
      className={`sticky top-0 z-30 max-w-full overflow-hidden flex-none flex items-center bg-inherit mt-2.5 mobile:mt-4 border $ border-l-0 border-r-0 border-t-1 duration-300 border-b-1 pl-2 pr-2 ${theme == 'dark' ? 'border-gray-700 dark:bg-slate-800' : 'border-gray-200 bg-white'}`}>
      <div className={`sm:hidden ${toggleLeft == 'Open' ? 'hidden' : ''} h-14 w-10 grid place-content-center z-50`}>
        <GiHamburgerMenu 
          onClick={() => setToggleLeft('Open')}
          className={arrow_class} />
      </div>
      <ul className={`hidebars p-4 w-full text-gray-700 flex items-center sm:justify-between gap-3 overflow-x-scroll`}>
        {//topHeader
          Object.entries(NAVIGATE).map(([key, value], i) => (
            <li 
              key={key}
              // ref={scrollNavBar}
              onClick={() => dispatch(setNavigation((Object.values(NAVIGATE)[i])))}
              className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'} ${value === getNavigation && 'font-bold'}`}>
              {value}
            </li>
          ))
        }
      </ul>
      <div 
        className={`h-14 w-10 md:hidden grid place-content-center z-50`}>
         
          {/* className={arrow_class} />  */}
      </div>
    </header>
  )

  return content
}
