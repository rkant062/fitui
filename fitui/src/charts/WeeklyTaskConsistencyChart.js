import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyTaskConsistencyChart = ({ data, selectedTasks, onClick }) => {
  // Format the data into percentages for each task
  const formattedData = selectedTasks.map((task) => {
    const taskData = data.map((entry) => {
      const taskCompleted = entry.checklist.filter(item => item.task === task);
      const completed = taskCompleted.length > 0 && taskCompleted[0].completed;
      return completed;
    });

    const green = taskData.filter(completed => completed).length;
    const red = taskData.length - green;
    const total = taskData.length;

    return {
      task,
      green: (green / total) * 100,
      red: (red / total) * 100,
      total,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="task" />
        <YAxis />
        <Tooltip />
        <Legend />
        
        {formattedData.map((taskData) => (
          <>
            <Bar
              key={`${taskData.task}-green`}
              dataKey="green"
              stackId="a"
              fill="#4caf50"
              onClick={() => onClick(taskData.task, 'green')}  // Pass taskData.task here
            />
            <Bar
              key={`${taskData.task}-red`}
              dataKey="red"
              stackId="a"
              fill="#ff9800"
              onClick={() => onClick(taskData.task, 'red')}  // Pass taskData.task here
            />
          </>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyTaskConsistencyChart;
