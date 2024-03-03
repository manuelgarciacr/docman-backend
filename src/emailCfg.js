//module.exports = {
const emailCfg = {
    getMailData: (type, value, from, to) => {
        const mailData = {...emailCfg.mailData}; 

        mailData.text = mailData.text.replace(
            "###---TYPE---###",
            type
        );
        mailData.text = mailData.text.replace(
            "###---VALUE---###",
            value
        );
        mailData.html = mailData.html.replace(
            "###---TYPE---###",
            type
        );
        mailData.html = mailData.html.replace(
            "###---VALUE---###",
            value
        );
        
        if (type == "Code")
            mailData.subject = value + " " + mailData.subject;

        mailData.from = from;
        mailData.to = to;

        return mailData
    },
    mailData: {
        // from: 'undisclosedaddress@gmail.com',  // IONOS
        from: "", // Curl and Gmail
        to: "", // list of receivers
        // subject: 'Shopping Register Validation Code', // Shopping
        subject: "Docman Register Validation Resource", // Docman
        text: "Hey there!\nThis validation resource expires in ten minutes: \n\
            \t\t###---TYPE---###: ###---VALUE---###\n\
            Best regards",
        html: '<div style="padding: 3rem; font-size: 1.5em">\
                <b >Hey there! </b>\
                <p> This validation resource expires in ten minutes:<p/>\
                <p style="padding-left: 6rem">###---TYPE---###: <span style="font-size: 2em; color: blue">###---VALUE---###</span></p>\
                <p style="margin-top: 2rem">Best regards</p>\
            </div>',
    },
};
export default emailCfg;