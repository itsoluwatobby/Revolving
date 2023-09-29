import { Theme } from '../../posts';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { ErrorContent } from '../ErrorContent';
import { ErrorResponse, Followers, Follows, GetFollowsType } from '../../data';
import { checkCount, reduceLength } from '../../utils/navigator';
import SkeletonSubscription from '../skeletons/SkeletonSubscription';

type FollowsCompProps = { 
  theme: Theme,
  isLoading: boolean,
  errorMsg: ErrorResponse,
  yourFollowers: GetFollowsType
 }

export default function FollowsComp({ yourFollowers, isLoading, theme, errorMsg }: FollowsCompProps) {
  const sortedFollowers = yourFollowers?.followers?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate))
  const sortedFollows = yourFollowers?.follows?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate))

  return (
    <section className='flex justify-between maxscreen:flex-col p-1 h-full w-full transition-all'>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>
        <div className={`sticky top-0 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} z-10 w-full p-2 font-medium`}>Your Followers</div>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonSubscription />
            :
              yourFollowers?.followers.length ?  
                sortedFollowers?.map(follower => (
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
                      <div className='flex items-center gap-3'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follower?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follower?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                    <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(follower?.subDate)}</p>

                  </div>
                ))
              : <ErrorContent message='You have no followers' errorMsg={errorMsg} contentLength={yourFollowers?.followers?.length } />
          }
        </article>
      </div>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full box-border shadow-md overflow-y-scroll`}>
        <h2 className={`sticky top-0 z-10 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-2 font-medium`}>You Follow:</h2>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonSubscription />
            :
              yourFollowers?.follows?.length ? 
                sortedFollows?.map(follow => (
                  <div 
                    key={follow?._id}
                    className={`p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'} gap-x-2 rounded-md`}
                  >

                    <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
                      {
                        follow?.displayPicture ? 
                        <img src={follow?.displayPicture} alt="" 
                          className="w-full h-full rounded-full object-cover"
                        /> 
                        : null
                      }
                    </figure>

                    <div className='flex-auto flex flex-col'>
                      <Link to={`/profile/${follow?._id}`}>
                        <p className='hover:underline underline-offset-2 cursor-pointer'>{follow?.firstName} {follow?.lastName}
                        </p>
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(follow?.description, 30, 'letter')}</p>
                      <div className='flex items-center gap-2 w-full'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follow?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follow?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                    <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(follow?.subDate)}</p>
{/* FOLLOW BACK BUTTON */}
                  </div>
                ))
              : <ErrorContent message='You are following no one' errorMsg={errorMsg} contentLength={yourFollowers?.follows?.length } />
          }
        </article>
      </div>

    </section>
  )
}
