import { usePostContext } from '../hooks/usePostContext';
import { useThemeContext } from '../hooks/useThemeContext';
import { PostContextType, ThemeContextType } from '../posts';

export const NewStory = () => {
  const {fontFamily} = useThemeContext() as ThemeContextType;
  const currentMode = localStorage.getItem('theme');
  //const {} = usePostContext() as PostContextType

  return (
    <section className={`${fontFamily} p-3 h-full flex flex-col gap-2 sm:items-center mt-2`}>
      <input 
        type="text" 
        placeholder='Title'
        className={`sm:w-3/5 text-5xl placeholder:text-gray-300 focus:outline-none pl-2 p-1 ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
      <textarea 
        name="" id=""
        placeholder='Share your story...' 
        cols={30} rows={12}
        className={`sm:w-3/5 text-xl p-2 ${currentMode == 'light' ? 'focus:outline-slate-300' : ''} ${currentMode == 'dark' ? 'bg-slate-700 border-none focus:outline-none rounded-lg' : ''}`}
      />
    </section>
  )
}
