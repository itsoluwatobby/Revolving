import { UserProps } from "../data";

export const userOfPost = (users: UserProps[], userId: string): string => {
  const result = users?.find(user => user?._id === userId) as UserProps
  return result ? result?.username : ''
}
