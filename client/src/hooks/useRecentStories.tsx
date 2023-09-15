import { PostType } from "../posts";

/**
* @description gets posts within the last 3 days
* @returns returns the recent posts
*/

export default function useRecentStories(stories: PostType[]): PostType[] {
  const DEFAULT_RECENTS_DURATION = 259_200_000 as const // 3 days
  const currentTime = new Date().getTime()
  const recentStories = stories?.filter(story => {
    return (currentTime - +new Date(story?.createdAt).getTime()) <= DEFAULT_RECENTS_DURATION
  })
  return recentStories
}