const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendResetEmail(to, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset.</p>
               <p>Click <a href="${link}">here</a> to reset your password.</p>
               <p>This link will expire in 15 minutes.</p>`
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
