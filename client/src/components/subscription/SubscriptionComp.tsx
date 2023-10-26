import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { Theme } from '../../types/posts';
import { ErrorContent } from '../ErrorContent';
import { checkCount, reduceLength } from '../../utils/navigator';
import SkeletonSubscription from '../skeletons/SkeletonSubscription';
import { ErrorResponse, Followers, Follows, GetSubscriptionType } from '../../types/data';

type SubscriptionCompProps = { 
  theme: Theme,
  isLoading: boolean,
  errorMsg: ErrorResponse,
  yourSubscriptions: GetSubscriptionType
 }

export default function SubscriptionComp({ yourSubscriptions, isLoading, theme, errorMsg }: SubscriptionCompProps) {
  const sortedSubscriptions = yourSubscriptions?.subscriptions?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate))
  const sortedSubscribed = yourSubscriptions?.subscribed?.sort((a, b) => b?.subDate?.localeCompare(a?.subDate))

  return (
    <section className='flex justify-between maxscreen:flex-col p-1 h-full w-full transition-all'>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>
        <div className={`sticky top-0 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} z-10 w-full p-2 font-medium`}>Your Subscriptions</div>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonSubscription />
            :
              yourSubscriptions?.subscriptions?.length ?  
                sortedSubscriptions?.map(subscription => (
                  <div 
                    key={subscription?._id}
                    className={`p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} gap-x-2 rounded-md`}
                  >

                    <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
                      {
                        subscription?.displayPicture ? 
                        <img src={subscription?.displayPicture} alt="" 
                          className="w-full h-full rounded-full object-cover"
                        /> 
                        : null
                      }
                    </figure>

                    <div className='flex-auto flex flex-col'>
                      <Link to={`/profile/${subscription?._id}`}>
                        <p className='hover:underline underline-offset-2 cursor-pointer'>{subscription?.firstName} {subscription?.lastName}
                        </p>
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(subscription?.description, 30, 'letter')}</p>
                      <div className='flex items-center gap-3'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(subscription?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(subscription?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                    <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(subscription?.subDate)}</p>

                  </div>
                ))
              : 
              <ErrorContent 
                message='You have no subscriptions' 
                errorMsg={errorMsg} position='PROFILE'
                contentLength={yourSubscriptions?.subscriptions?.length } 
              />
          }
        </article>
      </div>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] maxscreen:w-full maxscreen:h-full box-border shadow-md overflow-y-scroll`}>
        <h2 className={`sticky top-0 z-10 rounded-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-2 font-medium`}>You Subscribed To:</h2>
        <article className='flex flex-col h-full gap-2 w-full py-1.5 px-3'>
          {
            isLoading ?
              <SkeletonSubscription />
            :
              yourSubscriptions?.subscribed?.length ? 
                sortedSubscribed?.map(subscriber => (
                  <div 
                    key={subscriber?._id}
                    className={`p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'} gap-x-2 rounded-md`}
                  >

                    <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
                      {
                        subscriber?.displayPicture ? 
                        <img src={subscriber?.displayPicture} alt="" 
                          className="w-full h-full rounded-full object-cover"
                        /> 
                        : null
                      }
                    </figure>

                    <div className='flex-auto flex flex-col'>
                      <Link to={`/profile/${subscriber?._id}`}>
                        <p className='hover:underline underline-offset-2 cursor-pointer'>{subscriber?.firstName} {subscriber?.lastName}
                        </p>
                      </Link>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{reduceLength(subscriber?.description, 30, 'letter')}</p>
                      <div className='flex items-center gap-2 w-full'>
                        <p className='text-[12px]'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(subscriber?.followers as Followers[])}</span></p>
                        <p className='text-[12px]'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(subscriber?.followings as Follows[])}</span></p>
                      </div>
                    </div>

                    <p className={`text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{format(subscriber?.subDate)}</p>

                  </div>
                ))
              : 
              <ErrorContent 
                message='You subscribed to no one' 
                position='PROFILE' errorMsg={errorMsg} 
                contentLength={yourSubscriptions?.subscribed?.length } 
              />
          }
        </article>
      </div>

    </section>
  )
}