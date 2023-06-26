import { format } from "timeago.js"
import { ErrorResponse, SharedProps, UserProps } from "../../data"
import { reduceLength } from "../../utils/navigator"
import { FiMoreVertical } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useThemeContext } from "../../hooks/useThemeContext"
import { PostType, Theme, ThemeContextType } from "../../posts"
import { userOfPost } from "../../utils/helperFunc"
import { useGetUsersQuery } from "../../app/api/usersApiSlice"
import { useDeleteStoryMutation } from "../../app/api/storyApiSlice"
import { toast } from "react-hot-toast"

type MakeTo = PostType & Pick<SharedProps, 'sharedDate'>

type PostTopProps = {
  story: MakeTo,
  bodyContent: JSX.Element[] | "No content",
  open: boolean,
  openText: () => void,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PostTop({ story, bodyContent, openText, open, setOpen }: PostTopProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const {data: users} = useGetUsersQuery()
  const [deleteStory, { isLoading: deleteLoading, isError: isDeleteError, error: deleteError }] = useDeleteStoryMutation()

  const deleted = async(id: string) => {
    try{
      await deleteStory({userId, storyId: id}).unwrap()
      toast.success('Success!! Post deleted', {
        duration: 2000, icon: '💀', style: { background: '#FA2B50'}
      })
    }
    catch(err: unknown){
      const errors = deleteError as ErrorResponse
      isDeleteError && toast.error(`${errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }



  return (
    <>
      <div 
        // onClick={() => setOpen(false)}
        className='relative flex items-center gap-3'>
        <p className='capitalize cursor-pointer hover:opacity-90 transition-all'>{
          reduceLength(userOfPost(users as UserProps[], story?.userId), 15) || 'anonymous'
          }
        </p>
        <span>.</span>
        <p>{format(story?.sharedDate || story?.storyDate, 'en-US')}</p>
        {userId && (
          <FiMoreVertical
            onClick={() => setOpen(prev => !prev)}
            title='Options'
            className={`absolute right-2 text-lg cursor-pointer opacity-75 hov)er:text-gray-600`}
          />
          )
        }
        {/* MAKE THIS MORE ATTRACTIVE */}
        {userId == story?.userId &&
          <p className={`absolute ${open ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-3 top-4 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? '' : 'border-gray-500 shadow-slate-800'}`}>
              <span 
                title='Edit post'
                className={buttonOptClass(theme)}>
                  <Link to={`/edit_story/${story?._id}`} >  
                    Edit
                  </Link>
              </span>
            <span 
              onClick={() => deleted(story?._id)}
              title='Delete post'
              className={buttonOptClass(theme)}>
              Delete
            </span>
          </p>
        }
      </div>
        <p 
          className='whitespace-pre-wrap font-bold capitalize text-lg'>{story?.title}</p>
      <Link to={`/story/${story?._id}`} >
        <p 
          onClick={openText}
          className='whitespace-pre-wrap text-sm first-letter:ml-3 first-letter:text-lg first-letter:capitalize'>
            {bodyContent}
        </p>
      </Link> 
    </>
  )
}

function buttonOptClass(theme: Theme){
  return `shadow-2xl shadow-slate-900 hover:scale-[1.04] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-700 hover:text-gray-300'}`
}


