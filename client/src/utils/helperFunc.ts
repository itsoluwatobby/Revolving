import { UserProps } from "../data";

export const userOfPost = (users: UserProps[], userId: string): string => {
  const result = users?.find(user => user?._id === userId) as UserProps
  return result ? result?.username : ''
}

export function providesTag<R extends { _id: string | number }, T extends string>(resultWithIds: R[], TagType: T){
  return (
    resultWithIds ? [ 
      { type: TagType, id: 'LIST' }, 
      ...resultWithIds.map(({ _id }) => ({ type: TagType, id: _id }))
    ] 
    : 
    [{ type: TagType, id: 'LIST' }]
  )
}