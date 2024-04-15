import { User, Collection } from "../models/index.js";

const userCtrl = {};

userCtrl.emailExists = async (req, res, next) => {
    try {
        const email = req.query.email;
        const count = await User.countDocuments({
            "email": email,
        }).exec();

        res.json({ status: 200, message: count > 0, data: [] })

    } catch (err) {
        return next(err)
    }
};

userCtrl.userGet = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();

        res.json({ status: 200, message: "", data: [user] });
    } catch (err) {
        return next(err);
    }
};

userCtrl.users = async (req, res, next) => {
    try {
        const query = req.query;
        const data = await User.find(query).exec();
        res.json({ status: 200, message: "", data });
    } catch (err) {
        return next(err);
    }
};

userCtrl.userAdd = async (req, res, next) => {
    res("userAdd")
}

export { userCtrl };
