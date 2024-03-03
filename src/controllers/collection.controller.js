import { Collection } from "../models/index.js";

const collectionCtrl = {};

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

export { collectionCtrl };
