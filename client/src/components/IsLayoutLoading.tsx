import { ThemeContextType } from '../posts';
import darkBGloader from '../assets/darkLoader.svg';
import whiteBGloader from '../assets/whiteloader.svg';
import { useThemeContext } from '../hooks/useThemeContext';

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