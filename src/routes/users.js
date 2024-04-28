import { Router } from "express";
import { userCtrl } from "../controllers/index.js";
import { accountCtrl } from "../controllers/index.js"

const router = Router();
const authenticate = accountCtrl.authorization;

router.get("/users/email-exists", userCtrl.emailExists); // one user email
router.post("/users/user-add", authenticate, userCtrl.userAdd); // one user email
router.get('/users/:id', authenticate, userCtrl.userGet); // one user
router.get('/users', authenticate, userCtrl.users);
// router.patch('/users/'); // one user

// router.delete('/users/:id'); // one document

export { router as usersRouter };
