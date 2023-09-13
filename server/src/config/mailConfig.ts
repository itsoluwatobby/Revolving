import { Transporter, createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export const transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: process.env.REVOLVING_MAIL,
    pass: process.env.REVOLVING_PASS,
  }
})