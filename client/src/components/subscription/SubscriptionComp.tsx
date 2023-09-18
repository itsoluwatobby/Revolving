import { Theme } from '../../posts';
import { GetSubscriptionType } from '../../data';
import SkeletonSubscription from '../skeletons/SkeletonSubscription';

type SubscriptionCompProps = { 
  theme: Theme,
  isLoading: boolean,
  yourSubscriptions: GetSubscriptionType
 }

export default function SubscriptionComp({ yourSubscriptions, isLoading, theme }: SubscriptionCompProps) {

  return (
    <div className='flex justify-between p-1 h-full w-full'>
      <div className={`hidebars flex flex-col gap-2 w-[49.5%] shadow-md box-border overflow-y-scroll`}>
        <div className={`sticky top-0 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-2 font-medium`}>Your Subscriptions</div>
        {
          isLoading ?
            <SkeletonSubscription />
          :
            <article className='hidebars flex flex-col h-full gap-2 w-full'>
              {
                yourSubscriptions?.subscriptions?.map(subscription => (
                  <div 
                    key={subscription?._id}
                    className='p-1'
                  >
                    <p>{subscription?.firstName}</p>
                  </div>
                ))
              }
            </article>
        }
      </div>

      <div className={`hidebars flex flex-col gap-2 w-[49.5%] box-border shadow-md overflow-y-scroll`}>
        <h2 className={`sticky top-0 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} w-full p-2 font-medium`}>You Subscribed To:</h2>
        <article className='flex flex-col h-full gap-2 w-full'>
        {
          isLoading ?
            <SkeletonSubscription />
          :
            <article className='hidebars flex flex-col h-full gap-2 w-full'>
              {
                yourSubscriptions?.subscribed?.map(subscriber => (
                  <div 
                    key={subscriber?._id}
                    className='p-1'
                  >
                    <p>{subscriber?.firstName}</p>
                  </div>
                ))
              }
            </article>
        }
        </article>
      </div>
    </div>
  )
}