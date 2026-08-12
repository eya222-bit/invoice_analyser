
import { Request, Response } from "express";
import { analyzeInvoice } from "../services/ai.service";
import Invoice from "../models/invoice.model";
import { normalizeDate } from "../utils/dateUtils";
import { calculateConfidence } from "../utils/confidence";

export async function uploadInvoice(
  req: Request,
  res: Response
) {
  try {
    // Vérifier qu'un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No invoice file provided"
      });
    }

    console.log(
      "File received:",
      req.file.originalname
    );

    // Appeler le microservice FastAPI
    const result = await analyzeInvoice(
      req.file.path
    );

    // Vérifier la réponse du service IA
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: "AI analysis failed"
      });
    }

    const data = result.data;

    // Normaliser les dates une seule fois
    const invoiceDate = normalizeDate(data.invoice_date);
    const dueDate = normalizeDate(data.due_date);

    // Préparer les données extraites
    const invoiceData = {
      supplier: data.supplier,
      invoice_number: data.invoice_number,
      invoice_date: invoiceDate,
      due_date: dueDate,
      total_amount: data.total_amount,
      currency: data.currency,
      vat: data.vat
    };

    // Calculer la confidence de l'extraction IA
    const confidence = calculateConfidence(invoiceData);

    console.log(
      "AI extraction confidence:",
      confidence
    );

    // Enregistrer la facture dans MySQL
    const invoice = await Invoice.create({
      ...invoiceData,
      confidence,
      status: "processed"
    });

    console.log(
      "Invoice saved with ID:",
      invoice.get("id")
    );

    return res.status(201).json({
      success: true,
      message: "Invoice analyzed and saved successfully",
      data: invoice
    });

  } catch (error: any) {

    console.error(
      "Invoice processing error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Invoice processing failed",
      error: error.message
    });
  }
}

