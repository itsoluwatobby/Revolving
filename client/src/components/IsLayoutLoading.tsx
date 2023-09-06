import whiteBGloader from '../assets/whiteloader.svg'
import darkBGloader from '../assets/darkLoader.svg'
import { useThemeContext } from '../hooks/useThemeContext'
import { ThemeContextType } from '../posts'

export const IsLayoutLoading = () => {
  const { theme } = useThemeContext() as ThemeContextType

  return (
    <>
      {
        theme == 'light' ?
          <figure className='border-none'>
            <img src={whiteBGloader} 
              alt="Loading..." 
              className='bg-inherit border-none m-auto translate-y-40'
            />
          </figure>
          :
          <figure className='border-none'>
            <img src={darkBGloader} 
              alt="Loading..." 
              className='bg-inherit border-none m-auto translate-y-40'
            />
          </figure>
      }
    </>
  )
}