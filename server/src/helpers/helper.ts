import { sub } from 'date-fns';
import jwt from 'jsonwebtoken'
import { ClaimProps, USERROLES } from '../../types.js';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export const dateTime = sub(new Date, { minutes: 0 }).toISOString();

export const signToken = async(claim: ClaimProps, expires: string, secret: string) => {
    const token = jwt.sign(
      {
        "userInfo": {
          roles: claim?.roles, email: claim?.email
        }
      },
      secret,
      { expiresIn: expires },
    )
  return token
}

export const verifyToken = async(token: string, secret: string): Promise<string | ClaimProps> => {
  let response: string | ClaimProps;  
  jwt.verify(
      token,
      secret,
      (err: {name: string}, decoded: {userInfo: { email: string, roles: USERROLES[]}}) => {
        if(err?.name == 'TokenExpiredError') response = 'Expired Token'
        else if(err?.name == 'JsonWebTokenError') response = 'Bad Token'
        else{
          response = {
            roles: decoded?.userInfo?.roles,
            email: decoded?.userInfo?.email
          } as ClaimProps
        }
      }
    )
  return response;
}

export const transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: process.env.REVOLVING_MAIL,
    pass: process.env.REVOLVING_PASS,
  }
})


export const mailOptions = (receiver: string, username: string, verificationLink: string) => {
  return {
    to: receiver,
    from: process.env.REVOLVING_MAIL,
    subject: `ACCOUNT CONFIRMATION FOR ${username}`,
    html: `<h2>Tap the Link below To Activate Your Account</h2><br/>
                <p>Link expires in 30 minutes, please confirm now!!</p>
                <a href=${verificationLink} target=_blank style='text-decoration:none;'>
                   <button style='padding:1rem; padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: teal; border:none; border-radius:10px; font-size: 18px'>
                      Account Verification
                   </button>
                </a>
                <p>Or copy the link below to your browser</p>
                <p>${verificationLink}</p><br/>
                <span>Please keep link private, it contains some sensitive information about you.</span>`
  }
}
