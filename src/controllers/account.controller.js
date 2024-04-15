import { User, Collection, Registration, Blacklist } from "../models/index.js";
import mongoose from "mongoose"
import crypto from "crypto";
import { getRandomInt } from "../random.js";
import { setToken, validateToken, clearCookie, getHash } from "../tokens.js";
// import { sendResource } from "../email.js";
// import { checkSchema, validationResult } from "express-validator";
// import { ownerSignupSchema } from "./validationSchemas.js";

const accountCtrl = {};
const db = mongoose.connection;
const fn_pad = n => String(n).padStart(5, "0");
const secureRandom = () => crypto.randomBytes(24).toString("hex");

accountCtrl.authorization = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = await validateToken(token, ["ctectx", "refctx"], req.signedCookies);
        const cookieName = decoded.cookieName;
        if ( cookieName.startsWith('__Host-refctx') ){
            const id = decoded.coll;
            const collection = await Collection.findById(id);
            const stayLoggedIn = collection.stayLoggedIn;

            await newTokens(decoded.sub, decoded.coll, stayLoggedIn, res);
            clearCookie(cookieName, res)
        }
        next()
    } catch (err) {
        next(err)
    }
}

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

            await setToken("ownctx", res, context, expiration);

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            res.json({ status: 200, message: "Ok", data: [] });
        })
        .catch(err => next(err));
};

accountCtrl.ownerValidation = async (req, res, next) => {

    await db
        .transaction(async session => {
            // Validate token and code

            const ownerToken = req.headers.authorization;
            const code = req.header("X-Code");

            if (typeof ownerToken != "string") throw "token:Validation error";
            if (typeof code != "string") throw "code:Validation error";

            const decoded = await validateToken(ownerToken, "ownctx", req.signedCookies);

            // Validate the code received

            const context = decoded.context;
            const id = mongoose.Types.ObjectId.createFromHexString(context);
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

            await newTokens(userId, collectionId, collection.stayLoggedIn, res);

            const cookieName = decoded.cookieName;

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            finishingValidation(cookieName, res, user, collection);
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

        if (!users.includes(user?._id)) throw ERROR;

        if (!(await user.checkPassword(password))) throw ERROR;

        if (!user.enabled || !collection.enabled) throw ERROR;

        user.password = "";

        await newTokens(user._id, collection._id, collection.stayLoggedIn, res);

        // Throw an error to abort the transaction
        // throw new Error("Oops!");

        finishingValidation("", res, user, collection);
    } catch (err) {
        next(err);
    }
};

accountCtrl.logout = async (req, res, next) => {

    await db.transaction(async session => {
        const refreshToken = req.headers.authorization;

        if (typeof refreshToken != "string" || refreshToken == "")
            throw "token:Logout error";

        await validateToken(refreshToken, "refctx", req.signedCookies).then(
            async decoded => {
                const context = decoded.context;
                const hash = decoded.nonce;
                const expireAt = decoded.exp * 1000;
                const cookieName = decoded.cookieName;

                clearCookie(cookieName, res);
                
                await Blacklist.create([{ context, hash, expireAt }], {
                    session,
                });
            }
        );

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

accountCtrl.forgotPassword = async (req, res, next) => {
    const ERROR = { status: 404, message: "Invalid email or collection", data: [] };
    
    await db
        .transaction(async session => {
            const email = req.body.user.email;
            const name = req.body.collection.name;
            const user = await User.findOne({email});
            const collection = await Collection.findOne({name});
            const userId = user._id;
            const users = collection?.users ?? [];

            if (!users.includes(userId)) throw ERROR;
            if (!user.enabled || !collection.enabled) throw ERROR;

            const collectionId = collection._id;
            const isRegistering = await Registration.findOne({ userId, collectionId });
            
            if (isRegistering != null) {
                 res.json({
                     status: 200,
                     message: "Ok",
                     data: [],
                 });
                 return
            }

            const code = fn_pad(getRandomInt(1, 99999));
            const registration = new Registration({
                userId,
                collectionId,
                code
            });
            const expiration = parseInt(process.env.VALIDATION_EXPIRATION);

            registration.setExpiration(expiration);

            await registration.save({ session });

            console.log("code:", code);
            /* sendResource(
                process.env.EMAIL_USER,
                user.email,
                "Code",
                code,
                //process.env.REDIRECT + user.UUID
            ); */

            const context = registration._id.toHexString();

            await setToken("forpwdvalctx", res, context, expiration)

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            res.json({ status: 200, message: "Ok", data: [] });
        })
        .catch(err => next(err));
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
            const collection = await Collection.findById(
                collectionId
            );
            const stayLoggedIn = collection.stayLoggedIn;

            await newTokens(userId, collectionId, stayLoggedIn, res);

            const cookieName = decoded.cookieName;

            // Throw an error to abort the transaction
            // throw new Error("Oops!");

            finishingValidation(cookieName, res, user, collection)
        })
        .catch(err => next(err));
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

const newTokens = async (sub, coll, stayLoggedIn, res) => {
    // Gets the refresh token and its context cookie

    const refreshContext = secureRandom();
    const refreshExpirationStr = stayLoggedIn
        ? process.env.REFRESH_LONG_EXPIRATION
        : process.env.REFRESH_SHORT_EXPIRATION;
    const refreshExpiration = parseInt(refreshExpirationStr);

    await setToken("refctx", res, refreshContext, refreshExpiration, {sub, coll});

    // Gets the access token and its context cookie

    const accessContext = secureRandom();
    const accessExpirationStr = process.env.ACCESS_EXPIRATION;
    const accessExpiration = parseInt(accessExpirationStr);
    const hash = getHash(refreshContext);

    await setToken("ctectx", res, accessContext, accessExpiration, { sub, coll, hash });
};

const finishingValidation = (cookieName, res, user, collection) => {
 
    // Remove validation cookie if any

    if (typeof cookieName == "string" && cookieName!="")
        clearCookie(cookieName, res);

    // Preparing the data to respond to the request.

    user.password = "";
    user.enabled = true;
    collection.enabled = true;

    const userStr = JSON.stringify(user);
    const collectionStr = JSON.stringify(collection);

    // Throw an error to abort the transaction
    // throw new Error("Oops!");

    res.json({
        status: 200,
        message: "Ok",
        data: [userStr, collectionStr],
    });
}

export { accountCtrl };
