
import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { analyzeInvoice } from "../services/ai.service";
import Invoice from "../models/invoice.model";
import { normalizeDate } from "../utils/dateUtils";
import { calculateConfidence } from "../utils/confidence";


// ======================================================
// UPLOAD ET ANALYSE D'UNE FACTURE
// ======================================================

export async function uploadInvoice(
  req: Request,
  res: Response
) {
  try {
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

    // Normaliser les dates
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

    // Calculer la confidence
    const confidence = calculateConfidence(invoiceData);

    console.log(
      "AI extraction confidence:",
      confidence
    );

    // Enregistrer dans MySQL
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


// ======================================================
// 1. LISTE DE TOUTES LES FACTURES
// GET /api/invoices
// ======================================================

export async function getInvoices(
  req: Request,
  res: Response
) {
  try {

    const invoices = await Invoice.findAll({
      order: [["id", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });

  } catch (error: any) {

    console.error(
      "Get invoices error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoices",
      error: error.message
    });
  }
}


// ======================================================
// 2. DÉTAIL D'UNE FACTURE
// GET /api/invoices/:id
// ======================================================

export async function getInvoiceById(
  req: Request,
  res: Response
) {
  try {

    const { id } = req.params;

    const invoice = await Invoice.findByPk(Array.isArray(id) ? id[0] : id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });

  } catch (error: any) {

    console.error(
      "Get invoice error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoice",
      error: error.message
    });
  }
}


// ======================================================
// 3. STATISTIQUES GÉNÉRALES
// GET /api/invoices/stats
// ======================================================

export async function getInvoiceStats(
  req: Request,
  res: Response
) {
  try {

    const totalInvoices = await Invoice.count();

    const totalExpenses = await Invoice.sum(
      "total_amount"
    );

    const averageInvoice = await Invoice.findOne({
      attributes: [
        [
          fn("AVG", col("total_amount")),
          "averageInvoice"
        ]
      ],
      raw: true
    }) as any;

    const averageVat = await Invoice.findOne({
  attributes: [
    [
      fn("AVG", col("vat")),
      "averageVat"
    ]
  ],
  raw: true
}) as any;

    const averageConfidence = await Invoice.findOne({
      attributes: [
        [
          fn("AVG", col("confidence")),
          "averageConfidence"
        ]
      ],
      raw: true
    }) as any;

    const suppliers = await Invoice.findAll({
      attributes: ["supplier"],
      group: ["supplier"],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        totalExpenses: totalExpenses || 0,
        averageInvoice:
          Number(averageInvoice?.averageInvoice) || 0,
        averageVat:
          Number(averageVat?.averageVat) || 0,
        averageConfidence:
          Number(averageConfidence?.averageConfidence) || 0,
        totalSuppliers: suppliers.length
      }
    });

  } catch (error: any) {

    console.error(
      "Invoice statistics error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoice statistics",
      error: error.message
    });
  }
}


// ======================================================
// 4. DÉPENSES PAR FOURNISSEUR
// GET /api/invoices/by-supplier
// ======================================================

export async function getExpensesBySupplier(
  req: Request,
  res: Response
) {
  try {

    const expenses = await Invoice.findAll({
      attributes: [
        "supplier",
        [
          fn("SUM", col("total_amount")),
          "total"
        ]
      ],
      group: ["supplier"],
      order: [
        [fn("SUM", col("total_amount")), "DESC"]
      ],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: expenses
    });

  } catch (error: any) {

    console.error(
      "Expenses by supplier error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses by supplier",
      error: error.message
    });
  }
}


// ======================================================
// 5. DÉPENSES AU FIL DU TEMPS
// GET /api/invoices/by-date
// ======================================================

export async function getExpensesByDate(
  req: Request,
  res: Response
) {
  try {

    const expenses = await Invoice.findAll({
      attributes: [
        "invoice_date",
        [
          fn("SUM", col("total_amount")),
          "total"
        ]
      ],
      where: {
        invoice_date: {
          [Op.ne]: null
        }
      },
      group: ["invoice_date"],
      order: [["invoice_date", "ASC"]],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: expenses
    });

  } catch (error: any) {

    console.error(
      "Expenses by date error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses by date",
      error: error.message
    });
  }
}