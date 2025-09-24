import { useEffect, useState } from "react";
import "chartjs-adapter-date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  defaults,
} from "chart.js";
import type { ChartOptions, ChartData } from "chart.js";
import { Line } from "react-chartjs-2";

defaults.font.family = "Menlo";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

type Props = {
  passedData: { x: string; y: number }[];
};

export default function VerspaetungenChart({ passedData }: Props) {
  const [data, setData] = useState<ChartData<"line", { x: string; y: number }[]>>({
    datasets: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const chartData: ChartData<"line", { x: string; y: number }[]> = {
          datasets: [
            {
              data: passedData,
              borderColor: "rgba(255, 255, 255, 0.63)",
              backgroundColor: "white",
              tension: 0.3,
            },
          ],
        };
        setData(chartData);
      } catch (err) {
        setError("Fehler beim Laden der Daten");
      }
    };
    loadData();
  }, []);

  const options: ChartOptions<"line"> = {
    layout: {
      padding: {
        top: 20,
        right: 0,
        bottom: 20,
        left: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        type: "time" as const,
        time: {
          unit: "day",
          tooltipFormat: "dd.MM.yyyy",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      y: {
        border: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        title: {
          display: true,
          text: "Verspätungen",
          color: "#ffffff",
          font: {
            size: 16,
          },
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
  };
  if (!error)
    return (
      <div className="max-w-4xl">
        <Line data={data} options={options} />
      </div>
    );
}
