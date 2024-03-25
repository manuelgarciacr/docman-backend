import { User, Collection, Registration, Token } from "../models/index.js";
import mongoose from "mongoose"
import { sendResource } from "../email.js";
import crypto from "crypto";
import { getRandomInt } from "../random.js";
import { passport, getToken, validateToken, getHash, renewAccessToken } from "../tokens.js";
import { checkSchema, validationResult } from "express-validator";
import { ownerSignupSchema } from "./validationSchemas.js";

const accountCtrl = {};
const db = mongoose.connection;
const fn_pad = n => String(n).padStart(5, "0");
const secureRandom = () => crypto.randomBytes(24).toString("hex");

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
            const code = fn_pad(getRandomInt(1, 99999));
            const registration = new Registration({
                userId: user._id,
                collectionId: collection._id,
                code: code
            });
            const expiration = parseInt(process.env.VALIDATION_EXPIRATION);

            collection.users.push(user._id);
            collection.roles.push("owner");

            user.setExpiration(expiration);
            collection.setExpiration(expiration);
            registration.setExpiration(expiration);

            await user.hashPassword();

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

            const context = registration._id.toHexString();
            const {token: ownerToken, cookieOptions} = await getToken(context, expiration);

            res.cookie("__Host-valctectx", context, cookieOptions);

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            res.json({ status: 200, message: "Ok", data: [ownerToken] });
        })
        .catch(err => next(err));
};

accountCtrl.ownerValidation = async (req, res, next) => {

    await db
        .transaction(async session => {

            // Validate request and token

            const valctectx = req.signedCookies["__Host-valctectx"];
            const ownerToken = req.headers.authorization;
            const code = req.headers.code;

            if (
                typeof valctectx != "string" ||
                typeof ownerToken != "string" ||
                typeof code != "string"
            )
                throw "Validation error";

            await validateToken(ownerToken, valctectx);

            // Validate the code received

            const id = mongoose.Types.ObjectId.createFromHexString(valctectx);
            const registration = await Registration.findByIdAndDelete(id, {
                session,
            });

            if (registration.code != code)
                throw { status: 601, message: "Invalid code" };

            // Enabling collection and removing expiration date

            const collectionId = registration.collectionId;
            const collection = await Collection.findByIdAndUpdate(
                collectionId,
                {
                    enabled: true,
                    $unset: { expireAt: "" },
                },
                { session }
            );
            collection.enabled = true;

            // Enabling user and removing expiration date

            const userId = registration.userId;
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    enabled: true,
                    $unset: { expireAt: "" },
                },
                { session }
            );
            user.enabled = true;

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            newTokens(user, collection, res);
        })
        .catch(err => next(err));
};

accountCtrl.login = async (req, res, next) => {
    const ERROR = { status: 404, message: "Invalid login data", data: [] };

    try {
        const email = req.body.user.email;
        const name = req.body.collection.name;
        const password = req.body.user.password;
        const user = await User.findOne({ email });
        const collection = await Collection.findOne({ name });
        const users = collection?.users ?? [];
console.log(req.httpVersion)
        if (!users.includes(user?._id)) throw ERROR;

        if (!(await user.checkPassword(password))) throw ERROR;

        if (!user.enabled || !collection.enabled) throw ERROR;

        user.password = "";

        // Throw an error to abort the transaction
        // throw new Error("Oops!");

        newTokens(user, collection, stayLoggedIn, res);
    } catch (err) {
        next(err);
    }
};

accountCtrl.logout = async (req, res, next) => {

    await db.transaction(async session => {
        const refreshToken = req.headers.authorization;
        const context = req.signedCookies["__Host-refctx"];

        if (typeof refreshToken != "string" || 
            typeof context != "string")
            throw "Logout error";

        await validateToken(refreshToken, context)
        .then(token => {
            addBlacklist(context, token.iat, token.exp)
        })

    }).catch(message => {
        console.log("LOGOUT ERROR", message)
    }).finally(() => {
        res.json({
            status: 200,
            message: "Ok",
            data: [],
        });
    })
        
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

const newTokens = async (user, collection, res) => {
    // Gets the refresh token and its context cookie

    const userId = user._id;
    const collectionId = collection._id;
    const refreshContext = secureRandom();
    const stayLoggedIn = collection.stayLoggedIn
    const refreshExpirationStr = stayLoggedIn
        ? process.env.REFRESH_LONG_EXPIRATION
        : process.env.REFRESH_SHORT_EXPIRATION;
    const refreshExpiration = parseInt(refreshExpirationStr);
    const { token: refreshToken, cookieOptions: refreshOptions } =
        await getToken(refreshContext, refreshExpiration, {
            sub: userId,
            coll: collectionId,
        });

    res.cookie("__Host-refctx", refreshContext, refreshOptions);

    // Gets the access token and its context cookie

    const accessContext = secureRandom();
    const accessExpirationStr = process.env.ACCESS_EXPIRATION;
    const accessExpiration = parseInt(accessExpirationStr);
    const hash = getHash(refreshContext);
    const { token: accessToken, cookieOptions: accessOptions } = await getToken(
        accessContext,
        accessExpiration,
        {
            sub: userId,
            coll: collectionId,
            hash,
        }
    );

    res.cookie("__Host-ctectx", accessContext, accessOptions);

    // Remove validation cookie

    const { maxAge, ...validationOptions } = accessOptions;

    res.clearCookie("__Host-valctectx", validationOptions);

    // Preparing the data to respond to the request.

    user.password = "";

    const userStr = JSON.stringify(user);
    const collectionStr = JSON.stringify(collection);

    // Throw an error to abort the transaction
    // throw new Error("Oops!");

    res.json({
        status: 200,
        message: "Ok",
        data: [refreshToken, accessToken, userStr, collectionStr],
    });
};

const addBlacklist = (context, iat, exp) => {
    console.log("CTX", context, "IAT", iat, "EXP", exp, "CTX",
        typeof context, "IAT", typeof iat, "EXP", typeof exp)
};

export { accountCtrl };
