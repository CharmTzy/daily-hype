// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartEvent, ActiveElement } from "chart.js";
import { Line } from "react-chartjs-2";
import clsx from "clsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ILineChartProps {
  chartTitle?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  onClick?: (x: string, y: number, label: string) => void;
  className?: string;
}

export default function LineChart({ chartTitle = "Line Chart", labels, datasets, onClick, className = "" }: ILineChartProps) {
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

        // Access the value of the clicked element
        const clickedValue = datasets[clickedDatasetIndex].data[clickedIndex];

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
      <Line options={options} data={data} />
    </div>
  );
}
