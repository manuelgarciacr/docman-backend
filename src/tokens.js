import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import fs from "fs";
import crypto from "crypto";
import { Blacklist, Blacklog } from "./models/index.js";

const privateKey = fs.readFileSync(process.env.KEY);
const cert = fs.readFileSync(process.env.CERT);
const publicKey = crypto
    .createPublicKey(cert)
    .export({ type: "pkcs1", format: "pem" });
const algorithm = process.env.ALGORITHM;
const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    signed: true,
};

const setToken = (type, res, context, expiresIn, payload = {}) => {
    try {
        const cookieName = getCookieName(type, res.req.signedCookies);
        const nonce = getHash(context);
        const options = {
            algorithm,
            expiresIn,
        };
        const token = jwt.sign({ nonce, cookieName, ...payload }, privateKey, options);
        const maxAge = expiresIn * 1000; // Thousandths of a second
        
        res.cookie(cookieName, context, {...cookieOptions, maxAge});
        res.set( `X-${type}`, token);

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
};

const getCookieName = (type, cookies) => {
    let name = `__Host-${type}`;
    let n = 0;
    const keys = Object.keys(cookies);
    const names = keys.filter(n => n.startsWith(name));

    while (names.includes(name)) {
        const next = (++n).toString();
        name = `__Host-${type}${next}`;
    }
    return name
};

const validateToken = async (token, type, cookies) => {
    try {

        if (typeof token != "string") throw "token:Token validation error";

        const schema = token.substring(0, 7).toLowerCase()

        if (schema == "bearer ") token = token.substring(7);

        const decoded = jwt.verify(token, publicKey, {
            algorithms: [algorithm],
        }); // TODO: Blacklog all the errors
        const cookieName = decoded.cookieName;

        if (typeof cookieName != "string" || cookieName == "")
            throw "cookieName:Token validation error";

        const types = typeof type == "string" ? [type] : type;
        const typeOk = types.some(v => cookieName.startsWith(`__Host-${v}`));

        if (!typeOk)
            throw "type:Token validation error";

        const context = cookies[cookieName];

        if (typeof context != "string") 
            throw "cookie:Token validation error";
        
        const nonce = getHash(context);

        if (nonce != decoded.nonce) 
            throw {
                name: "JsonWebTokenError",
                message: `jwt nonce invalid. expected: ${nonce}`,
        };
        
        const userId = decoded.sub;
        const collectionId = decoded.coll;
        const hash = decoded.hash; // Only access tokens
        const lockedToken = hash
            ? await Blacklist.findOne({ hash }) // Access token
            : await Blacklist.findOne({ context }); // Refresh token

        if (lockedToken) {
            Blacklog.create({
                context,
                userId,
                collectionId,
                type: hash ? "access" : "refresh",
                subtype: "sidejacking",
            });
            // return Promise.reject(
            //     `${hash ? "Access" : "Refresh"} Token Sidejacking`
            // );
            throw `${hash ? "Access" : "Refresh"} Token Sidejacking`
        }

        return Promise.resolve({...decoded, context});
    } catch (err) {
        const message = typeof err == "string"
            ? err
            : err.message ?? "Token error";
        const error = {message}
        if (message.includes("jwt") || message.includes("invalid") || message.includes("Token")) {
            error.status = 601;
        }
        console.log("ERR", JSON.stringify(error));
        return Promise.reject(error);
    }
};

const clearCookie = (name, res) => res.clearCookie(name, cookieOptions); 

const getHash = v => createHash("SHA3-512").update(v).digest("base64");

export {
    setToken,
    validateToken,
    clearCookie,
    getHash
};