import { User, Collection, Registration } from "../../models/index.js";
import mongoose from "mongoose"
import { getRandomInt } from "../../random.js";
import { setToken, validateToken } from "../../tokens.js";
import { newTokens, finishingValidation } from "./account.controller.js";
import { sendResource } from "../../email.js";

const accountCtrl = {};
const db = mongoose.connection;
const fn_pad = n => String(n).padStart(5, "0");

accountCtrl.forgotPassword = async (req, res, next) => {
    const ERROR = { status: 404, message: "Invalid email or collection", data: [] };
    
    await db
        .transaction(async session => {
            const email = req.body.user.email;
            const name = req.body.collection.name;
            const user = await User.findOne({ email });
            const collection = await Collection.findOne({ name });
            const userId = user._id;
            const users = collection?.users ?? [];

            if (!users.includes(userId)) throw ERROR;
            if (!user.enabled || !collection.enabled) throw ERROR;

            const collectionId = collection._id;
            const registered = await Registration.findOne({
                userId,
                collectionId,
            });

            if (registered != null) {
                const iat = registered.expireAt.getTime();
                const now = Date.now();
                    
                if (iat <= now)
                    await registered.deleteOne({ session });
                else {
                    res.json({
                        status: 200,
                        message: "Ok",
                        data: [],
                    });
                    return;
                }
            }

            const code = fn_pad(getRandomInt(1, 99999));
            const registration = new Registration({
                userId,
                collectionId,
                code,
            });
            const expiration = parseInt(process.env.VALIDATION_EXPIRATION);

            registration.setExpiration(expiration);

            await registration.save({ session });

            console.log("code:", code);
            
            await sendResource(
                process.env.EMAIL_USER, // From
                user.email, // To
                "Code", // Type
                code, // Value
            );

            const context = registration._id.toHexString();

            await setToken("forpwdvalctx", res, context, expiration);

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            res.json({ status: 200, message: "Ok", data: [] });
        })
        .catch(err => {
            console.error(err);
            next(err);
        });
};

accountCtrl.forgotPasswordValidation = async (req, res, next) => {
    await db
        .transaction(async session => {
            // Validate token, code and password

            const forgotPasswordToken = req.headers.authorization;
            const code = req.header("X-Code");
            const pwd = req.header("X-Pwd");

            if (typeof forgotPasswordToken != "string")
                throw "token:Validation error";
            if (typeof code != "string") throw "code:Validation error";
            if (typeof pwd != "string") throw "pwd:Validation error";

            const decoded = await validateToken(
                forgotPasswordToken,
                "forpwdvalctx",
                req.signedCookies
            );

            // Validate the code received

            const context = decoded.context;
            const id = mongoose.Types.ObjectId.createFromHexString(context);
            const registration = await Registration.findByIdAndDelete(id, {
                session,
            });

            if (registration.code != code)
                throw { status: 601, message: "Invalid code" };

            // Validate password TODO: validate pwd construction

            if (pwd == "") throw { status: 601, message: "Invalid password" };

            // Changing user password

            const userId = registration.userId;
            const user = await User.findById(userId);

            user.password = pwd;
            await user.hashPassword();
            await user.save({ session });

            const collectionId = registration.collectionId;
            const collection = await Collection.findById(collectionId);
            const stayLoggedIn = collection.stayLoggedIn;

            await newTokens(userId, collectionId, stayLoggedIn, res);

            const cookieName = decoded.cookieName;

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            finishingValidation(cookieName, res, user, collection);
        })
        .catch(err => {
            console.error(err);
            next(err);
        });
};

export { accountCtrl };
