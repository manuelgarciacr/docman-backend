import passport from "passport";
import * as passportJwt from "passport-jwt";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import mongoose from "mongoose";
import fs from "fs";
import crypto from "crypto";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const opts = {};
const privateKey = fs.readFileSync(process.env.KEY);
const cert = fs.readFileSync(process.env.CERT);
const publicKey = crypto
    .createPublicKey(cert)
    .export({ type: "pkcs1", format: "pem" });
const algorithm = process.env.ALGORITHM;

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = publicKey;

passport.use(
    new JwtStrategy(opts, (payload, done) =>
        {console.log(payload)
        return done(err, false)}
        // User.findOne({ id: payload.sub }, (err, user) => {
        //     if (err) {
        //         return done(err, false);
        //     }
        //     if (user) {
        //         return done(null, user);
        //     } else {
        //         return done(null, false);
        //         // or you could create a new account
        //     }
        // })
    )
);

const getToken = (context, expiresIn, payload = {}) => {
    try {
        const nonce = getHash(context);
        const options = {
            algorithm,
            expiresIn,
        };
        const token = jwt.sign({ nonce, ...payload }, privateKey, options);
        const cookieOptions = {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                signed: true,
                maxAge: expiresIn * 1000, // Thousandths of a second
            };
        return Promise.resolve({token, cookieOptions});
    } catch (err) {
        return Promise.reject(err);
    }
};

const validateToken = (token, context) => {
    try {
        const nonce = getHash(context);
        const decoded = jwt.verify(token, publicKey, {
            nonce, algorithms: [algorithm]
        });
        
        return Promise.resolve(decoded);
    } catch (err) {
        return Promise.reject(err);
    }
};

const getAuthorizationTokens = async (userId, collection, stayLogged) => {
    try {
        const userContext = new mongoose.mongo.ObjectId();
        const nonce = getHash(userContext.toHexString());
        const expirationStr = stayLogged
            ? process.env.REFRESH_LONG_EXPIRATION
            : process.env.REFRESH_SHORT_EXPIRATION;
        const expiration = parseInt(expirationStr ?? "0");
        const payload = {
            sub: userId,
            nonce,
            // Private
            collectionId: collection._id,
            role: getRole(userId, collection.users, collection.roles),
        };

        const dbToken = new Token({
            userId,
            collectionId,
            type: "refresh",
        });
        const refreshId = dbToken._id;
        dbToken.setMaxAge(loggingExpiration);

        const options = {
            algorithm,
            jwtid: refreshId.toHexString(),
            expiresIn: expiration,
        };
        const refreshToken = jwt.sign({}, privateKey, options);
        const accessToken = await getAccessToken(payload, options);

        return Promise.resolve({
            refreshToken,
            refreshId,
            accessToken,
            userContext,
        });
    } catch (err) {
        return Promise.reject(err);
    }
};

const getRefreshToken = async (userId, collection, stayLogged) => {
    try {
        const userContext = new mongoose.mongo.ObjectId();
        const nonce = getHash(userContext.toHexString());
        const expirationStr = stayLogged ? process.env.REFRESH_LONG_EXPIRATION
            : process.env.REFRESH_SHORT_EXPIRATION;
        const expiration = parseInt(expirationStr ?? "0");
        const payload = {
            sub: userId,
            nonce,
            // Private
            collectionId: collection._id,
            role: getRole(userId, collection.users, collection.roles),
        };

        const dbToken = new Token({
            userId,
            collectionId,
            type: "refresh",
        });
        const refreshId = dbToken._id
        dbToken.setMaxAge(loggingExpiration);

        const options = {
            algorithm,
            jwtid: refreshId.toHexString(),
            expiresIn: expiration,
        };
        const refreshToken = jwt.sign({}, privateKey, options);
        const accessToken = await getAccessToken(payload, options);

        return Promise.resolve({ refreshToken, refreshId, accessToken, userContext });
    } catch (err) {
        return Promise.reject(err);
    }
}

const validateRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, publicKey)

        return Promise.resolve(decoded);
    } catch (err) {
        return Promise.reject(err);
    }
};


const renewAccessToken = async (refreshToken, userContext) => {
    try {
        await validateRefreshToken(refreshToken)

        const accessToken = await getAccessToken(payload);

        return Promise.resolve(accessToken)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getAccessToken = (payload, options) => {
    try {
        const accessId = new mongoose.mongo.ObjectId();

        options.jwtid = getHash(accessId.toHexString());
        options.expiresIn = "5m";

        const accessToken = jwt.sign(
            payload,
            privateKey,
            options
        );

        return Promise.resolve(accessToken);
    } catch (err) {
        return Promise.reject(err);
    }
};

const getRole = (userId, users, roles) => {
    const idx = users.findIndex(v => v.toString() == userId.toString());

    return roles[idx]
}

const getHash = v => createHash("SHA3-512").update(v).digest("base64");

export {
    passport,
    getToken,
    validateToken,
    getAuthorizationTokens,
    getRefreshToken,
    validateRefreshToken,
    renewAccessToken,
    getHash
};