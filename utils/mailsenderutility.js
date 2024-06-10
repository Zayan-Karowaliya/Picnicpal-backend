import nodemailer from 'nodemailer'

export const mailSender = async (email, title, body) => {
    try {
      // Create a Transporter to send emails
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
          user: "bscs2012370@szabist.pk",
          pass: "gbmyzwowedaxjbgq",
        }
      });
  
      // Send emails to users
      let info = await transporter.sendMail({
        from: 'bscs2012370@szabist.pk',
        to: email,
        subject: title,
        html: body,
      });
      console.log("Email info: ", info);
      return info;
    } catch (error) {
      console.log(error.message);
    }
  };