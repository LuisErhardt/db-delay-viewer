import Papa from "papaparse";

const monate: string[] = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function dateInNameUmwandeln(dateiName: string): string {
  const match = dateiName.match(/(\d{2})/);
  if (!match) return dateiName;

  const monatNummer: number = parseInt(match[1], 10);
  if (monatNummer < 1 || monatNummer > 12) return dateiName;

  const monatName: string = monate[monatNummer - 1];
  return monatName;
}

type YearMonthMap = {
  [year: string]: string[];
};

async function mergeCSVs(): Promise<string> {
  let data = "";
  const response = await fetch(`fileList.json`);
  const files: YearMonthMap = await response.json();

  for (const [year, months] of Object.entries(files)) {
    for (const month of months) {
      const res = await fetch(`data/${year}/delays${month}.csv`);
      if (res.headers.get("Content-Type") === "text/html; charset=utf-8") throw new Error("Datei nicht gefunden");
      const text = await res.text();
      data += text;
    }
  }

  return data;
}

interface TagesVerspaetung {
  datum: string;
  verspaetungen: number;
}

export async function getDelayDataAsJSON(): Promise<TagesVerspaetung[]> {
  const tagesMap: Record<string, number> = {};

  const csvText = await mergeCSVs();

  const parsed = Papa.parse(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV-Fehler: ${parsed.errors.map((e) => e.message).join(", ")}`);
  }

  const rows = parsed.data as any[];

  let lastDateInserted: Date | null = null;

  for (const row of rows) {
    const zeit = row["Ankunft_tatsächlich"];
    const [datePart, _] = zeit.split(", ");
    const [day, month, year] = datePart.split(".");
    const datum = `${year}-${month}-${day}T01:00:00.000Z`;

    if (lastDateInserted && lastDateInserted.getDate() != new Date(datum).getDate()) {
      // Differenz in Millisekunden
      const diffInMs = Math.abs(new Date(datum).getTime() - lastDateInserted.getTime());
      // Differenz in Tagen
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays > 1) {
        // Füge fehlende Tage hinzu
        for (let i = 1; i < diffInDays; i++) {
          const missingDate = new Date(lastDateInserted);
          missingDate.setDate(missingDate.getDate() + i);
          const formattedMissingDate = missingDate.toISOString();
          tagesMap[formattedMissingDate] = 0;
        }
      }
    }
    tagesMap[datum] = (tagesMap[datum] || 0) + 1;

    lastDateInserted = new Date(datum);
  }

  return Object.entries(tagesMap).map(([datum, verspaetungen]) => ({
    datum,
    verspaetungen,
  }));
}

export function parseDate(input: string): Date | null {
  const parts = input.match(/(\d+)/g);
  if (!parts || parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}
