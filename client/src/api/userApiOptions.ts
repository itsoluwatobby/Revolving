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

export const followUnfollowUserOption = (currentUser: UserProps, followingId: string): object => {
  return {
    optimisticData: (users: UserProps[]): UserProps => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!currentUser?.followings?.includes(followingId)){
        currentUser?.followings?.push(followingId)
        followingUser?.followers?.push(currentUser?._id)
        // const otherUsers1 = users.filter(user => user?._id != followingId)
        // const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        // return [...otherUsers2, followingUser, currentUser]
        console.log({currentUser})
        return currentUser
      }
      else{
        const followings = currentUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != currentUser?._id)
        followingUser = {...followingUser, followings}
        currentUser = {...currentUser, followers}
        // const otherUsers1 = users.filter(user => user?._id != followingId)
        // const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        // return [...otherUsers2, followingUser, currentUser]
        console.log({currentUser})
        return currentUser
      }
    },
    rollBackOnError: true,
    populateCache: (users: UserProps[]): UserProps => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!currentUser?.followings?.includes(followingId)){
        currentUser?.followings?.push(followingId)
        followingUser?.followers?.push(currentUser?._id)
        // const otherUsers1 = users.filter(user => user?._id != followingId)
        // const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        console.log({currentUser})
        return currentUser
      }
      else{
        const followings = currentUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != currentUser?._id)
        followingUser = {...followingUser, followings}
        currentUser = {...currentUser, followers}
        // const otherUsers1 = users.filter(user => user?._id != followingId)
        // const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        // return [...otherUsers2, followingUser, currentUser]
        console.log({currentUser})
        return currentUser
      }
    },
    revalidate: false
  }
}

export const followUnfollowUserAllOption = (currentUser: UserProps, followingId: string): object => {
  return {
    optimisticData: (users: UserProps[]): UserProps[] => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!currentUser?.followings?.includes(followingId)){
        currentUser?.followings?.push(followingId)
        followingUser?.followers?.push(currentUser?._id)
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        return [...otherUsers2, followingUser, currentUser]
      }
      else{
        const followings = currentUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != currentUser?._id)
        followingUser = {...followingUser, followings}
        currentUser = {...currentUser, followers}
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        return [...otherUsers2, followingUser, currentUser]
      }
    },
    rollBackOnError: true,
    populateCache: (users: UserProps[]): UserProps[] => {
      let followingUser = users.find(user => user?._id !== followingId) as UserProps
      if(!currentUser?.followings?.includes(followingId)){
        currentUser?.followings?.push(followingId)
        followingUser?.followers?.push(currentUser?._id)
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        return [...otherUsers2, followingUser, currentUser]
      }
      else{
        const followings = currentUser?.followings?.filter(id => id != followingId)
        const followers = followingUser?.followers?.filter(id => id != currentUser?._id)
        followingUser = {...followingUser, followings}
        currentUser = {...currentUser, followers}
        const otherUsers1 = users.filter(user => user?._id != followingId)
        const otherUsers2 = otherUsers1.filter(user => user?._id != currentUser?._id)
        return [...otherUsers2, followingUser, currentUser]
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
