import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressCharts = ({ chartData, calorieData }) => {
  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Calories Burned Over Time',
        data: calorieData,
        borderColor: '#76c7c0',
        backgroundColor: 'rgba(118, 199, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h3>Progress Over Time</h3>
      <Line data={lineChartData} />
    </div>
  );
};

export default ProgressCharts;
