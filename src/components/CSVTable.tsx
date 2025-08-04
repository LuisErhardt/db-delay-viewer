import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { useParams, Link } from "react-router-dom";
import { dateInNameUmwandeln } from "../util";

interface CSVRow {
  [key: string]: string;
}

const CSVTable: React.FC = () => {
  const { year, filename } = useParams<{ year: string; filename: string }>();
  const [data, setData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year || !filename) {
      setError("Ungültige Parameter");
      return;
    }

    const fetchCSV = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`data/${year}/delays${filename}.csv`);
        if (response.headers.get("Content-Type") === "text/html; charset=utf-8")
          throw new Error("Datei nicht gefunden");
        const csvText = await response.text();
        const parsed = Papa.parse<CSVRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsed.meta.fields) {
          setHeaders(parsed.meta.fields);
        }

        setData(parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    };

    fetchCSV();
  }, [year, filename]);

  async function doClick() {
    if (filename) {
      try {
        const csv = Papa.unparse(data, {
          delimiter: ";",
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        a.click();

        window.URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        alert("Datei konnte nicht heruntergeladen werden.");
      }
    }
  }

  if (loading) return <p className="p-4">Lade Daten...</p>;
  if (error) return <p className="p-4 text-red-600">Fehler: {error}</p>;

  return (
    <div className="">
      <Link to="/" className="text-[#fbaf08] hover:underline mb-4 inline-block">
        &larr; Zurück zur Übersicht
      </Link>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 ">
        Verspätungen (mind. 60 min) im {filename ? dateInNameUmwandeln(filename) : ""} {year ? year : ""}
      </h2>
      <button
        className="mb-4 px-4 py-2 bg-[#00a0a0] text-white rounded hover:bg-[#008585]"
        onClick={async () => {
          doClick();
        }}
      >
        Daten als CSV herunterladen
      </button>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-300 shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-gray-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white">
                {headers.map((header) => (
                  <td key={header} className="whitespace-nowrap px-4 py-2 text-gray-800">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSVTable;
