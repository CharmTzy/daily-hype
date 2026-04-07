// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import clsx from "clsx";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface IPieChartProps {
  chartTitle?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
  onClick?: (value: number) => void;
  className?: string;
}

export default function PieChart({ chartTitle = "Pie Chart", labels, datasets, onClick, className = "" }: IPieChartProps) {
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
  };

  const data = {
    labels,
    datasets: datasets,
  };

  return (
    <div className={clsx("w-[70%] mx-auto p-5 mt-4", className)}>
      <Pie options={options} data={data} />
    </div>
  );
}
