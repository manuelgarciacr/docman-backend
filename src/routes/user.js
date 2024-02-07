import { Router } from "express";
import { userCtrl } from "../controllers/index.js";

const router = Router();

// router.get('/user'); // all users
// router.get('/user/:id'); // one user

router.post("/user/signup", userCtrl.signup); // one user
router.post("/user/signin", userCtrl.signin); // one user
router.post("/user/logout", userCtrl.logout); // one user

// router.patch('/user/'); // one user

// router.delete('/user/:id'); // one document

module.exports = router;
