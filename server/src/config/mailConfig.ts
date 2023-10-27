import dotenv from 'dotenv'
import { Response } from 'express'
import { responseType } from '../helpers/helper.js';
import { Transporter, createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { EmailResponse } from '../../types.js';

dotenv.config()

export const transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
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
  await new Promise((resolve, reject) => {
    transporter.sendMail(options, (err) => {
      if (err) reject(responseType({res, status: 400, message: 'unable to send mail, please retry'}))
      else resolve(responseType({res, status: 201, message: messages[msg]}))
    })
  })
}