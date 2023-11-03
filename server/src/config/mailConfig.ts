import dotenv from 'dotenv'
import { Response } from 'express'
import { EmailResponse } from '../../types.js';
import { responseType } from '../helpers/helper.js';
import { Transporter, createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

dotenv.config()

export const transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
  service: 'gmail',
  host: process.env.NODE_ENV === 'development' ? 'smtp.gmail.com' : 'smtp.vercel.app',
  port: 587,
  secure: true,
  auth: {
    user: process.env.REVOLVING_MAIL,
    pass: process.env.REVOLVING_PASS,
  }
})

type MsgType = 'one' | 'two' | 'three' | 'four'

export const sendMailMessage = async(res: Response, options: EmailResponse, msg: MsgType='one') => {
  const messages = {
    'one': 'Please check your email to activate your account',
    'two': 'Please check your email, OTP sent',
    'three': 'Please check your email',
    'four': 'Mail sent successfully'
  }
  transporter.sendMail(options, (err) => {
    if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
    else return responseType({res, status: 201, message: messages[msg]})
  })
}