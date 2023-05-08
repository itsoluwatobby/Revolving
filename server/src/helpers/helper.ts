import { sub } from 'date-fns';
import { JwtPayload, VerifyOptions, VerifyErrors, sign, verify } from 'jsonwebtoken'
import { ClaimProps } from '../../types.js';

export const dateTime = sub(new Date, { minutes: 0 }).toISOString();

export const signToken = async(claim: ClaimProps, expires: string, secret: string) => {
    const token = sign(
      {
        "userInfo": {
          username: claim?.username, email: claim?.email
        }
      },
      secret,
      { algorithm: 'RS512', expiresIn: expires },
    )
  return token
}

export const verifyToken = async(token: string, secret: string) => {
  let response: string | object;  
  verify(
      token,
      secret,
      (err: VerifyErrors | null, decoded: ClaimProps) => {
        if(err?.name == 'TokenExpiredError') response = 'Expired Token'
        else if(err?.name == 'JsonWebTokenError') response = 'Bad Token'
        else{
          response = {
            username: decoded?.username,
            email: decoded?.email
          } as ClaimProps
        }
      }
    )
  return response;
}


export const mailOptions = (receiver: string, sender: string, subject: string) => {
  return {
    to: receiver,
    from: sender,
    subject,
    html: ``
  }
}

