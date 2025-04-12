import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const BarChart = ({ chartTitle, chartData }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
            position: 'top',
            },
            title: {
            display: true,
            text: 'Chart.js Bar Chart',
            },
        },
    }

  return (
    <div
      className="w-full bg-base-100 border-2 border-secondary rounded-2xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl animate-fade-in"
      style={{ minHeight: '350px' }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;