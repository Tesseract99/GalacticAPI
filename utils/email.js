const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a4ee14af2da1bd",
    pass: "85780ce0ddf2fc",
  },
});

// const info = transporter.sendMail({
//   from: `${mailDetails.senderName} <${mailDetails.senderEmail}>`, // sender address
//   to: `${mailDetails.receiverMailList}`, // list of receivers
//   subject: `${mailDetails.subject}`, // Subject line
//   text: `${mailDetails.body}`, // plain text body
//   // html: "<b>Hello world?</b>", // html body
// });

const mailSenderFn = async (mailDetails) =>
  await transporter.sendMail({
    from: `${mailDetails.senderName} <${mailDetails.senderEmail}>`, // sender address
    to: `${mailDetails.receiverMailList}`, // list of receivers
    subject: `${mailDetails.subject}`, // Subject line
    text: `${mailDetails.body}`, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

module.exports = mailSenderFn;
