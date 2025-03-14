import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth : {
            user : process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASSWORD
        }
    });
    const options = {
        from : process.env.SMTP_MAIL,
        to : email,
        subject : subject,
        text : message,
    }
    await transporter.sendMail(options);
}