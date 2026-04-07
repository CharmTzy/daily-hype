// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartEvent, ActiveElement } from "chart.js";
import clsx from "clsx";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IBarChartProps {
  chartTitle?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
  }[];
  onClick?: (x: string, y: number, label: string) => void;
  className?: string;
}

export default function BarChart({ chartTitle = "Bar Chart", labels, datasets, onClick, className = "" }: IBarChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements && elements.length > 0) {
        const clickedDatasetIndex = elements[0].datasetIndex;
        const clickedIndex = elements[0].index;

        const clickedX = data.labels[clickedIndex];
        const clickedY = datasets[clickedDatasetIndex].data[clickedIndex];
        const clickedLabel = datasets[clickedDatasetIndex].label;

        if (onClick) {
          onClick(clickedX, clickedY, clickedLabel);
        }
      }
    },
  };

  const data = {
    labels,
    datasets: datasets,
  };

  return (
    <div className={clsx("w-full p-5", className)}>
      <Bar options={options} data={data} />
    </div>
  );
}
