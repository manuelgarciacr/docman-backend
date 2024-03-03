import { Router } from "express";
import { collectionCtrl } from "../controllers/index.js";
//import { Collection } from "../models/index.js";

const router = Router();

router.get("/collections/collection-exists", collectionCtrl.collectionExists); // one user email

export { router as collectionsRouter };