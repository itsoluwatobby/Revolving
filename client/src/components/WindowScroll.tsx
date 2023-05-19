import { useState, useEffect } from "react";
import { ChildrenProp } from "../posts";

export const WindowScroll = ({ children }: ChildrenProp) => {
  const [windowSize, setWindowSize] = useState({
        Xscroll: 0,
        Yscroll: 0
     })

     //const { Xscroll, Yscroll } = windowSize; 
     useEffect(() => {
        const onWindowScroll = () => {
         //   setWindowSize({
         //      Xscroll: window.scrollX,
         //      Yscroll: window.scrollY
         //   })
           console.log('scrolling...')
        }

        window.addEventListener('scroll', onWindowScroll)
  
        return () => window.removeEventListener('scroll', onWindowScroll)
     }, [])

  return (
   <div>
      {children}
   </div>
  )
}
