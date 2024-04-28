import { Collection, User } from "../models/index.js";
import { mongoose } from "mongoose";
import crypto from "crypto";
import { Invitation } from "../models/Invitation.js";
import { sendResource } from "../email.js";

const collectionCtrl = {};
const db = mongoose.connection;

collectionCtrl.collectionExists = async (req, res, next) => {
    try {
        const name = req.query.name;
        const count = await Collection.countDocuments({
            name,
        }).exec();
        res.json({ status: 200, message: count > 0, data: [] })
    } catch (err) {
        return next(err);
    }
};

collectionCtrl.actualization = async (req, res, next) => {
    await db
        .transaction(async session => {
            const actualization = req.body.actualization ?? {};
            const collectionId = req.params.id;
            const {stayLoggedIn, twoFactor, users = []} = actualization;
            const update = {
                ...typeof stayLoggedIn == "boolean" && {stayLoggedIn},
                ...typeof twoFactor == "boolean" && {twoFactor}
            };
            // new -> returns modified document
            const collection = await Collection.findByIdAndUpdate(collectionId,
                update, {new: true, session});

            for (const element of users) {
                const email = element.email;
                const name = element.name;
                const action = element.action;
                const userId = element.userId == "" ? undefined : element.userId;

                if (action == "NEW") {
                    const UUID = crypto.randomUUID();
                    const expiration = parseInt(
                        process.env.INVITATION_EXPIRATION
                    );
                    const invitation = new Invitation({
                        userId,
                        collectionId,
                        email,
                        name,
                        UUID
                    });
                    invitation.setExpiration(expiration);
                    await invitation.save({ session })

                    console.log("UUID:" , UUID)

                    await sendResource(
                        "2 days", // Expiration
                        process.env.EMAIL_USER, // From
                        email, // To
                        "Invitation", // Type
                        process.env.REDIRECT + UUID, // Value
                        collection.name // Collection
                    );
                }
                if (action == "REJECTED") {
                    await Invitation.findOneAndDelete({collectionId, email}, {session})

                    await sendResource(
                        "", // Expiration
                        process.env.EMAIL_USER, // From
                        email, // To
                        "Rejection", // Type
                        "", // Value
                        collection.name // Collection
                    );
                }
            };
            res.json({
                status: 200,
                message: "Ok",
                data: [collection],
            });
        })
        .catch(err => console.log("ACTUALIZE USERS ERROR", next(err)));
};

collectionCtrl.getUsers = async (req, res, next) => {
    try { 
        const collectionId = req.params.id;
        const collection = await Collection.findById(collectionId);
        const roles = collection.roles;
        const data = [];

        for (const [idx, userId] of collection.users.entries()) {
            const user = await User.findById(userId);
            const email = user.email;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const name = `${firstName} ${lastName}`;
            const action = roles[idx] == "owner" ? "OWNER" : "";
            const userData = { email, name, userId, action };

            if (action == "OWNER") data.unshift(userData);
                else data.push(userData);
        }

        const invitations = await Invitation.find({collectionId});
        invitations.forEach(invitation => {
            const email = invitation.email;
            const name = invitation.name;
            const userId = invitation.userId ?? "";
            const action = "INVITED";

            data.push({email, name, userId, action})
        })
        res.json({
            status: 200,
            message: "Ok",
            data,
        });
    } catch(err) {
        console.log("GET COLLECTION USERS ERROR", err);
        next(err)
    };
};

export { collectionCtrl };
