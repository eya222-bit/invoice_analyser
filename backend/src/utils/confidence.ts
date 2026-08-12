

interface InvoiceData {
  supplier?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  vat?: number | string | null;
}

export function calculateConfidence(data: InvoiceData): number {
  let score = 0;

  // ============================================================
  // 1. SUPPLIER → 15 points
  // ============================================================

  if (
    data.supplier &&
    typeof data.supplier === "string" &&
    data.supplier.trim().length >= 2
  ) {
    score += 15;
  }

  // ============================================================
  // 2. INVOICE NUMBER → 15 points
  // ============================================================

  if (
    data.invoice_number &&
    typeof data.invoice_number === "string" &&
    data.invoice_number.trim().length >= 2
  ) {
    score += 15;
  }

  // ============================================================
  // 3. INVOICE DATE → 15 points
  // ============================================================

  if (isValidDate(data.invoice_date)) {
    score += 15;
  }

  // ============================================================
  // 4. DUE DATE → 10 points
  // ============================================================

  if (isValidDate(data.due_date)) {
    score += 10;
  }

  // ============================================================
  // 5. TOTAL AMOUNT → 20 points
  // ============================================================

  const totalAmount = toNumber(data.total_amount);

  if (totalAmount !== null && totalAmount >= 0) {
    score += 20;
  }

  // ============================================================
  // 6. CURRENCY → 10 points
  // ============================================================

  if (isValidCurrency(data.currency)) {
    score += 10;
  }

  // ============================================================
  // 7. VAT → 15 points
  // ============================================================

  const vat = toNumber(data.vat);

  if (vat !== null && vat >= 0) {
    score += 15;
  }

  // ============================================================
  // 8. COHÉRENCE DATE FACTURE / DATE ÉCHÉANCE
  // ============================================================

  // Bonus/malus intégré dans les 100 points.
  // Si les deux dates existent, l'échéance ne devrait normalement
  // pas être avant la date de facture.

  if (
    data.invoice_date &&
    data.due_date &&
    isValidDate(data.invoice_date) &&
    isValidDate(data.due_date)
  ) {
    const invoiceDate = new Date(data.invoice_date);
    const dueDate = new Date(data.due_date);

    if (dueDate >= invoiceDate) {
      // Les dates sont cohérentes → aucun changement
    } else {
      // Incohérence → retirer 5 points
      score -= 5;
    }
  }

  // ============================================================
  // 9. COHÉRENCE DU VAT
  // ============================================================

  if (vat !== null) {
    // Une TVA négative est impossible
    if (vat < 0) {
      score -= 10;
    }

    // Une TVA extrêmement élevée est suspecte
    if (vat > 1000000) {
      score -= 5;
    }
  }

  // ============================================================
  // LIMITER LE SCORE ENTRE 0 ET 100
  // ============================================================

  score = Math.max(0, Math.min(100, score));

  return Number(score.toFixed(2));
}


// ============================================================
// Convertir une valeur en nombre
// ============================================================

function toNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

    if (!cleaned) {
      return null;
    }

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;
  }

  return null;
}


// ============================================================
// Vérifier une date YYYY-MM-DD
// ============================================================

function isValidDate(date: string | null | undefined): boolean {
  if (!date || typeof date !== "string") {
    return false;
  }

  // On attend ici la date déjà normalisée
  // par normalizeDate()
  const match = date.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;

  const dateObject = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );

  return (
    dateObject.getUTCFullYear() === Number(year) &&
    dateObject.getUTCMonth() === Number(month) - 1 &&
    dateObject.getUTCDate() === Number(day)
  );
}


// ============================================================
// Vérifier la devise
// ============================================================

function isValidCurrency(
  currency: string | null | undefined
): boolean {
  if (!currency || typeof currency !== "string") {
    return false;
  }

  const value = currency.trim().toUpperCase();

  // Principales devises utilisées dans les factures
  const validCurrencies = [
    "TND",
    "EUR",
    "USD",
    "GBP",
    "CHF",
    "CAD",
    "AUD",
    "MAD",
    "DZD",
    "AED",
    "SAR",
    "JPY",
    "CNY",
  ];

  return validCurrencies.includes(value);
}

