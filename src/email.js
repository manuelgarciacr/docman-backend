const nodemailer = require('nodemailer'); // Send emails

////////// emails (gmail)
////
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createGmailTransporter = async () => {
         
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject("Error getting access token. " + err);
            }
            resolve(token);
        })
    }).catch(err => console.error(err));

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            grant_type: 'refresh_token'
        }
    });
};
////
////////// emails (gmail)

////////// emails (IONOS)
////
const createIonosTransporter = () =>
    nodemailer.createTransport({
        host: "smtp.ionos.es",
        port: 587,
        auth: {
            user: "english@manuelgc.eu",
            pass: process.env.EMAIL_PWD
        }
    });
////
////////// emails (IONOS)

let createTransporter = (env === 'production') 
    ? createIonosTransporter
    : createGmailTransporter;

const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    return emailTransporter.sendMail(emailOptions)
};

exports.sendCode = (email, code) => {
    const mailData = { ...config.mailData, to: email, html: config.mailData.html + code + '</p>' };
    mailData.subject = code + " " + mailData.subject;
    return sendEmail(mailData)
    .then(msg => code);
}
