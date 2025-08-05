// @ts-ignore
import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
// @ts-ignore
import Tooltip from "cal-heatmap/plugins/Tooltip";
import { useEffect, useState } from "react";
import { getDelayDataAsJSON } from "../util";

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
        const d = await getDelayDataAsJSON();
        console.log(d);
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

          locale: "de",
          timezone: "Europe/Berlin",
        },
        range: 1,
        scale: {
          color: {
            scheme: "reds",
            domain: [0, 17],
          },
        },
        domain: {
          type: "month",
          gutter: 0,
          label: { textAlign: "start" },
        },
        subDomain: { type: "day_row", width: 12, height: 60, gutter: 0 },
      },
      [
        [
          Tooltip,
          {
            text: function (_: any, value: any, dayjsDate: any) {
              if (dayjsDate.$d.getTime() < new Date().setHours(0))
                return (
                  (value ? value : "Keine") +
                  (value === 1 ? " Verspätung am " : " Verspätungen am ") +
                  dayjsDate.format("LL")
                );
              else return "Keine Daten";
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
        <div className="mb-8 ml-8 text-gray-900">
          <a
            className="rounded-md bg-gray-100 p-2 mr-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              heatmap.previous();
            }}
          >
            ← Zurück
          </a>
          <a
            className="rounded-md bg-gray-100 p-2 ml-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              heatmap.next();
            }}
          >
            Weiter →
          </a>
        </div>
      </div>
    );
}
