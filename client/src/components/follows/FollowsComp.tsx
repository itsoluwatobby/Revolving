import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { Theme } from '../../types/posts';
import { ErrorContent } from '../ErrorContent';
import FollowUnFollow from '../singlePost/FollowUnFollow';
import { checkCount, reduceLength } from '../../utils/navigator';
import SkeletonSubscription from '../skeletons/SkeletonSubscription';
import { ErrorResponse, Followers, Follows, GetFollowsType } from '../../types/data';

type FollowsCompProps = { 
  theme: Theme,
  isLoading: boolean,
  currentUserId: string,
  errorMsg: ErrorResponse,
  yourFollowers: GetFollowsType
 }

export default function FollowsComp({ yourFollowers, currentUserId, isLoading, theme, errorMsg }: FollowsCompProps) {
  const LoggedInUserId = localStorage.getItem('revolving_userId') as string
  const sortedFollowers = yourFollowers?.followers ? [...yourFollowers.followers]?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate)) : []
  const sortedFollows = yourFollowers?.follows ? [...yourFollowers.follows]?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate)) : []
  console.log(LoggedInUserId)
  console.log(currentUserId)
  
  return (
    <section className='flex justify-between maxscreen:flex-col p-1 h-full w-full transition-all'>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>
        <div className={`sticky top-0 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} z-10 w-full p-2 font-medium`}>Your Followers</div>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonSubscription />
            :
              yourFollowers?.followers?.length ?  
                sortedFollowers?.map(follower => (
                 <div 
                    key={follower?._id}
                    className={`p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} gap-x-1.5 rounded-md`}
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
                      <Link to={`/profile/${follower?._id}`} className='w-fit'>
                        {
                          (follower?.firstName || follower?.lastName) ?
                            <p className='hover:underline underline-offset-2 cursor-pointer'>{follower?.firstName} {follower?.lastName}
                            </p>
                          :
                            <p className='hover:underline underline-offset-2 cursor-pointer'>
                              {follower?.email?.split('@')[0]}
                            </p>
                        }
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(follower?.description, 30, 'letter')}</p>
                      <div className='flex items-center gap-3'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follower?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follower?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                    <div className='flex flex-col justify-between'>
                      <p className={`pb-1.5 text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(follower?.subDate)}</p>
                      {LoggedInUserId === currentUserId ? <FollowUnFollow userId={follower?._id} position={['followPage']} currentUserId={currentUserId} /> : null}
                    </div>

                  </div>
                ))
              : 
              <ErrorContent 
                message='You have no followers' 
                position='PROFILE' errorMsg={errorMsg} 
                contentLength={yourFollowers?.followers?.length } 
              />
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
                      <Link to={`/profile/${follow?._id}`} className='w-fit'>
                        {
                          (follow?.firstName || follow?.lastName) ?
                            <p className='hover:underline underline-offset-2 cursor-pointer w-fit'>{follow?.firstName} {follow?.lastName}
                            </p>
                          :
                            <p className='hover:underline underline-offset-2 cursor-pointer'>
                              {follow?.email?.split('@')[0]}
                            </p>
                        }
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(follow?.description, 30, 'letter')}</p>
                      <div className='flex items-center gap-2 w-full'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follow?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(follow?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                      <div className='flex flex-col justify-between'>
                        <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(follow?.subDate)}</p>
                        {LoggedInUserId === currentUserId ? <FollowUnFollow userId={follow?._id} position={['followPage']} currentUserId={currentUserId} /> : null}
                      </div>
{/* FOLLOW BACK BUTTON */}
                  </div>
                ))
              : 
              <ErrorContent 
                message='You are following no one' 
                position='PROFILE' errorMsg={errorMsg} 
                contentLength={yourFollowers?.follows?.length} 
              />
          }
        </article>
      </div>

    </section>
  )
}
