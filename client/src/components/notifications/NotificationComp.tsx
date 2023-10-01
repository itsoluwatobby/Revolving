import { Theme } from '../../posts';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { ErrorContent } from '../ErrorContent';
import FollowUnFollow from '../singlePost/FollowUnFollow';
import { checkCount, reduceLength } from '../../utils/navigator';
import { ErrorResponse, NotificationModelType } from '../../data';
import SkeletonNotification from '../skeletons/SkeletonNotification';

type FollowsCompProps = { 
  theme: Theme,
  isLoading: boolean,
  errorMsg: ErrorResponse,
  notifications: NotificationModelType
 }

export default function NotificationComp({ notifications, isLoading, theme, errorMsg }: FollowsCompProps) {
  

  return (
    <section className='flex justify-between maxscreen:flex-col p-1 h-full w-full transition-all'>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>
        <div className={`sticky top-0 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} z-10 w-full p-2 font-medium`}>Notifications</div>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonNotification />
            :
              notifications?.notification?.length ?  
              notifications?.notification?.map(follower => (
                  <div 
                    key={follower?._id}
                    className={`p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} gap-x-2 rounded-md`}
                  >

                    <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
                      {
                        follower?.displayPicture ? 
                        <img src={follower?.displayPicture} alt="" 
                          className="w-full h-full rounded-full object-cover"
                        /> 
                        : null
                      }
                    </figure>

                    <div className='flex-auto flex flex-col'>
                      <Link to={`/profile/${follower?._id}`}>
                        <p className='hover:underline underline-offset-2 cursor-pointer'>{follower?.firstName} {follower?.lastName}
                        </p>
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(follower?.description, 30, 'letter')}</p>
                    </div>

                    <div className='flex flex-col justify-between'>
                      <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(follower?.subDate)}</p>
                      <FollowUnFollow userId={follower?._id} position={['followPage']} />
                    </div>

                  </div>
                ))
              : <ErrorContent message='You have no followers' errorMsg={errorMsg} contentLength={notifications?.notification?.length } />
          }
        </article>
      </div>

    </section>
  )
}
