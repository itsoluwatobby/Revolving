import { format } from "timeago.js"
import { ErrorResponse, SharedProps, UserProps } from "../../data"
import { reduceLength } from "../../utils/navigator"
import { FiMoreVertical } from "react-icons/fi"
import { Link } from "react-router-dom"
import { CiEdit } from "react-icons/ci"
import { FaTrash } from "react-icons/fa"
import { useThemeContext } from "../../hooks/useThemeContext"
import { PostType, ThemeContextType } from "../../posts"
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
        // onClick={openText}
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
        {(userId == story?.userId && open) &&
          <div className={`absolute top-4 right-4 flex flex-col gap-1.5 items-center text-2xl opacity-80 ${theme == 'light' ? 'bg-gray-300' : 'bg-gray-600'} p-1 rounded-md`}>
            <Link to={`/edit_story/${story?._id}`} >  
              <CiEdit 
                title='Edit post'
                className={`cursor-pointer hover:opacity-70 shadow-lg transition-all ${theme == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
              />
            </Link>
            <FaTrash
              onClick={() => deleted(story?._id)}
              title='Delete post'
              className={`cursor-pointer hover:opacity-70 text-xl shadow-lg transition-all ${theme == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
            />
          
          </div>
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