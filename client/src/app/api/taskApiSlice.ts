import { TaskBin, TaskProp } from "../../data";
import { providesTag } from "../../utils/helperFunc";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type TaskArgs = {
  userId: string, taskId?: string, task: TaskProp
}

type ResponseType = { data: TaskProp[] }

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createTask: builder.mutation<TaskProp, TaskArgs>({
      query: ({userId, task}) => ({
        url: `task/${userId}`,
        method: 'POST',
        body: {...task}
      }) as any,
      invalidatesTags: [{ type: 'TASK' }],
    }),

    updateTask: builder.mutation<TaskProp, TaskArgs>({
      query: ({userId, taskId, task}) => ({
        url: `task/${userId}/${taskId}`,
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
      query: (id) => `task/${id}`,
      transformResponse: (baseQueryReturnValue: {data: TaskProp}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['TASK']
    }),

    getTasks: builder.query<TaskProp[], void>({
      query: () => 'task',
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as TaskProp[], 'TASK')
    }),
    
    getTaskBin: builder.query<TaskBin, string>({
      query: (userId) => `task/taskbin/${userId}`,
      transformResponse: (baseQueryReturnValue: {data: TaskBin}) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as TaskBin, 'TASK')
    }),

    clearTaskBin: builder.mutation<void, Pick<TaskArgs, 'userId'>>({
      query: (userId) => ({
        url: `task/${userId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'TASK', id: 'LIST'}],
    }),

  })
})

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
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