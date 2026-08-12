import { Router } from "express";

import { upload } from "../middlewares/upload";

import {
  uploadInvoice,
  getInvoices,
  getInvoiceById,
  getInvoiceStats,
  getExpensesBySupplier,
  getExpensesByDate
} from "../controllers/invoice.controller";


const router = Router();


// Upload et analyse d'une facture
router.post(
  "/upload",
  upload.single("file"),
  uploadInvoice
);


// Dashboard
router.get(
  "/stats",
  getInvoiceStats
);

router.get(
  "/by-supplier",
  getExpensesBySupplier
);

router.get(
  "/by-date",
  getExpensesByDate
);


// Liste des factures
router.get(
  "/",
  getInvoices
);


// Détail d'une facture
router.get(
  "/:id",
  getInvoiceById
);


export default router;