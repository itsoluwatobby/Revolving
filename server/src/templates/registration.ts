import { ConfirmationMethodType } from "../../types.js"


type OptionsType = 'account' | 'password'

/**
 * @description email template
 * @param receiver name
 * @param username sender name
 * @param verificationLink 
 * @param option mail type (account | password)
 * @param  type (LINK | OTP)
 * @returns 
 */
export const mailOptions = (receiver: string, username: string, verificationLink: string, option: OptionsType = 'account', type: ConfirmationMethodType='LINK') => {
  const messageHeader = `${type == 'OTP' ? 'Action Required: One Time Activation Code' : `Tap the Link below To ${option == 'account' ?  'Activate Your Account' : 'Reset Your Password'}`}`
  const year = new Date().getFullYear()
  return {
    to: receiver,
    from: process.env.REVOLVING_MAIL,
    subject: `ACCOUNT CONFIRMATION FOR ${username}`,
    html: `<div style='background-color: rgba(0,0,0,0.9); color: white; border-radius: 5px; border: 2px dashed gray; box-shadow: 2px 4px 16px rgba(0,0,0,0.4);'>
            <div style="padding: 2px 10px 5px 10px;">
                <h2 style='text-shadow: 2px 2px 10px rgba(0,0,0,0.1); text-align: center;'>REVOLVING IS ALL ABOUT YOU</h2>
                <h3 style='text-decoration: underline; text-shadow: 2px 2px 10px rgba(0,0,0,0.3);'>${messageHeader}</h3>
                    <p>${type === 'LINK' ? 'Link expires in 30 minutes, please confirm now!!' : 'OTP expires in 30 minutes'}</p>
                      ${
                        type === 'LINK' ?
                        `<a href=${verificationLink} target=_blank style='text-decoration:none;'>
                          <button style='padding:1rem; padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: blue; border:none; color: white; border-radius:10px; font-size: 18px'>
                              ${option == 'account' ? 'Account Verification' : 'Reset Password'}
                          </button>
                        </a>`
                      :
                      `<h1>${verificationLink}</h1>`
                      }
                      ${
                        type === 'LINK' ?
                          `<p>Or copy the link below to your browser</p>
                          <p style='word-break: break-all;'>${verificationLink}</p><br/>
                          <span>Keep link private, it contains some sensitive information about you.</span>`
                        : ''
                      }
              </div>
                <footer style="background-color: rgba(0,0,0,0.8); padding: 2px; text-align: center; color: black;">Copyright &copy; ${year}</footer>
          </div>
          `
  }
}