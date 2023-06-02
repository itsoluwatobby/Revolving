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
