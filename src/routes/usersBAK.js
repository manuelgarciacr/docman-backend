const express = require('express');
const User = require('../models/User');
const auth = require('../authenticate');

const env = process.env.NODE_ENV || 'development';
let sec = true;
if (env === 'development')
    sec = false;
//var express = require('express');
//var passport = require('passport');

////////// passport local with tokens in cookies
////
// var authenticate = require('../authenticate');
// var login = (req, res, next) => {
//     const user = typeof next === 'function' ? req.user : next;
//     const remembered = typeof next === 'function' ? req.body.remembered : true;
//     const token = authenticate.getToken({_id: user._id}, remembered);
// console.log("TOKEN", req.body, user, remembered, token)    
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.cookie('jwt', token, { signed: true, httpOnly: true, sameSite: true, secure: sec, maxAge: 10 * 365 * 24 * 60 * 60 * 1000});
//     res.json(user);
// }
const error = (code, err, res) => {
    console.log("ERR:", err)
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.json({ err: err });
}
////
////////// passport local with tokens in cookies
////////// passport local with tokens
////
// var authenticate = require('../authenticate');
// var login = (req, res) => {
//     var token = authenticate.getToken({_id: req.user._id});
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.json({ success: true, token: token, status: 'You are successfully logged in!' });
// }
////
////////// passport local with tokens

const router = express.Router();

//router.use(express.json());

router.post('/signup', auth.signup, (_, res) => {
    auth.sendCode(res.body.email, 321564)
    res.json(res.body)
})

router.post('/login', auth.login, auth.setToken, auth.setCookie, (_, res) => {
    res.json(res.body)
});
router.delete('/logout', (_, res) => {
    res.status(200).clearCookie('jwt').json( {message: 'You are successfully logged out!' })
})
// The username is the email
// router.post('/signup', (req, res, next) => {
//     console.log("SIGNUP", req.body);
//     if (!req.body.code) {
//         // Validate user data
//         return authenticate.validateEmail(req.body.email)
//         .then( err => authenticate.validateUser(err, req.body.email, true) )
//         .then( err => authenticate.validateName(err, "first_name", req.body.firstName) )
//         .then( err => req.body.lastName ? authenticate.validateName(err, "last_name", req.body.lastName) : err)
//         .then( err => req.body.nick ? authenticate.validateName(err, "nick", req.body.nick) : err)        
//         .then( err => authenticate.validatePassword(err, req.body.password) )
//         .then( err => {
//             if (err.length > 0)
//                 return Promise.reject(err);
//             let code = authenticate.getCode();
//             console.log("USER DATA OK. CODE", code)
//             // Send email with the code
//             return authenticate.sendCode(req.body.email, code)
//         })
//         .then(code => {
//             console.log("Code " + code + " send OK")
//             const user = {
//                 username: req.body.email,
//                 email: req.body.email,
//                 firstName: req.body.firstName,
//                 password: authenticate.getHash(req.body.password),
//                 code: authenticate.getHash(code)
//             }
//             if (req.body.lastName) user["lastName"] = req.body.lastName;
//             if (req.body.nick) user["nick"] = req.body.nick;
//             // Production: {signed: true, secure: true, maxAge: 1000 * 60 * 10}
//             res.cookie( 'user', JSON.stringify(user), { signed: true, maxAge: 1000 * 60 * 10, secure: sec, httpOnly: true, sameSite: true });
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json({ msg: 'Confirmation code sended' });
//         })
//         .catch(err => error("400", err, res))
//         .finally(() => ({}));
//     }
//     // Password and code confirmation
//     let err = [];
//     if (!req.signedCookies.user) {
//         err.push('ten_minutes_timeout');
//     } else {
//         if(!req.body.password)
//             err.push('password_is_missing');
//         if (!req.body.code)
//             err.push('validation_code_is_missing');
//     }
//     let cookieUser = {};
//     if (err.length === 0) {
//         cookieUser = JSON.parse(req.signedCookies.user);
//         if (authenticate.getHash(req.body.password) != cookieUser.password)
//             err.push('invalid password confirmation');
//         if (authenticate.getHash(req.body.code) != cookieUser.code)
//             err.push('invalid_validation_code');
//     }
//     if (err.length > 0) 
//         return error("400", err, res);

//     // Validation OK
//     User.register(
//         new User({
//             username: cookieUser.email,
//             email: cookieUser.email,
//             firstName: cookieUser.firstName
//         }),
//         req.body.password, 
//         (err, user) => {
//             if (err) {
//                 if (user)
//                     user.delete();
//                 return error("500", err, res);
//             }
//             if (cookieUser.lastName) user.lastName = cookieUser.lastName;
//             if (cookieUser.nick) user.nick = cookieUser.nick;
//             user.save((err, user) => {
//                 if (err) {
//                     if (user)
//                         user.delete();
//                     return error("500", err, res);
//                 }
//                 ////////// passport local with tokens
//                 ////
//                 res.clearCookie('user');
//                 login(req, res, user)
//                 ////
//                 ////////// passport local with tokens
//             });
//         }
//     );
// });

////////// passport local with tokens
////
//router.post('/login', login);
////
////////// passport local with tokens

////////// passport local with tokens in cookies
////
// router.delete('/logout', authenticate.verifyUser, (req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.clearCookie('jwt');
//     res.json({ msg: 'You are successfully logged out!' });
// });
////
////////// passport local with tokens in cookies

module.exports = router;
