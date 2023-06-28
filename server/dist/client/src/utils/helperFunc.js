export const userOfPost = (users, userId) => {
    const result = users === null || users === void 0 ? void 0 : users.find(user => (user === null || user === void 0 ? void 0 : user._id) === userId);
    return result ? result === null || result === void 0 ? void 0 : result.username : '';
};
export function providesTag(resultWithIds, TagType) {
    return (resultWithIds ? [
        { type: TagType, id: 'LIST' },
        ...resultWithIds.map(({ _id }) => ({ type: TagType, id: _id }))
    ]
        :
            [{ type: TagType, id: 'LIST' }]);
}
// export function contentFeedAlgorithm<T>(entry: ObjectUnknown<T>[], numLikes=50){
//   const mostLikedPosts = entry?.filter(post => Number(post?.likes) >= numLikes)
//   const otherLikedPosts = entry?.filter(post => Number(post?.likes) < numLikes)
//   shufflePosts(mostLikedPosts)
//   shufflePosts(otherLikedPosts)
//   sortByTime(mostLikedPosts)
//   sortByTime(otherLikedPosts)
//   const combinedPosts = [...mostLikedPosts, ...otherLikedPosts]
//   return combinedPosts
// }
// function shufflePosts<K>(content: ObjectUnknown<K>[]){
//   for(let i = content?.length - 1; i > 0; i--){
//     const j = Math.floor(Math.random() * (i + 1))
//     const temp = content[i]
//     content[i] = content[j]
//     content[j] = temp
//   }
// }
// function sortByTime<K>(content: ObjectUnknown<K>[]){
//   content?.sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))
// }
//# sourceMappingURL=helperFunc.js.map