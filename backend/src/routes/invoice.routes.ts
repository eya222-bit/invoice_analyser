import { Router } from "express";
import { upload } from "../middlewares/upload";
import { uploadInvoice } from "../controllers/invoice.controller";

const router = Router();

router.post(
    "/upload",
    upload.single("file"),
    uploadInvoice
);

export default router;