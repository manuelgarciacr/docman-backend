import { Router } from "express";
import { documentCtrl } from "../controllers/index.js";

const router = Router();

router.get("/document", (req, res) => res.sendStatus(200)); // all documents
router.get("/document/:id"); // one document
router.get("/document/:id/render", documentCtrl.renderDocument); // one document render
router.get("/document/:id/data"); // one document metadata
router.get("/document/:id/object"); // one document object

router.post("/document", (req, res) => {
    const { a, b} = req.body;

}); // one or more documents

router.patch("/document/"); // one document

router.delete("/document/:id"); // one document

export { router as documentRouter};
