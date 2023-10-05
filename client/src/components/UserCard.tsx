import { Followers, Follows, UserProps } from "../data";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ChatOption, ThemeContextType } from "../posts";
import { SkeletonUser } from "./skeletons/SkeletonUser";
import FollowUnFollow from "./singlePost/FollowUnFollow";
import { useThemeContext } from "../hooks/useThemeContext";
import { MdOutlineRunningWithErrors } from 'react-icons/md';
import { checkCount, reduceLength } from "../utils/navigator";
import { useGetUserByIdQuery } from "../app/api/usersApiSlice";

type UserCardProps = {
  userId: string,
  cardRef: React.LegacyRef<HTMLElement>,
  revealCard: ChatOption,
  setRevealCard: React.Dispatch<React.SetStateAction<ChatOption>>,
  setOnCard: React.Dispatch<React.SetStateAction<boolean>>,
  closeUserCard: () => void
}

export default function UserCard({ userId, closeUserCard, cardRef, revealCard, setRevealCard, setOnCard }: UserCardProps) {
  const {theme } = useThemeContext() as ThemeContextType
  const { data, isLoading, isError } = useGetUserByIdQuery(userId)
  const [user, setUser] = useState<UserProps>();

  useEffect(() => {
    let isMounted = true
    if(data){
      isMounted ? setUser(data as UserProps) : null
    }
    return () => {
      isMounted = false
    }
  }, [data])

  let content; 
  
  isLoading ? content = (
    <>
      <SkeletonUser />
    </>
  ) : isError ? content = (
    <>
      <div className='flex flex-col items-center w-full gap-2'>
        <p className="m-auto text-sm text-red-600 text-center">Error fetching user information</p>
        <MdOutlineRunningWithErrors 
          className='text-4xl text-gray-500'
        />
      </div>
    </>
  ) : content = (
    <>
      <div className="flex flex-col gap-y-2 text-sm bg-inherit">
        <div className="flex items-center justify-between w-full">
          <div className="flex-grow flex items-center gap-2">
            <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
              {
                user?.displayPicture?.photo ? 
                <img src={user?.displayPicture?.photo} alt="" 
                  className="w-full h-full rounded-full object-cover"
                /> 
                : null
              }
            </figure>
            <p className="capitalize font-bold flex flex-col">
              <Link to={`/profile/${user?._id}`}
                className="hover:underline transition-all"
              >
                {user?.username}
              </Link>
              <span className="text-xs font-normal">{reduceLength(user?.description as string, 25, 'letter')}</span>
            </p>
          </div>
          <FollowUnFollow position={["others"]} userId={user?._id as string} />
        </div>
        
        <div>
          <p>
            social media links          
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <Link to={`/follows/${userId}`}>
            <p>
              followers <span className="font-bold">{checkCount(user?.followers as Followers[])}</span>
            </p>
          </Link>
          <Link to={`/follows/${userId}`}>
            <p>
              following <span className="font-bold">{checkCount(user?.followings as Follows[])}</span>
            </p>
          </Link>
        </div>
        
      </div>
    </>
  )

  return (
    <article
      ref={cardRef}
      onMouseOver={closeUserCard}
      onMouseLeave={() => {
        setOnCard(false)
        setRevealCard('Hide')
      }}
      className={`absolute bg-slate-100 font-sans ${revealCard == 'Open' ? 'scale-100' : 'scale-0 hidden'} transition-all rounded p-2.5 z-10 top-5 max-h-40 shadow-2xl w-fit ${theme == 'light' ? 'bg-white' : 'bg-slate-800'}`}>
      {content}
    </article>
  )
}

// md:w-1/3 w-1/2