import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ chartTitle, chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Позволяет лучше контролировать высоту
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif", // Современный шрифт
          },
          color: '#374151', // Темно-серый для текста
          padding: 10,
        },
      },
      title: {
        display: true,
        text: chartTitle, // Используем переданный заголовок
        font: {
          size: 20,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        color: '#1F2937', // Темный цвет для заголовка
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Убираем сетку по X для чистоты
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#4B5563', // Серый для меток
        },
      },
      y: {
        grid: {
          color: '#E5E7EB', // Светло-серая сетка
          borderDash: [5, 5], // Пунктирная сетка
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#4B5563',
          beginAtZero: true, // Начинаем с нуля
        },
      },
    },
    animation: {
      duration: 1000, // Плавная анимация
      easing: 'easeOutQuart',
    },
  };

  return (
    <div
      className="w-full bg-base-100 border-2 border-secondary rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 transition-all duration-300 hover:shadow-xl animate-fade-in"
      style={{ minHeight: '400px', maxWidth: '100%' }} // Увеличиваем высоту для читаемости
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;