import { useGetUserByIdQuery } from "../app/api/usersApiSlice";
import { UserProps } from "../data";
import { useState, useEffect } from 'react';
import { useThemeContext } from "../hooks/useThemeContext";
import { ChatOption, ThemeContextType } from "../posts";
import { SkeletonUser } from "./skeletons/SkeletonUser";
import { MdOutlineRunningWithErrors } from 'react-icons/md';
import FollowUnFollow from "./singlePost/FollowUnFollow";
import { checkCount, reduceLength } from "../utils/navigator";
import { Link } from "react-router-dom";

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
      <div className="flex flex-col gap-0.5 text-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex-grow flex items-center gap-2">
            <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-10 h-10">
              {user?.displayPicture?.photo ? <img src={user?.displayPicture?.photo} alt="" /> : null}
            </figure>
            <p className="capitalize font-bold flex flex-col">
              <Link to={`/profile/${user?._id}`}
                className="hover:underline transition-all"
              >
                {user?.username}
              </Link>
              <span className="text-xs text-gray-950 font-normal">{reduceLength(user?.description as string, 32,)}</span>
            </p>
          </div>
          <FollowUnFollow position="others" userId={user?._id as string} />
        </div>
        
        <div>
          <p>
            social media links          
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <p>
            followers <span className="font-bold">{checkCount(user?.followers as string[])}</span>
          </p>
          <p>
            following <span className="font-bold">{checkCount(user?.followings as string[])}</span>
          </p>
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
      className={`absolute ${revealCard == 'Open' ? 'scale-100' : 'scale-0'} transition-all rounded p-2 z-10 top-5 max-h-40 shadow-2xl md:w-1/3 w-1/2 ${theme == 'light' ? 'bg-white' : 'bg-slate-800'}`}>
      {content}
    </article>
  )
}