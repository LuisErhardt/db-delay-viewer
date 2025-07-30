import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import { useEffect, useState } from "react";
import { loadDelayData } from "../util";

let dayRowTemplate = (dateHelper: any, { domain }: any) => ({
  name: "day_row",
  allowedDomainType: ["month"],
  rowsCount() {
    return 1;
  },
  columnsCount(d: any) {
    return domain.dynamicDimension ? dateHelper.date(d).endOf("month").date() : 31;
  },
  mapping: (startDate: any, endDate: any, defaultValues: any) => {
    return dateHelper.intervals("day", startDate, dateHelper.date(endDate)).map((d: any, index: any) => ({
      t: d,
      x: index,
      y: 0,
      ...defaultValues,
    }));
  },

  format: {
    date: "Do",
    legend: "Do",
  },
  extractUnit(d: any) {
    return dateHelper.date(d).startOf("day").valueOf();
  },
});

interface TagesVerspaetung {
  datum: string;
  verspaetungen: number;
}

export default function Heatmap() {
  const [data, setData] = useState<TagesVerspaetung[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<CalHeatmap | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const d = await loadDelayData();
        setData(d);
      } catch (err) {
        setError("Fehler beim Laden der Daten");
      }
    };
    loadData();
    setHeatmap(new CalHeatmap());
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    heatmap.addTemplates(dayRowTemplate);
    heatmap.paint(
      {
        data: { source: data, x: "datum", y: "verspaetungen" },
        date: {
          start: new Date(data[0]["datum"]),
          min: new Date(data[0]["datum"]),
          max: new Date(),
          locale: "de",
          timezone: "Europe/Berlin",
        },
        range: 3,
        scale: {
          color: {
            scheme: "Oranges",
            domain: [1, 17],
          },
        },
        domain: {
          type: "month",
          gutter: 0,
          label: { textAlign: "start" },
        },
        subDomain: { type: "day_row", width: 6, height: 50, gutter: 0 },
      },
      [
        [
          Tooltip,
          {
            text: function (date: any, value: any, dayjsDate: any) {
              return (value ? value : "Keine") + " Verspätungen am " + dayjsDate.format("LL");
            },
          },
        ],
      ]
    );
  }, [data]);
  if (!error)
    return (
      <div className="max-w-full overflow-x-auto">
        <div className="my-5" id="cal-heatmap"></div>
        <div className="my-4 text-xs ml-8">
          <a
            className="rounded-md bg-gray-200 p-2 mr-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              cal.previous();
            }}
          >
            ← Previous
          </a>
          <a
            className="rounded-md bg-gray-200 p-2 ml-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              cal.next();
            }}
          >
            Next →
          </a>
        </div>
      </div>
    );
}
