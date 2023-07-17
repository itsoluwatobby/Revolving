import LikeStory from '../singlePost/LikeStory'
import FollowUnFollow from '../singlePost/FollowUnFollow'
import { reduceLength } from '../../utils/navigator'
import { ChatOption, PostType, Theme } from '../../posts'
import { format } from 'timeago.js'

type Props = {
  targetStory: PostType,
  notintersecting: ChatOption,
  designatedPath: string,
  pathname: string,
  theme: Theme
}

export default function MidModal({ targetStory, theme, notintersecting, designatedPath, pathname }: Props) {

  return (
    <div className={`flex-auto grid transition-all place-content-center ${notintersecting === 'Open' ? 'scale-100' : 'scale-0'}`}>
      <div className={`flex flex-col gap-1 minmobile:gap-0 minmobile:pl-1.5 ${pathname !== designatedPath ? 'hidden' : 'block'}`}>
        <div className='flex items-center gap-2'>
          <small className='capitalize text-xs cursor-pointer'>{reduceLength(targetStory?.author, 7, 'letter') || 'anonymous'}</small>
          <span>.</span>
          <small className={`text-xs ${theme == 'light' ? 'text-gray-500' : 'text-gray-300'}`}>{format(targetStory?.createdAt, 'en-US')}</small>

          <FollowUnFollow userId={targetStory?.userId} position='navbar' />

        </div>
        <div className='flex items-center gap-4'>
          <h1 
            className='whitespace-pre-wrap font-bold uppercase mobile:line-clamp-1'>{reduceLength(targetStory?.title, 5, 'word')}
          </h1>
          <LikeStory story={targetStory} position='navbar' />
        </div>
      </div>
    </div>
  )
}