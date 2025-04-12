import React from 'react';
import { Pie } from 'react-chartjs-2';
import { 
    Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    Tooltip,
    Legend,
    ArcElement
);

const PieChart = ({ chartTitle, chartData }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
            position: 'top',
            },
            title: {
            display: true,
            text: chartTitle,
            },
        },
        }
    

    return (
        <div className="flex flex-row justify-center w-full bg-base-100 border-2 border-secondary rounded-2xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl animate-fade-in">
        <Pie data={chartData} options={options} />
        </div>
    );
};

export default PieChart;