const emailCfg = {
    getMailData: (expiration, type, value, from, to, collection) => {
        const mailData = {...emailCfg.mailData}; 

        if (type == "Invitation" || type == "Rejection") {
            mailData.subject = invitationSubject;

            mailData.subject = mailData.subject.replace(
                "###---COLLECTION---###",
                collection
            );
        }

        if (type == "Rejection") {
            mailData.text = rejectionText;
            mailData.html = rejectionHtml;

            mailData.text = mailData.text.replace(
                "###---COLLECTION---###",
                collection
            );
            mailData.html = mailData.html.replace(
                "###---COLLECTION---###",
                collection
            );
        }

        if (type == "Invitation") {
            mailData.text = invitationText;
            mailData.html = invitationHtml;
            type = "Link"
        }

        mailData.text = mailData.text.replace(
            "###---EXPIRATION---###",
            expiration
        );
        mailData.text = mailData.text.replace(
            "###---TYPE---###",
            type
        );
        mailData.text = mailData.text.replace(
            "###---VALUE---###",
            value
        );
        mailData.html = mailData.html.replace(
            "###---EXPIRATION---###",
            expiration
        );
        mailData.html = mailData.html.replace(
            "###---TYPE---###",
            type
        );

        mailData.html = mailData.html.replace(
            "###---VALUE---###",
            type == "Link" ? `<a href="${value}">${value}</a>` : value
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
        subject: "Docman Validation Resource", // Docman
        text: "Hey there!\nThis validation resource expires in ###---EXPIRATION---###: \n\
            \t\t###---TYPE---###: ###---VALUE---###\n\
            Best regards.",
        html: '<div style="padding: 3rem; font-size: 1.5em">\
                <b >Hey there! </b>\
                <p> This validation resource expires in ###---EXPIRATION---###:<p/>\
                <p style="padding-left: 6rem">###---TYPE---###: <span style="font-size: 2em; color: blue">###---VALUE---###</span></p>\
                <p style="margin-top: 2rem">Best regards.</p>\
            </div>',
    },
};
const invitationSubject = "Docman. \"###---COLLECTION---###\" collection invitation";
const invitationText = "Hey there!\nThis invite resource link expires in ###---EXPIRATION---###: \n\
    \t\t###---TYPE---###: ###---VALUE---###\n\
    Best regards.";
const invitationHtml = '<div style="padding: 3rem; font-size: 1.5em">\
    <b >Hey there! </b>\
    <p> This invite resource link expires in ###---EXPIRATION---###:<p/>\
    <p style="padding-left: 6rem">###---TYPE---###: <span style="font-size: 2em; color: blue">###---VALUE---###</span></p>\
    <p style="margin-top: 2rem">Best regards.</p>\
    </div>';
const rejectionText = "Hello.\nThe invitation for the \"###---COLLECTION---###\" collection has been cancelled. \
    Please apologize for the inconvenience.\nBest regards."
const rejectionHtml = '<div style="padding: 3rem; font-size: 1.5em">\
    <b >Hello. </b>\
    <p> The invitation for the \"###---COLLECTION---###\" collection has been cancelled. \
    Please apologize for the inconvenience.<p/>\
    <p style="margin-top: 2rem">Best regards.</p>\
    </div>';

export default emailCfg;