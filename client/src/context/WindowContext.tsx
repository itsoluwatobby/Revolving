import { createContext, useEffect, useState } from 'react'
import { ChildrenProp, WindowContextType } from '../posts';

export const WindowContext = createContext<WindowContextType | null>(null);

const WindowContextProvider = ({ children }: ChildrenProp) => {
   const [windowSize, setWindowSize] = useState({
         Xscroll: 0,
         Yscroll: 0
      })

      const { Xscroll, Yscroll } = windowSize; 
      
      useEffect(() => {
         const onWindowChange = () => {
            setWindowSize({
               Xscroll: window.scrollX,
               Yscroll: window.scrollY
            })
         }
         window.addEventListener('scroll', onWindowChange)
   
         return () => window.removeEventListener('scroll', onWindowChange)
   
      }, [windowSize])


   const value = { Xscroll, Yscroll }
   return (
      <WindowContext.Provider value={value}>
         {children}
      </WindowContext.Provider>
   )
}

export default WindowContextProvider;