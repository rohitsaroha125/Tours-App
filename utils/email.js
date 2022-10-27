const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: '975fcf95482264',
      pass: 'a7d5194d56b339',
    },
  })
  // define email options
  const mailOptions = {
    from: 'Demo email<demo@email.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // send mail with nodemailer
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
