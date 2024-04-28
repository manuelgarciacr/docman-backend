import { Router } from "express";
import { accountCtrl } from "../controllers/index.js";

const router = Router();

router.post("/accounts/ownerSignup", accountCtrl.ownerSignup);
router.post("/accounts/ownerValidation", accountCtrl.ownerValidation);
router.post("/accounts/login", accountCtrl.login);
router.post("/accounts/logout", accountCtrl.logout);
router.post("/accounts/forgotPassword", accountCtrl.forgotPassword);
router.post("/accounts/forgotPasswordValidation", accountCtrl.forgotPasswordValidation);
// router.post("/accounts/cleanDB", accountCtrl.cleanDB);
router.get(
    /^\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    accountCtrl.invitationLink
);
export { router as accountsRouter };
