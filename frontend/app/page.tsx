
"use client";

import { useEffect, useState } from "react";
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

interface Stats {
  totalInvoices: number;
  totalExpenses: number;
  averageInvoice: number;
  averageVat: number;
  averageConfidence: number;
  totalSuppliers: number;
}

interface SupplierExpense {
  supplier: string | null;
  total: number;
}

interface DateExpense {
  invoice_date: string;
  total: number;
}

const API_URL = "http://localhost:3000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [supplierExpenses, setSupplierExpenses] = useState<
    SupplierExpense[]
  >([]);
  const [dateExpenses, setDateExpenses] = useState<DateExpense[]>([]);

  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CHARGEMENT DU DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);

      const [
        invoicesResponse,
        statsResponse,
        supplierResponse,
        dateResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/invoices`),
        fetch(`${API_URL}/api/invoices/stats`),
        fetch(`${API_URL}/api/invoices/by-supplier`),
        fetch(`${API_URL}/api/invoices/by-date`),
      ]);

      if (
        !invoicesResponse.ok ||
        !statsResponse.ok ||
        !supplierResponse.ok ||
        !dateResponse.ok
      ) {
        throw new Error("Impossible de charger le dashboard");
      }

      const invoicesData = await invoicesResponse.json();
      const statsData = await statsResponse.json();
      const supplierData = await supplierResponse.json();
      const dateData = await dateResponse.json();

      setInvoices(invoicesData.data || []);
      setStats(statsData.data || null);
      setSupplierExpenses(supplierData.data || []);
      setDateExpenses(dateData.data || []);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      setError(
        "Impossible de charger les données du tableau de bord."
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // UPLOAD
  // =====================================================

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

      // Actualiser le dashboard après analyse
      await loadDashboard();

      // Réinitialiser le fichier
      setFile(null);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Une erreur est survenue lors de l'analyse."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMATAGE
  // =====================================================

  const formatAmount = (
    amount: number | null | undefined,
    currency = "TND"
  ) => {
    if (amount === null || amount === undefined) {
      return "0";
    }

    return `${Number(amount).toLocaleString("fr-TN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Non détectée";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("fr-FR");
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}

      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Invoice Analyzer
              </h1>

              <p className="mt-1 text-blue-100">
                Tableau de bord intelligent de vos factures
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-sm text-blue-100">
                Factures analysées
              </p>

              <p className="text-2xl font-bold">
                {stats?.totalInvoices ?? 0}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* UPLOAD */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Analyser une nouvelle facture
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Importez une facture PDF pour lancer automatiquement
              l'analyse IA.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <label className="flex flex-1 cursor-pointer items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-blue-50">
              <div>
                <p className="font-semibold text-slate-700">
                  {file
                    ? file.name
                    : "Sélectionner une facture PDF"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Format accepté : PDF
                </p>
              </div>

              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                }}
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? "Analyse en cours..."
                : "Analyser la facture"}
            </button>
          </div>
        </section>

        {/* STATISTIQUES */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Vue d&apos;ensemble
            </h2>
          </div>

          {dashboardLoading ? (
            <div className="rounded-xl bg-white p-8 text-center text-slate-500">
              Chargement des statistiques...
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total factures */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total des factures
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {stats?.totalInvoices ?? 0}
                </p>

                <p className="mt-2 text-sm text-blue-600">
                  Factures analysées
                </p>
              </div>

              {/* Dépenses */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total des dépenses
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {formatAmount(
                    stats?.totalExpenses
                  )}
                </p>

                <p className="mt-2 text-sm text-emerald-600">
                  Toutes les factures
                </p>
              </div>

              {/* Moyenne */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Moyenne par facture
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {formatAmount(
                    stats?.averageInvoice
                  )}
                </p>

                <p className="mt-2 text-sm text-indigo-600">
                  Dépense moyenne
                </p>
              </div>

              {/* TVA */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Moyenne TVA
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {formatAmount(
                    stats?.averageVat
                  )}
                </p>

                <p className="mt-2 text-sm text-orange-600">
                  TVA moyenne par facture
                </p>
              </div>

              {/* Fournisseurs */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Fournisseurs
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {stats?.totalSuppliers ?? 0}
                </p>

                <p className="mt-2 text-sm text-purple-600">
                  Fournisseurs différents
                </p>
              </div>

              {/* Confidence */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Confiance IA moyenne
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {stats?.averageConfidence
                    ? `${Number(
                        stats.averageConfidence
                      ).toFixed(1)}%`
                    : "0%"}
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        Number(
                          stats?.averageConfidence || 0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* GRAPHIQUES */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Fournisseurs */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Dépenses par fournisseur
              </h2>

              <p className="text-sm text-slate-500">
                Répartition des dépenses
              </p>
            </div>

            {supplierExpenses.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            ) : (
              <div className="space-y-5">
                {supplierExpenses.map(
                  (item, index) => {
                    const max =
                      Math.max(
                        ...supplierExpenses.map(
                          (x) => Number(x.total)
                        )
                      ) || 1;

                    const percentage =
                      (Number(item.total) /
                        max) *
                      100;

                    return (
                      <div key={index}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {item.supplier ||
                              "Inconnu"}
                          </span>

                          <span className="font-semibold text-slate-800">
                            {formatAmount(
                              Number(item.total)
                            )}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Evolution */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Dépenses au fil du temps
              </h2>

              <p className="text-sm text-slate-500">
                Évolution des montants des factures
              </p>
            </div>

            {dateExpenses.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            ) : (
              <div className="space-y-4">
                {dateExpenses.map(
                  (item, index) => {
                    const max =
                      Math.max(
                        ...dateExpenses.map(
                          (x) => Number(x.total)
                        )
                      ) || 1;

                    const percentage =
                      (Number(item.total) /
                        max) *
                      100;

                    return (
                      <div key={index}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {formatDate(
                              item.invoice_date
                            )}
                          </span>

                          <span className="font-semibold text-slate-800">
                            {formatAmount(
                              Number(item.total)
                            )}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* DERNIÈRE ANALYSE */}

        {invoice && (
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Dernière facture analysée
                </h2>

                <p className="text-sm text-slate-500">
                  Résultat de l&apos;analyse IA
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {invoice.status}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Fournisseur
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {invoice.supplier ||
                    "Non détecté"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Numéro
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {invoice.invoice_number ||
                    "Non détecté"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Montant
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatAmount(
                    invoice.total_amount,
                    invoice.currency || "TND"
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Date de facture
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatDate(
                    invoice.invoice_date
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Échéance
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatDate(
                    invoice.due_date
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  TVA
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {invoice.vat ||
                    "Non détectée"}
                </p>
              </div>
            </div>

            {/* Confidence */}

            <div className="mt-6 rounded-xl bg-blue-50 p-5">
              <div className="mb-2 flex justify-between">
                <span className="font-semibold text-blue-900">
                  Confiance de l&apos;analyse IA
                </span>

                <span className="font-bold text-blue-700">
                  {invoice.confidence ?? 0}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      invoice.confidence ?? 0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* TABLEAU DES FACTURES */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Factures analysées
            </h2>

            <p className="text-sm text-slate-500">
              Historique des factures enregistrées
            </p>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center">
              <p className="text-slate-500">
                Aucune facture analysée pour le moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="px-4 py-3">
                      Fournisseur
                    </th>

                    <th className="px-4 py-3">
                      N° facture
                    </th>

                    <th className="px-4 py-3">
                      Date
                    </th>

                    <th className="px-4 py-3">
                      Montant
                    </th>

                    <th className="px-4 py-3">
                      TVA
                    </th>

                    <th className="px-4 py-3">
                      Confiance
                    </th>

                    <th className="px-4 py-3">
                      Statut
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {item.supplier ||
                          "Non détecté"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.invoice_number ||
                          "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(
                          item.invoice_date
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {formatAmount(
                          item.total_amount,
                          item.currency || "TND"
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.vat || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-blue-600">
                          {item.confidence ?? 0}%
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

