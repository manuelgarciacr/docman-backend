import { User, Collection, Registration, Token } from "../models/index.js";
import mongoose from "mongoose"
import { sendResource } from "../email.js";
import crypto from "crypto";
import { getRandomInt } from "../random.js";
import { passport, getOwnerToken, getRefreshToken, renewAccessToken, validateOwnerToken } from "../tokens.js";
import { checkSchema, validationResult } from "express-validator";
import { ownerSignupSchema } from "./validationSchemas.js";

const accountCtrl = {};
const db = mongoose.connection;
const fn_pad = n => String(n).padStart(5, "0");

// accountCtrl.ownerSignupValidation = [
//     (req, res, next) => {
//         console.log("EMAIL1", req.body.user.email);
//         next()
//     },
//     checkSchema(ownerSignupSchema),
//     (req, res, next) => {
//         const result = validationResult(req);
        
//         if (result.isEmpty()) {
//             next();
//             return
//         }

//         const errArray = result.array().map(err => err.msg);
//         const message = errArray.join(' ');
//         const error = {status: 400, message , data: []}

//         next(error);
//     },
// ];

accountCtrl.ownerSignup = async (req, res, next) => {
    await db
        .transaction(async session => {
            const user = new User(req.body.user);
            const collection = new Collection(req.body.collection);
            const stayLoggedIn = req.body.stayLoggedIn;
            const code = fn_pad(getRandomInt(1, 99999));
            const registration = new Registration({
                userId: user._id,
                collectionId: collection._id,
                stayLoggedIn,
                code: code
            });

            await user.hashPassword();

            collection.users.push(user._id);
            collection.roles.push("owner");

            await user.save({ session });
            await collection.save({ session });
            await registration.save({ session })

            console.log("code:" , code)
            /* sendResource(
                process.env.EMAIL_USER,
                user.email,
                "Code",
                code,
                //process.env.REDIRECT + user.UUID
            ); */

            const userContext = registration._id.toHexString();
            const ownerToken = await getOwnerToken(userContext);
            const expiration = process.env.VALIDATION_EXPIRATION;
console.log("MA", expiration, userContext)
            res.cookie("__Host-valctectx", userContext, {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                signed: true,
                //domain: "localhost",
                maxAge: expiration * 1000, // Thousandths of a second
            });
// console.log("OWNERTOKEN", ownerToken)

            //res.set("Authorization", `Bearer ${ownerToken}`);
            // res.set("access-control-expose-headers", "Authorization");

            // Throw an error to abort the transaction
            // throw new Error("Oops!");
            res.json({ status: 200, message: "Ok", data: [ownerToken] });
        })
        .catch(err => next(err));
};

accountCtrl.ownerValidation = async (req, res, next) => {
    await db
        .transaction(async session => {
            const valctectx = req.signedCookies["__Host-valctectx"];
            const ownerToken = req.headers.authorization;
            const code = req.headers.code;

            if (typeof valctectx != "string" || typeof ownerToken != "string"
                || typeof code != "string")
                throw "Validation error";

            await validateOwnerToken(ownerToken, valctectx);

            const id = mongoose.Types.ObjectId.createFromHexString(valctectx)
            const registration = await Registration.findByIdAndDelete(id, {session});

            if (registration.code != code)
                throw {status: 601, message: "Invalid code"}

            const stayLoggedIn = registration.stayLoggedIn;
            const userId = registration.userId;
            const collectionId = registration.collectionId;
            const collection = await Collection.findByIdAndUpdate(
                collectionId,
                {
                    enabled: true,
                    $unset: { expireAt: "" },
                },
                { session }
            );
            
            const tokens = await getRefreshToken(userId, collection, stayLoggedIn);
            const refreshToken = tokens.refreshToken;
            const accessToken = tokens.accessToken;
            const userContext = tokens.userContext;
            const accessExpiration = process.env.ACCESS_EXPIRATION;

            const loggingExpiration = stayLoggedIn
                ? process.env.REFRESH_LONG_EXPIRATION
                : process.env.REFRESH_SHORT_EXPIRATION;

            const refreshId = tokens.refreshId;
            const dbToken = new Token({
                _id: refreshId,
                userId,
                collectionId,
                type: "refresh"
            })

            dbToken.setMaxAge(loggingExpiration);

            await dbToken.save({ session });
            await User.findByIdAndUpdate(
                userId,
                {
                    enabled: true,
                    $unset: { expireAt: "" },
                },
                { session }
            );

            res.cookie("__Host-ctectx", userContext, {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                signed: true,
                //domain: "localhost",
                maxAge: accessExpiration * 1000, // Thousandths of a second
            });
            
            // Throw an error to abort the transaction
            // throw new Error("Oops!");
            res.json({ status: 200, message: "Ok", data: [refreshToken, accessToken] });
        })
        .catch(err => next(err));
};
// accountCtrl.signup = async (req, res, next) => {
 
//     await db.transaction(
//         async session => {
//             const user = new User(req.body.user);
//             const collection = new Collection(req.body.collection);
//             const hash = await user.hashPassword();
//             const code = getRandomInt(1, 99999);
//             const fn_pad = n => String(code).padStart(5, "0");

//             user.password = hash;
//             user.UUID = crypto.randomUUID();
//             user.code = fn_pad(code);
                
//             collection.users.push(user._id);
//             collection.roles.push("owner");

//             await user.save({ session });
//             await collection.save({ session });
            
//             sendCode(
//                 user.email,
//                 user.code,
//                 process.env.EMAIL_USER,
//                 process.env.REDIRECT + user.UUID
//             );
 
//             // Throw an error to abort the transaction
//             throw new Error("Oops!");
//             res.json({ status: 200, message: "Ok", data: [] });
//         }
//     )
//     .catch( err => next(err))    
// };

accountCtrl.login = async (req, res, next) => {
    const EMAIL = req.body.user.email;
    const PASSWORD = req.body.user.password;
    const NAME = req.body.collection.name;
    const ERROR = {status: 404, message: "Invalid login data", data: []}
    try {
        const user = await User.findOne({ email: EMAIL });
        const collection = await Collection.findOne({ name: NAME });
        const users = collection?.users ?? [];

        if (!users.includes(user?._id))
            throw ERROR;

        if (!await user.checkPassword(PASSWORD))
            throw ERROR;

        user.password = "";

        res.json({ status: 200, message: "Ok", data: [user, collection] });

    } catch (err) {
        console.error("CATCH IN LOGIN", err);
        next(err);
    }    
};

accountCtrl.validate = async (req, res, next) => {
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

// accountCtrl.cleanDB = async (req, res, next) => {
//     await db
//         .transaction(async session => {
//             const users = await User.find({
//                 enabled: false,
//                 UUID: { $ne: "" },
//             });
//             console.log(users)
//             for (const user of users) {
//                 console.log("USER", user)
//                 const collections = await Collection.find({
//                     "users._id": user._id,
//                 });
//                 for (const coll of collections) {
//                     if (coll.users == [user._id])
//                         console.log("COLL1", coll);
//                     if (coll.users.length() == 1 && coll.users[0] == user._id)
//                         console.log("COLL2", coll)
//                 }
//             }
//         })
//         .catch(err => next(err));
// };


accountCtrl.logout = (req, res) => {
    res.send("logout");
}

export { accountCtrl };
