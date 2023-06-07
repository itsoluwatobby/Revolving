import { UserProps } from "../data"

export const updateUserOption = (targetUser: UserProps): object => {
  return {
    optimisticData: (users: UserProps[]): UserProps[] => {
      const otherUser = users.filter(user => user?._id !== targetUser?._id)
      return [...otherUser, targetUser]
    },
    rollBackOnError: true,
    populateCache: (users: UserProps[]): UserProps[] => {
      const otherUser = users.filter(user => user?._id !== targetUser?._id)
      return [...otherUser, targetUser]
    },
    revalidate: false
  }
}

export const followUnfollowUserOption = (followerUser: UserProps, followingId: string): object => {
  return {
    optimisticData: (users: UserProps[]): UserProps[] => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!followerUser?.followings?.includes(followingId)){
        followerUser?.followings?.push(followingId)
        followingUser?.followers?.push(followerUser?._id)
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != followerUser?._id)
        return [...otherUsers2, followingUser, followerUser]
      }
      else{
        const followings = followerUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != followerUser?._id)
        followingUser = {...followingUser, followings}
        followerUser = {...followerUser, followers}
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != followerUser?._id)
        return [...otherUsers2, followingUser, followerUser]
      }
    },
    rollBackOnError: true,
    populateCache: (users: UserProps[]): UserProps[] => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!followerUser?.followings?.includes(followingId)){
        followerUser?.followings?.push(followingId)
        followingUser?.followers?.push(followerUser?._id)
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != followerUser?._id)
        return [...otherUsers2, followingUser, followerUser]
      }
      else{
        const followings = followerUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != followerUser?._id)
        followingUser = {...followingUser, followings}
        followerUser = {...followerUser, followers}
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != followerUser?._id)
        return [...otherUsers2, followingUser, followerUser]
      }
    },
    revalidate: false
  }
}

export const deleteUserOption = (userId: string): object => {
  return {
    optimisticData: (users: UserProps[]): UserProps[] => {
      const otherUser = users.filter(user => user?._id !== userId)
      return [...otherUser]
    },
    rollBackOnError: true,
    populateCache: (emptyResponseObj: object, users: UserProps[]): UserProps[] => {
      const otherUser = users.filter(user => user?._id !== userId)
      return [...otherUser]
    },
    revalidate: true
  }
}
