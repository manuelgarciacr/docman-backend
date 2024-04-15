import { Router } from "express";
import { collectionCtrl } from "../controllers/index.js";
import { accountCtrl } from "../controllers/index.js"

const router = Router();
const authenticate = accountCtrl.authorization;

router.get("/collections/collection-exists", collectionCtrl.collectionExists); // one user email
router.post("/collections/actualizeUsers", authenticate, collectionCtrl.actualizeUsers); 

export { router as collectionsRouter };