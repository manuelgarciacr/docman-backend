import { Router } from "express";
import { accountCtrl } from "../controllers/index.js";

const router = Router();

router.post("/accounts/ownerSignup", accountCtrl.ownerSignupValidation, accountCtrl.ownerSignup);
router.post("/accounts/login", accountCtrl.login);
router.post("/accounts/logout", accountCtrl.logout);
// router.post("/accounts/cleanDB", accountCtrl.cleanDB);
router.get("/accounts/ownerValidation/:code", accountCtrl.ownerValidation);
router.get(
    /^\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    accountCtrl.validate
);
export { router as accountsRouter };
