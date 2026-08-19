
export function normalizeDate(date: string | null): string | null {
  if (!date) return null;

  // Nettoyage des espaces et caractères OCR courants
  let value = date
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "/");

  if (!value) return null;

  // ============================================================
  // Mois français et anglais
  // ============================================================

  const months: Record<string, string> = {
    // Français
    janvier: "01",
    janv: "01",
    jan: "01",

    février: "02",
    fevrier: "02",
    févr: "02",
    fevr: "02",
    fév: "02",
    fev: "02",
    feb: "02",

    mars: "03",
    mar: "03",

    avril: "04",
    avr: "04",
    apr: "04",

    mai: "05",

    juin: "06",
    jun: "06",

    juillet: "07",
    juil: "07",
    jul: "07",

    août: "08",
    aout: "08",
    
    aug: "08",

    septembre: "09",
    sept: "09",
    sep: "09",

    octobre: "10",
    oct: "10",

    novembre: "11",
    nov: "11",

    décembre: "12",
    decembre: "12",
    déc: "12",
    dec: "12",
    

    // Anglais
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  // ============================================================
  // Fonction de validation
  // ============================================================

  function buildValidDate(
    year: number,
    month: number,
    day: number
  ): string | null {
    // Année sur 2 chiffres
    if (year < 100) {
      year += year >= 50 ? 1900 : 2000;
    }

    // Vérification basique
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const dateObj = new Date(
      Date.UTC(year, month - 1, day)
    );

    // Vérification réelle de la date
    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== month - 1 ||
      dateObj.getUTCDate() !== day
    ) {
      return null;
    }

    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  // ============================================================
  // 1. Format YYYY-MM-DD
  //    YYYY/MM/DD
  //    YYYY.MM.DD
  // ============================================================

  let match = value.match(
    /^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/
  );

  if (match) {
    const [, year, month, day] = match;

    return buildValidDate(
      Number(year),
      Number(month),
      Number(day)
    );
  }

  // ============================================================
  // 2. Format DD/MM/YYYY
  //    DD-MM-YYYY
  //    DD.MM.YYYY
  //    DD/MM/YY
  // ============================================================

  match = value.match(
    /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/
  );

  if (match) {
    const [, day, month, year] = match;

    return buildValidDate(
      Number(year),
      Number(month),
      Number(day)
    );
  }

  // ============================================================
  // 3. Format avec mois écrit
  //
  // 28 novembre 2019
  // 28 nov 2019
  // 28 November 2019
  // 28 Nov 2019
  // ============================================================

  match = value.match(
    /^(\d{1,2})\s+([a-zA-ZÀ-ÿ]+)\s+(\d{2,4})$/i
  );

  if (match) {
    const [, day, monthName, year] = match;

    const normalizedMonth = monthName
      .toLowerCase()
      .replace(/\./g, "");

    const month = months[normalizedMonth];

    if (!month) {
      return null;
    }

    return buildValidDate(
      Number(year),
      Number(month),
      Number(day)
    );
  }

  // ============================================================
  // 4. Format avec mois écrit :
  //    novembre 28 2019
  //    November 28, 2019
  // ============================================================

  match = value.match(
    /^([a-zA-ZÀ-ÿ]+)\s+(\d{1,2}),?\s+(\d{2,4})$/i
  );

  if (match) {
    const [, monthName, day, year] = match;

    const normalizedMonth = monthName
      .toLowerCase()
      .replace(/\./g, "");

    const month = months[normalizedMonth];

    if (!month) {
      return null;
    }

    return buildValidDate(
      Number(year),
      Number(month),
      Number(day)
    );
  }

  return null;
}

