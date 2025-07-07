import nodemailer from "nodemailer"
import { Newsletter_template } from "./emailtemplate.js"

const emailUser = process.env.EMAIL_USER || "bandraladitya32@gmail.com"
const emailUserPassword = process.env.EMAIL_USER_PASSWORD || "cwsy rodc jsly uvub"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailUserPassword,
  },
  tls: {
    rejectUnauthorized: false
  }
})

export const sendEmail = async (email, data) => {
  try {
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    const info = await transporter.sendMail({
      from: `"FinEd" <${emailUser}>`,
      to: email,
      subject: `Your ${monthName} Newsletter is Here! 🎉`,
      text: `Your ${monthName} Newsletter is Here! 🎉`,
      html: Newsletter_template.replace("{{title}}", data.title).replace("{{content}}", data.content)
    });
  } catch (error) {
    console.log(error);
  }
}