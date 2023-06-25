import { AuthType, UserProps } from "../../data";
import { apiSlice } from "./apiSlice";

type NewUser = {
  username: string,
  email: string,
  password: string,
  resetPass?: string
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    signUp: builder.mutation<string | null, Partial<NewUser>>({
      query: newUser => ({
        url: 'auth/registration',
        method: 'POST',
        body: {...newUser}
      }) as any
    }),
    signIn: builder.mutation<{data: AuthType}, Pick<NewUser, 'email' | 'password'>>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials
      }) as any
    }),
    forgotPassword: builder.mutation<AuthType, string>({
      query: email => ({
        url: `auth/forgot_password?email=${email}`,
        method: 'POST',
        body: JSON.stringify({email})
      }) as any
    }),
    newPassword: builder.mutation<AuthType, Pick<NewUser, 'email' | 'resetPass'>>({
      query: credentials => ({
        url: 'auth/new_password',
        method: 'POST',
        body: credentials
      }) as any
    }),
    verify_account: builder.mutation<null, null>({
      query: () => 'auth/verify_account',
    }),
    signOut: builder.mutation<void, string>({
      query: (userId) => ({
        url: `auth/logout/${userId}`,
        method: 'POST',
        body: userId
      }) as any
    }),
    newAccessToken: builder.query<AuthType, void>({
      query: () => '/auth/new_access_token',
    }),
    toggleRoleByAdmin: builder.mutation<UserProps, {adminId: string, userId: string}>({
      query: ({adminId, userId}) => ({
        url: `auth/toggle_role/${adminId}/${userId}`,
        method: 'PATCH',
        body: adminId
      }) as any
    })
  })
})

export const {
  useSignUpMutation,
  useSignInMutation,
  useVerify_accountMutation, // not in use on client side
  useSignOutMutation,
  useForgotPasswordMutation,
  useNewPasswordMutation,
  useNewAccessTokenQuery,
  useToggleRoleByAdminMutation
} = authApiSlice
