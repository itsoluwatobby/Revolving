import { TaskBin, TaskProp } from "../../data";
import { providesTag } from "../../utils/helperFunc";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type TaskArgs = {
  userId: string, taskId?: string, task: Partial<TaskProp>
}

type ResponseType = { data: TaskProp[] }

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createTask: builder.mutation<TaskProp, Partial<TaskArgs>>({
      query: ({userId, task}) => ({
        url: `task/${userId}`,
        method: 'POST',
        body: {...task}
      }) as any,
      invalidatesTags: [{ type: 'TASK' }],
    }),

    updateTask: builder.mutation<TaskProp, TaskArgs>({
      query: ({userId, task}) => ({
        url: `task/${userId}`,
        method: 'PUT',
        body: {...task}
      }) as any,
      invalidatesTags: [{ type: 'TASK', id: 'LIST'}],
    }),
    
    deleteTask: builder.mutation<void, Omit<TaskArgs, 'task'>>({
      query: ({userId, taskId}) => ({
        url: `task/${userId}/${taskId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'TASK', id: 'LIST'}],
    }),

    getTask: builder.query<TaskProp, string>({
      query: (taskId) => `task/${taskId}`,
      transformResponse: (baseQueryReturnValue: {data: TaskProp}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['TASK']
    }),

    getUserTasks: builder.query<TaskProp[], string>({
      query: (userId) => `task/user/${userId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as TaskProp[], 'TASK')
    }),
    
    getTaskBin: builder.query<TaskBin, string>({
      query: (userId) => `task/bin/${userId}`,
      transformResponse: (baseQueryReturnValue: {data: TaskBin}) => {
        return baseQueryReturnValue.data
      }, 
      providesTags: ['TASKBIN']
    }),

    clearTaskBin: builder.mutation<void, Pick<TaskArgs, 'userId'>>({
      query: (userId) => ({
        url: `task/bin/${userId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'TASKBIN'}],
    }),

  })
})

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUserTasksQuery,
  useGetTaskQuery,
  useGetTaskBinQuery,
  useClearTaskBinMutation
} = taskApiSlice

// //returns query result object 
// export const selectStoriesResult = taskApiSlice.endpoints.getStories.select()

// // creates momixed 
// const selectStoriesData = createSelector(
//   selectStoriesResult,
//   storyResult => storyResult?.data // normalized data
// )


// export const {
//   selectAll: selectAllStories,
//   selectById: selectAllStoryBy,
//   selectIds: selectStoryIds
// } = storyAdapter.getSelectors((state: PostType) => state.story)