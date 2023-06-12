import { AuthType } from "../../data";
import { apiSlice } from "./apiSlice";

type NewUser = {
  username: string,
  email: string,
  password: string,
  resetPass?: string
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    signUp: builder.mutation<string | null, NewUser>({
      query: newUser => ({
        url: 'auth/registration',
        method: 'POST',
        body: {...newUser}
      })
    }),
    signIn: builder.mutation<{data: AuthType}, Pick<NewUser, 'email' | 'password'>>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    forgotPassword: builder.mutation<AuthType, Pick<NewUser, 'email'>>({
      query: (email) => ({
        url: `auth/forgot_password?email=${email}`,
        method: 'POST',
        body: null
      })
    }),
    newPassword: builder.mutation<AuthType, Pick<NewUser, 'email' | 'resetPass'>>({
      query: credentials => ({
        url: 'auth/new_password',
        method: 'POST',
        body: credentials
      })
    }),
    verify_account: builder.mutation<null, null>({
      query: () => 'auth/verify_account'
    }),
    signOut: builder.query({
      query: () => 'auth/logout'
    }),
    newAccessToken: builder.query<AuthType, void>({
      query: () => '/auth/new_access_token'
    }),
  })
})

export const {
  useSignUpMutation,
  useSignInMutation,
  useVerify_accountMutation, // not in use on client side
  useSignOutQuery,
  useForgotPasswordMutation,
  useNewPasswordMutation,
  useNewAccessTokenQuery
} = authApiSlice
