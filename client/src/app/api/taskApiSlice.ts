import { TaskBin, TaskProp } from "../../data";
import { providesTag } from "../../utils/helperFunc";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type TaskArgs = {
  userId: string, taskId?: string, task: Partial<TaskProp>
}

type AdvancedTaskArgs = {
  userId: string, taskIds:  {taskIds: string[]}
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
      invalidatesTags: [{ type: 'TASK', id: 'LIST'}, { type: 'TASKBIN' }]
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
      transformResponse: (baseQueryReturnValue: {data: TaskBin[]}) => {
        return baseQueryReturnValue.data[0]
      }, 
      providesTags: ['TASKBIN']
    }),

    clearTaskBin: builder.mutation<void, string>({
      query: (userId) => ({
        url: `task/bin/${userId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'TASKBIN'}],
    }),
    
    // retore tasks
    restoreTasks: builder.mutation<void, AdvancedTaskArgs>({
      query: ({taskIds, userId}) => ({
        url: `task/restore/${userId}`,
        method: 'POST',
        body: taskIds
      }) as any,
      invalidatesTags: [{ type: 'TASKBIN'}, { type: 'TASK' }]
    }),
    
    // delete tasks permanently
    permanentlyDeleteTasks: builder.mutation<void, AdvancedTaskArgs>({
      query: ({taskIds, userId}) => ({
        url: `task/delete/${userId}`,
        method: 'DELETE',
        body: taskIds
      }) as any,
      invalidatesTags: [{ type: 'TASKBIN'}]
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
  useClearTaskBinMutation,
  useRestoreTasksMutation,
  usePermanentlyDeleteTasksMutation,
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