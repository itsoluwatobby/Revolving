import { Link, useLocation, useParams } from "react-router-dom";
import { CiSearch } from 'react-icons/ci'
import WedgeLoad from '../../assets/Wedges-14.3s-44px.svg'
import { usePostContext } from "../../hooks/usePostContext";
import { PostContextType, ThemeContextType } from "../../posts";
import { useThemeContext } from "../../hooks/useThemeContext";

type TopLeftProp={
  delayedSaving: boolean
}

export default function TopLeft({ delayedSaving }: TopLeftProp) {
  const {postData, search, setSearch} = usePostContext() as PostContextType
  const {theme, setFontOption, setRollout} = useThemeContext() as ThemeContextType
  const { pathname } = useLocation();
  const { postId } = useParams()

  const address = ['/new_story', `/edit_story/${postId}`, `/story/${postId}`]


  return (
    <>
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
        !address.includes(pathname) ?
          <div className={`flex gap-0.5 justify-around items-center rounded-md w-60 mobile:w-64 h-full ${theme == 'dark' ? 'bg-gray-500' : ''} mobile:translate-y-8`}>  
              <CiSearch className='text-gray-700 text-xl w-8'/>
              <input 
                type="text"
                name='search'
                placeholder='Search Medium'
                value = {search}
                onChange={e => setSearch(e.target.value)}
                className={`placeholder:text-sm w-full rounded-md placeholder:font-normal font-sans flex-auto focus:outline-none h-full p-1 bg-inherit box-border ${theme == 'dark' ? 'placeholder:text-gray-200' : ''}`}
                />
            </div>
            : (
                (postData?.title || postData?.body) && (
                  <div className='flex gap-2 mobile:ml-2'>
                    <p>{delayedSaving ? 'saving...' : 'saved'}</p>
                    <p className='text-gray-500'>Draft</p>
                  </div>
                )
              )
          }
    </>
  )
}