import React, { useState } from 'react'
import { IoIosArrowForward, IoIosArrowBack} from 'react-icons/io'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';

const list_style = 'cursor-pointer text-[15px] whitespace-nowrap text-gray-500 active:text-gray-500 duration-200 ease-in-out';

const arrow_class= "text-xl text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out text-xl z-50";

export const TopHome = () => {
  const [scroll, setScroll] = useState(0);
  const {theme} = useThemeContext() as ThemeContextType;
  

  const scrollLeftHandler = () => {
    setScroll((prev: number) => {
      const numPrev: number = +prev - 8
      return numPrev
    })
  }
  const scrollRightHandler = () => {
    setScroll((prev: number) => {
      const numPrev: number = +prev + 8
      return numPrev
    })
  }

  return (
    <header className={`sticky top-0 z-50 max-w-full flex-none flex items-center bg-opacity-95 mt-4 border ${theme == 'dark' ? 'border-gray-700 bg-slate-800' : 'border-gray-100 bg-white'} border-l-0 border-r-0 border-t-1 border-b-2 pr-2`}>
      <div className={`md:hidden h-14 w-10 grid place-content-center z-50 ${theme == 'light' ? null : 'bg-slate-800'}`}>
        <IoIosArrowBack 
          onClick={scrollLeftHandler}
          className={arrow_class + 'tran'} />
      </div>
      <ul className={`p-4 max-w-full text-gray-700 flex items-center sm:justify-between gap-3 overflow-y-auto overflow-x-hidden -translate-x-${[scroll.toString()]+'px'}`}>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>General</li>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>Software Development</li>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>React</li>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>Web Development</li>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>Node</li>
        <li 
          className={`${list_style} ${theme == 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-900'}`}>Bash Scripting</li>
      </ul>
      <div 
        className={`h-14 w-10 md:hidden grid place-content-center z-50 ${theme == 'light' ? null : 'bg-slate-800'}`}>
        <IoIosArrowForward 
          onClick={scrollRightHandler}
          className={arrow_class} /> 
      </div>
    </header>
  )
}
