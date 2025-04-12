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

import "../styles/LineChart.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ chartTitle, chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#1F2937', // Темно-серый для читаемости
          padding: 20,
        },
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 20,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        color: '#1F2937',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Убираем вертикальные линии сетки
        },
        ticks: {
          color: '#4B5563',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Легкая сетка
          borderDash: [5, 5], // Пунктирная линия
        },
        ticks: {
          color: '#4B5563',
          font: {
            size: 12,
          },
          padding: 10,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Плавные линии
        borderWidth: 3, // Толщина линии
      },
      point: {
        radius: 5, // Размер точек
        hoverRadius: 8, // Увеличение при наведении
        backgroundColor: '#fff', // Белый фон точек
        borderWidth: 2, // Обводка точек
      },
    },
    animation: {
      duration: 1000, // Плавная анимация загрузки
      easing: 'easeOutQuart',
    },
  };

  return (
    <div
      className="w-full bg-base-100 border-2 border-secondary rounded-2xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl animate-fade-in"
      style={{ minHeight: '350px' }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;