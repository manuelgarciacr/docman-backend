import { Collection } from "../models/index.js";
import { mongoose } from "mongoose";

const collectionCtrl = {};
const db = mongoose.connection;

collectionCtrl.collectionExists = async (req, res, next) => {
    try {
        const name = req.query.name;
        const count = await Collection.countDocuments({
            "name": name,
        }).exec();
        res.json({ status: 200, message: count > 0, data: [] })
    } catch (err) {
        return next(err);
    }
};

collectionCtrl.actualizeUsers = async (req, res, next) => {
    await db
        .transaction(async session => {
console.log("ACTUALIZE USERS", req.body)
            const actualizations = req.body.usersActualization ?? [];

            actualizations.forEach(element => {
                const email = element.email;
                const action = element.action;
                // TODO: SEND EMAIL AND CONFIRM 
            });
            res.json({
                status: 200,
                message: "Ok",
                data: [],
            });
        })
        .catch(err => console.log("ACTUALIZE USERS ERROR", err));
};

export { collectionCtrl };
