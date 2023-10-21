import { apiSlice } from "./apiSlice";
import { 
  AuthType, ConfirmType, ConfirmationMethodType, DataType, OTPPURPOSE, OptionType, 
  RefreshType, UserDataType, UserProps 
} from "../../types/data";

type NewUser = {
  username: string,
  email: string,
  password: string,
  resetPass?: string,
  type: ConfirmationMethodType
}

type OTPConfirmType = {
  meta: {
    status: number,
    message: string,
  }
  data?: UserDataType
}

type OTPResponseType = {
  meta: {
    status: number,
    message: string,
  }
  data?: DataType
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    signUp: builder.mutation<string | null, Partial<NewUser>>({
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

    forgotPassword: builder.mutation<Omit<AuthType, 'updatedAt'>, {email: string, type?: ConfirmationMethodType}>({
      query: ({email, type='LINK'}) => ({
        url: `auth/forgot_password?email=${email}&type=${type}`,
        method: 'POST',
        body: JSON.stringify({email})
      })
    }),

    newPassword: builder.mutation<Omit<AuthType, 'updatedAt'>, Pick<NewUser, 'email' | 'resetPass'>>({
      query: credentials => ({
        url: 'auth/new_password',
        method: 'POST',
        body: credentials
      })
    }),

    verify_account: builder.mutation<null, null>({
      query: () => 'auth/verify_account',
    }),

    signOut: builder.mutation<void, string>({
      query: (userId) => ({
        url: `auth/logout/${userId}`,
        method: 'POST',
        body: userId
      })
    }),

    newAccessToken: builder.mutation<RefreshType, void>({
      query: () => '/auth/new_access_token',
    }),

    toggleRoleByAdmin: builder.mutation<UserProps, {adminId: string, userId: string}>({
      query: ({adminId, userId}) => ({
        url: `auth/toggle_role/${adminId}/${userId}`,
        method: 'PATCH',
        body: adminId
      })
    }),

    confirmOTP: builder.mutation<OTPConfirmType, {email: string, otp: string, purpose?: OTPPURPOSE}>({
      query: ({email, otp, purpose='ACCOUNT'}) => ({
        url: `auth/otp_verification`,
        method: 'POST',
        body: {email, otp, purpose}
      })
    }),

    generateOTP: builder.mutation<OTPResponseType, {email: string, length?: number, option: OptionType, purpose: Exclude<OTPPURPOSE, 'OTHERS'>}>({
      query: ({email, length, option, purpose}) => ({
        url: `auth/otp_generator`,
        method: 'POST',
        body: {email, length, option, purpose}
      })
    }),

    confirmPassword: builder.mutation<ConfirmType, {password: string, email: string}>({
      query: ({email, password}) => ({
        url: `auth/confirm_password`,
        method: 'POST',
        body: {email, password}
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

  })
})

export const {
  useToggleRoleByAdminMutation,
  useConfirmPasswordMutation,
  useVerify_accountMutation, // not in use on client side
  useForgotPasswordMutation,
  useNewAccessTokenMutation,
  useGenerateOTPMutation,
  useNewPasswordMutation,
  useConfirmOTPMutation,
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
} = authApiSlice
