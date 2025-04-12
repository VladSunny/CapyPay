import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ chartTitle, chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };

  return (
    <div className="w-full bg-base-200 flex flex-row justify-center md:p-5 rounded-2xl" style={{ minHeight: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;