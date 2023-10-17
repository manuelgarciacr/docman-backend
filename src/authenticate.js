const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const env = process.env.NODE_ENV || 'development';
console.log("Environment " + env);

let envPath = {};
let sec = false;

if (env === 'production'){
    envPath.path = '/var/www/html/nodejs/nodeServer/.env';
    sec = true
}

const dotenvRes = require('dotenv').config(envPath);
if (dotenvRes.error) {
    throw dotenvRes.error
}

// console.log(dotenvRes.parsed)

var passport = require('passport');
const config = require('./config.js');
var crypto = require('crypto');

////////// tokens
////
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
//const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

exports.getToken = function (user, remembered) {
    return jwt.sign(user, process.env.SECRET_KEY,
        { expiresIn: remembered ? '3650d' : 60 * 60 }); // 10 years or 1 h
};

var opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.jwtFromRequest = req => { // Token in cookie
    let token = null;
    if (req && req.signedCookies && req.signedCookies.jwt) token = req.signedCookies.jwt;
    return token;
};
opts.secretOrKey = process.env.SECRET_KEY;

// exports.jwtPassport = passport.use(new JwtStrategy(opts,
//     (jwt_payload, done) => {
//         console.log("JWT payload: ", jwt_payload);
//         User.findOne({ _id: jwt_payload._id }, (err, user) => {
//             if (err) {
//                 return done(err, false);
//             }
//             else if (user) {
//                 return done(null, user);
//             }
//             else {
//                 return done(null, false);
//             }
//         });
//     }
// ));

exports.verifyUser = passport.authenticate('jwt', { session: false })
////
////////// tokens

module export signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 15)
    .then(hash => {
        req.body.password = hash;
        return User.create(req.body)
    })
    .then(user =>{
        res.body = user;
        next()
    }).catch(err => {
        console.error(err)
        res.body = req.body;
        next()
    })
}

exports.login = (req, res, next) => {

    User.findOne({email: req.body.email}).exec()
    .then(user => bcrypt.compare(req.body.password, user.password).then(ok => [user, ok]))
    .then(resp => {
        [user, ok] = resp;
        if (!ok)
            return Promise.reject('Invalid password')
        res.body = user; 
        res.body.password = "";
        next()
    }).catch(err => {
        console.error(err)
        err.stack = "";
        next({message: "Invalid user/password"})
    })
}

exports.setToken = (_, res, next) => {
    const payload = {
        data: res.body._id
    }
    jwt.sign(payload, process.env.SECRET_KEY, function(err, token) {
        if (err != null)
            next({message: err.message, ...err});

        res.body = {
            token: token,
            user: res.body
        };
        next()
    });   
}

exports.setCookie = (_, res, next) => {
    const token = res.body.token;

    try {
        res.cookie('jwt', token, { 
            signed: true, 
            httpOnly: true, 
            sameSite: true, 
            secure: sec, 
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000
        });
        res.body = user;
        next()
    } catch (err) {
        next(err)
    }
}

exports.getCookie = (req, res, next) => {
    if (!req.signedCookies.jwt)
        next({message: 'Cookie required'});

        //     let cookieUser = {};
        //     if (err.length === 0) {
        //         cookieUser = JSON.parse(req.signedCookies.user);
        //         if (authenticate.getHash(req.body.password) != cookieUser.password)
        //             err.push('invalid password confirmation');
        //         if (authenticate.getHash(req.body.code) != cookieUser.code)
        //             err.push('invalid_validation_code');
        //     }
}

exports.getCode = () => {
    let n = Math.floor(Math.random() * 9999);
    return n.toString().slice(-4).padStart(4, '0');
}

exports.getHash = (pass) => {
    return crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(pass)
        .digest('hex');
}

exports.validateEmail = em => {
    const err = [];
    if (!em)
        err.push("email_is_missing");
    else if (! /^\S+@\S+$/.test(em))
        err.push("email_invalid_format");
    return Promise.resolve(err);
}

exports.validateUserName = un => {
    const err = [];
    if (!un)
        err.push("username_is_missing");
    else if (! /^[0-9a-zA-Z_.-]+$/.test(un))
        err.push("only_letters_digits__.-");
    return Promise.resolve(err);
}

// TODO: Check db error
exports.validateUser = (err, un, email = false) => {
    if (err.length > 0) // invalid username format
        return Promise.resolve(err); // Continue validations. Resolve
    return User.findOne({ username: un }).exec()
        .then(doc => {
            if (doc === null) // OK. user doesn't exists. 
                return []; // Continue validations. Resolve
            else // KO. user already exists
                return Promise.reject(email ? ["user_email_already_exists"] : ["user_already_exists"]); // End validations. Reject
        }); // If error reading User end validations. Reject
}

exports.validateName = (err, k, n) => {
    if (!n)
        err.push( k + "_is_missing");
    else if (! /^(\s*[a-zA-ZÀ-ÿ']+\s*)+$/g.test(n))
        err.push( k + "_only_letters_and_spaces")
    return Promise.resolve(err);
}

exports.validatePassword = (err, pw) => {
    if (!pw)
        err.push("password_is_missing");
    else if (pw.length < 8)
        err.push("password_minimum_eight_characters");
    return Promise.resolve(err);
    // var errors = {
    //     uppercase: { regex: /[A-Z]/, description: 'At least one uppercase letter' },
    //     lowercase: { regex: /[a-z]/, description: 'At least one lowercase letter' },
    //     digit: { regex: /[0-9]/, description: 'At least one digit' },
    //     special: { regex: /[^A-Za-z0-9]/, description: 'At least one special symbol' },
    //     length: { test: e => e.length > 2, description: 'Should be more than 2 characters' },
    //  };
    // function validatePassword(e) {
    //     return Object.entries(errors).flatMap(([name, { test, regex, description }]) => {
    //       const isValid = test ? test(e) : regex.test(e);
    //       return isValid ? [] : { description, name };
    //     });
    //   }
    //   console.log(JSON.stringify(validatePassword('a'),null,2))
}

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());