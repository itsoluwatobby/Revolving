import { PostFeedType, PostType } from "../posts";
import { useEffect, useState } from "react";


const initFeeds = { filteredFeeds: [] as PostType[], isLoading: false }
export default function useRevolvingPostFeed(stories: PostType[], numLikes=70) {
  const [filteredFeeds, setFilteredFeeds] = useState<PostFeedType>(initFeeds)
  
  useEffect(() => {
    let isMounted = true
    
    const contentFeedAlgorithm = () => {
      setFilteredFeeds(prev => ({...prev, isLoading: true}))
      let mostLikedStories = [] as PostType[], lessLikedStories = [] as PostType[];
      stories.map(story => (story.sharedLikes?.length || story.likes?.length) >= numLikes ? mostLikedStories.push(story) : lessLikedStories.push(story))
      
      // sort stories according to time posted
      mostLikedStories = mostLikedStories.sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))
      lessLikedStories = lessLikedStories.sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))

      // sort stories with a random index
      mostLikedStories = mostLikedStories?.map((story, index) => {
        void(story)
        const j = Math.floor(Math.random() * (index + 1))
        const temp = mostLikedStories[index]
        mostLikedStories[index] = mostLikedStories[j]
        mostLikedStories[j] = temp
        return mostLikedStories[j]
      })
      lessLikedStories = lessLikedStories?.map((story, index) => {
        void(story)
        const j = Math.floor(Math.random() * (index + 1))
        const temp = stories[index]
        stories[index] = stories[j]
        stories[j] = temp
        return stories[j]
      })

      const combinedStories = [...mostLikedStories, ...lessLikedStories]
      setFilteredFeeds(prev => ({...prev, filteredFeeds: combinedStories, isLoading: false}))
    }
    console.log('running')
    if(isMounted) contentFeedAlgorithm()

    return () => {
      isMounted = false
    }
  }, [stories, numLikes])
  
  return filteredFeeds
}