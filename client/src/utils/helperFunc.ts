import { ObjectUnknown, UserProps } from "../data";

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

export const dateFormat = (dateTime: string) => {
  const constructDate = new Date(dateTime)
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
  }).format(constructDate)
  return date
}

export async function contentFeedAlgorithm<T>(entry: ObjectUnknown<T>[], numLikes=50){
  const mostLikedPosts = entry?.filter(post => Number(post?.likes) >= numLikes) ?? []
  const otherLikedPosts = entry?.filter(post => Number(post?.likes) < numLikes) ?? []

  shufflePosts(mostLikedPosts)
  shufflePosts(otherLikedPosts)

  sortByTime(mostLikedPosts)
  sortByTime(otherLikedPosts)
  const combinedPosts = [...mostLikedPosts, ...otherLikedPosts];
  // return new Promise(resolve => {
  //   combinedPosts = [...mostLikedPosts, ...otherLikedPosts]
  //   resolve(combinedPosts)
  // })
  return combinedPosts
}

function shufflePosts<K>(content: ObjectUnknown<K>[]){
  for(let i = content?.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1))
    const temp = content[i]
    content[i] = content[j]
    content[j] = temp
  }
}

function sortByTime<K>(content: ObjectUnknown<K>[]){
  content?.sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))
}
