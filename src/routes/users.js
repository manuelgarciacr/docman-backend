import { Router } from "express";
import { userCtrl } from "../controllers/index.js";

const router = Router();

router.get("/users/email-exists", userCtrl.emailExists); // one user email
router.post("/users/user-add", userCtrl.userAdd); // one user email
router.get('/users/:id', userCtrl.userGet); // one user
router.get('/users', userCtrl.users);
// router.patch('/users/'); // one user

// router.delete('/users/:id'); // one document

export { router as usersRouter };
