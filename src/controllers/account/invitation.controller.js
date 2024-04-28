import { User } from "../../models/index.js";

const accountCtrl = {};

accountCtrl.invitationLink = async (req, res, next) => {
    const LINK = req.path.substr(1);

    try {
        const user = await User.findOne({ UUID: LINK, enabled: false  });
        const URL = process.env.LINK + process.env.LANDING;
        res.redirect(URL);
        if (user != null)
            res.redirect(process.env.REDIRECT)
    } catch (err) {
        console.error("CATCH IN VALIDATION", err);
        next(err);
    }
}

export { accountCtrl };
