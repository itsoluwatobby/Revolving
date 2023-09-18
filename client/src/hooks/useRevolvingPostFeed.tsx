import { PostType } from "../posts";
import { ObjectUnknown } from "../data";
import { useEffect, useState } from "react";


export default function useRevolvingPostFeed<T>(entry: ObjectUnknown<T>[], post: PostType[], numLikes=70) {
  const [filteredFeeds, setFilteredFeeds] = useState<ObjectUnknown<T>[]>()
  
  useEffect(() => {
    let isMounted = true
    
    function contentFeedAlgorithm(){
      const mostLikedPosts = entry.filter(post => Number(post.likes) >= numLikes)
      const otherLikedPosts = entry.filter(post => Number(post.likes) < numLikes)

      shufflePosts(mostLikedPosts)
      shufflePosts(otherLikedPosts)  
      sortByTime(mostLikedPosts)
      sortByTime(otherLikedPosts)
      const combinedPosts = [...mostLikedPosts, ...otherLikedPosts]
      setFilteredFeeds(combinedPosts)
    }
    
    function shufflePosts<K>(content: ObjectUnknown<K>[]){
      for(let i = content.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1))
        const temp = content[i]
        content[i] = content[j]
        content[j] = temp 
      }
    }
    
    function sortByTime<K>(content: ObjectUnknown<K>[]){
      content.sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))
    }

    console.log('running')
    
    isMounted ? contentFeedAlgorithm() : null

    return () => {
      isMounted = false
    }

  }, [post.length, entry, numLikes])
  
  return filteredFeeds
}