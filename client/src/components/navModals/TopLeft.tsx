import { CiSearch } from 'react-icons/ci';
import { useSelector } from "react-redux";
import { TypingEvent } from "../../types/data";
import WedgeLoad from '../../assets/Wedges-14.3s-44px.svg';
import { usePostContext } from "../../hooks/usePostContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import { getStoryData } from "../../features/story/storySlice";
import { Link, useLocation, useParams } from "react-router-dom";
import { PostContextType, ThemeContextType } from "../../types/posts";

type TopLeftProp={
  delayedSaving: TypingEvent
}

export default function TopLeft({ delayedSaving }: TopLeftProp) {
  const postData = useSelector(getStoryData) 
  const { search, setSearch} = usePostContext() as PostContextType
  const {theme, setFontOption, setRollout} = useThemeContext() as ThemeContextType
  const { pathname } = useLocation();
  const { storyId, storyUserId, userId } = useParams()

  const searchBar = ['/', `/taskManager/${userId}`]
  const savedDraft = ['/new_story', `/edit_story/${storyId}/${storyUserId}`]
  
  return (
    <div className={`flex-none ${pathname === '/' ? 'md:sticky md:top-0' : ''} flex items-center`}>
      <Link to='/'>
          <img 
            src={WedgeLoad} 
            alt='Logo' className='h-full object-cover rounded-full mr-2'
            onClick={() => {
              setRollout(false)
              setFontOption(false)
            }}
          />
        </Link>
      {
        searchBar.includes(pathname) ?
          <div 
            className={`flex gap-0.5 justify-around items-center rounded-md md:w-48 lg:w-56 sm:w-48 midmobile:hidden mobile:w-32 h-8 ${theme == 'dark' ? 'bg-gray-500' : ''} mobile:translate-y-0`}
          >  
            <CiSearch className='text-gray-700 text-xl w-8'/>
            <input 
              type="text"
              name='search'
              placeholder='Search Stories'
              value = {search}
              onChange={e => setSearch(e.target.value)}
              className={`placeholder:text-sm mobile:text-xs w-full rounded-md placeholder:font-normal font-sans flex-auto focus:outline-none h-full p-0.5 bg-inherit box-border ${theme == 'dark' ? 'placeholder:text-gray-200' : ''}`}
              />
          </div>
          : 
          ((postData?.title || postData?.body) && savedDraft.includes(pathname)) ? (
            <div className='flex gap-2 mobile:ml-2'>
              <p>{delayedSaving == 'typing' ? 'saving...' : 'saved'}</p>
              <p className='text-gray-500'>Draft</p>
            </div>
          ) : null
        }
    </div>
  )
}