import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import LikeStory from '../singlePost/LikeStory';
import { reduceLength } from '../../utils/navigator';
import FollowUnFollow from '../singlePost/FollowUnFollow';
import { IsIntersectingType, PostType, Theme } from '../../types/posts';

type Props = {
  theme: Theme,
  pathname: string,
  targetStory: PostType,
  designatedPath: string,
  notintersecting: IsIntersectingType,
}

export default function MidModal({ targetStory, theme, notintersecting, designatedPath, pathname }: Props) {

  return (
    <div className={`${(pathname === `/story/${targetStory?._id}` || pathname === `/story/${targetStory?.sharedId}`) ? 'block' : 'hidden'} flex-auto grid transition-all place-content-center ${notintersecting === 'NOT_INTERSECTING' ? 'scale-100' : 'scale-0'}`}>
      <div className={`flex flex-col gap-1 minmobile:gap-0 minmobile:pl-1.5 ${pathname !== designatedPath ? 'hidden' : 'block'}`}>
        <div className='flex items-center gap-1.5'>
          <Link to={`/profile/${targetStory?.userId}`}>
            <small className='capitalize text-xs cursor-pointer hover:underline underline-offset-1'>{reduceLength(targetStory?.author, 7, 'letter') || 'anonymous'}</small>
          </Link>
          <span>.</span>
          <small className={`text-xs ${theme == 'light' ? 'text-gray-500' : 'text-gray-300'}`}>{format(targetStory?.createdAt, 'en-US')}</small>

          <FollowUnFollow userId={targetStory?.userId} position={['navbar']} />

        </div>
        <div className='flex items-center gap-1.5'>
          <h1 
            className='whitespace-pre-wrap font-bold uppercase mobile:line-clamp-1'>{reduceLength(targetStory?.title, 14, 'letter')}
          </h1>
          <LikeStory story={targetStory} position={['navbar']} />
        </div>
      </div>
    </div>
  )
}