import React, { useEffect, useState } from "react";
import { dateInNameUmwandeln } from "../util";
import Heatmap from "./Heatmap";

type YearMonthMap = {
  [year: string]: string[];
};

const LandingPage: React.FC = () => {
  const [files, setFiles] = useState<YearMonthMap>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/fileList.json`);
        const data = await response.json();
        // console.log(data);
        setFiles(data);
      } catch (error) {
        console.log(error);
        setError("Error while loading data");
      }
    };

    fetchFiles();
  }, []);

  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="p-4 max-w-3xl">
      <h1 className="text-2xl font-semibold py-4">Verspätungen im Regionalverkehr in Köln Hbf</h1>
      <p>
        Inspiriert durch diesen{" "}
        <a
          className="text-blue-700"
          href="https://www.reddit.com/r/deutschebahn/comments/1evid66/deutschlandticket_entsch%C3%A4digungen_beantragen/"
        >
          Reddit-Thread
        </a>
        .
      </p>
      <p className="mb-6">
        Die Seite zeigt Züge im Regionalverkehr mit mindestens 60 Minuten Verspätung bei ihrer Ankunft in Köln Hbf an.
        Die Daten werden täglich aktualisiert und können direkt monatsweise als Tabelle heruntergeladen werden.
      </p>
      <ul className="max-w-md border border-gray-300 rounded-md bg-white shadow space-y-1">
        {Object.entries(files).map(([year, months]) => (
          <li key={year}>
            <div className="font-bold px-4 py-2">{year}</div>
            <ul className="space-y-1 pl-4">
              {months.map((month) => (
                <li key={month}>
                  <a
                    href={`/#/${year}/${encodeURIComponent(month)}`}
                    className="block px-4 py-2 rounded hover:bg-blue-100 hover:text-blue-700 font-semibold"
                  >
                    {dateInNameUmwandeln(month)}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Heatmap />
    </div>
  );
};

export default LandingPage;
