import { Theme, ThemeContextType } from '../../posts';
import WedgeLoad from '../../assets/Wedges-14.3s-44px.svg';
import { useThemeContext } from '../../hooks/useThemeContext';

type ChatHeaderProp={
  theme: Theme
}

export default function ChatHeader({ theme }: ChatHeaderProp) {
  const { setOpenChat } = useThemeContext() as ThemeContextType
  
  return (
    <header className={`flex-none h-10 shadow-lg p-2 pr-0.5 w-full flex items-center justify-between sticky top-0`}>
      <figure className={`rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>
      <img 
            src={WedgeLoad} 
            alt='Logo' 
            className='h-full object-cover rounded-full mr-2'
            // onClick={() => {
            //   setRollout(false)
            //   setFontOption(false)
            // }}
          />
      </figure>
      <button 
        onClick={() => setOpenChat('Hide')}
        className='shadow-lg text-white border border-slate-700 bg-opacity-40 bg-slate-900 cursor-pointer p-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
        close
      </button>
    </header>
  )
}