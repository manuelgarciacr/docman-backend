import nodemailer from 'nodemailer'; // Send emails
import * as google from "googleapis";
import emailCfg from "./emailCfg.js";

////////// emails (gmail)
////

//const { google } = require("googleapis");

//const OAuth2 = google.auth.OAuth2;
const OAuth2 = google.Auth.OAuth2
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
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
        },
    });
////
////////// emails (IONOS)

////////// emails (Curl)
////
const createCurlTransporter = () =>
    nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
        },
        // tls: {
        //     ciphers: "SSLv3",
        // }
    });
////
////////// emails (Curl)

const env = process.env.NODE_ENV || "development";

let createTransporter = (env === 'production') 
    ? createIonosTransporter
    : createCurlTransporter;
    //: createGmailTransporter;

const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    return emailTransporter.sendMail(emailOptions)
};

const sendResource = (from, to, type, value) => {
    const mailData = emailCfg.getMailData(type, value, from, to);

    return sendEmail(mailData).then(msg => console.log(msg));
};

export { sendResource }