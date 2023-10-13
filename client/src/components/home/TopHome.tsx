import { useEffect } from 'react'
import { ThemeContextType } from '../../posts';
import { GiHamburgerMenu} from 'react-icons/gi';
import { useSelector, useDispatch } from 'react-redux';
import { NAVIGATE } from '../../utils/navigator';
import { useThemeContext } from '../../hooks/useThemeContext';
import { getTabCategory, setNavigation } from '../../features/story/navigationSlice';

const list_style = 'cursor-pointer touch-pan-x whitespace-nowrap text-gray-500 active:text-gray-500 duration-200 ease-in-out';

export const TopHome = () => {
  const {theme, toggleLeft, setToggleLeft} = useThemeContext() as ThemeContextType;
  const getNavigation = useSelector(getTabCategory)
  const dispatch = useDispatch()
  // const scrollNavBar = useCallback((node: HTMLElement) => {
  //   node ? node.scrollIntoView({ behavior: 'smooth' }) : null
  // }, [])

  useEffect(() => {
    localStorage.setItem('NAVIGATE', getNavigation)
  }, [getNavigation])

  const content = (
    <header
      className={`sticky top-0 z-10 max-w-full overflow-hidden flex-none flex items-center mt-2.5 mobile:mt-4 border $ border-l-0 border-r-0 border-t-1 border-b-1 pl-2 pr-2 ${theme == 'dark' ? 'border-gray-700 dark:bg-slate-900' : 'border-gray-200 bg-white'} transition-colors`}>
      <div className={`${toggleLeft == 'Open' ? 'hidden' : 'md:hidden'} h-14 w-10 grid place-content-center z-50`}>
        <GiHamburgerMenu 
          onClick={() => setToggleLeft('Open')}
          className={`text-xl text-gray-500 cursor-pointer hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out z-50`} />
      </div>
      <ul className={`hidebars p-4 w-full text-gray-700 flex items-center sm:justify-between gap-3 overflow-x-scroll`}>
        {
          Object.entries(NAVIGATE).map(([key, value], i) => (
            <li 
              key={key}
              //ref={scrollNavBar}
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
