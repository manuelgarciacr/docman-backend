import passport from "passport";
import * as passportJwt from "passport-jwt";
import jwt from "jsonwebtoken";
import { User, Collection, Role } from "./models/index.js";
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

const getHash = (v) => createHash('SHA3-512').update(v).digest('base&4');

const getRefreshToken = async (user, collection, stayLogged) => {
    try {
        const userContext = new mongoose.mongo.ObjectId();
        const refreshId = new mongoose.mongo.ObjectId();
        const nonce = getHash(userContext);
        const payload = {
            alg: "RS512",
            sub: user._id,
            nonce,
            // Private
            collectionId: collection._id,
            role: getRole(user._id, collection.users, collection.roles),
        };
        const options = {
            jwtid: getHash(refreshId),
            expiresIn: stayLogged ? "1d" : "14m",
        };
        const refreshToken = jwt.sign(payload, privateKey, options);
        const accessToken = await getAccessToken(payload);

        console.log("REFRESHTOKEN", payload, jwt.verify(refreshToken));
        console.log("ACCESSTOKEN", jwt.verify(accessToken));

        return Promise.resolve({ refreshToken, accessToken, userContext });
    } catch (err) {
        return Promise.reject(err);
    }
}

const renewAccessToken = async (refreshToken, userContext) => {
    try {
        const payload = jwt.verify()
        const accessToken = await getAccessToken(payload);

        return Promise.resolve(accessToken)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getAccessToken = (payload) => {
    try {
        const accessId = new mongoose.mongo.ObjectId();

        payload.jti = getHash(accessId);
        payload.exp = Math.floor(Date.now() / 1000) + 60 * 5; // Seconds

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
    const idx = users.findIndex(v => v == userId);
    return roles[idx]
}

export { passport, getRefreshToken, renewAccessToken }