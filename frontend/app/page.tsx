
"use client";

import { useState } from "react";
import { uploadInvoice } from "../src/services/invoiceApi";

interface Invoice {
  id: number;
  supplier: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  currency: string | null;
  vat: string | null;
  confidence: number | null;
  status: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner une facture PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setInvoice(null);

    try {
      const result = await uploadInvoice(file);

      setInvoice(result.data);
    } catch (err: any) {
      setError(
        err.message ||
        "Une erreur est survenue lors de l'analyse."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Invoice Analyzer
        </h1>

        <p className="mb-8 text-gray-600">
          Analysez automatiquement vos factures avec l&apos;IA.
        </p>

        {/* Upload */}
        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Upload d&apos;une facture
          </h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
            className="mb-4 block w-full rounded-lg border p-3"
          />

          {file && (
            <p className="mb-4 text-sm text-gray-600">
              Fichier sélectionné :{" "}
              <strong>{file.name}</strong>
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Analyse en cours..."
              : "Analyser la facture"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {invoice && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">

            <h2 className="mb-6 text-xl font-semibold">
              Résultat de l&apos;analyse
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <div>
                <p className="text-sm text-gray-500">
                  Fournisseur
                </p>

                <p className="font-semibold">
                  {invoice.supplier || "Non détecté"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Numéro de facture
                </p>

                <p className="font-semibold">
                  {invoice.invoice_number || "Non détecté"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Date de facture
                </p>

                <p className="font-semibold">
                  {invoice.invoice_date || "Non détectée"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Date d&apos;échéance
                </p>

                <p className="font-semibold">
                  {invoice.due_date || "Non détectée"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Montant total
                </p>

                <p className="font-semibold">
                  {invoice.total_amount ?? "Non détecté"}{" "}
                  {invoice.currency || ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  TVA
                </p>

                <p className="font-semibold">
                  {invoice.vat ?? "Non détectée"}
                </p>
              </div>

            </div>

            {/* Confidence */}
            <div className="mt-8 border-t pt-6">

              <div className="mb-2 flex justify-between">
                <span className="font-semibold">
                  AI Confidence
                </span>

                <span className="font-bold text-blue-600">
                  {invoice.confidence ?? 0}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${invoice.confidence ?? 0}%`,
                  }}
                />
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

