import React from 'react';

const WeeklyGoalTracker = ({ categoryName, spent, budget }) => {
  const percentage = budget ? Math.min((spent / budget) * 100, 150) : 0;
  const isOverBudget = spent > budget;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {categoryName} — {spent}/{budget}
      </div>

      <div style={{
        height: '20px',
        width: '100%',
        backgroundColor: '#ddd',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: isOverBudget ? '#f44336' : '#4CAF50',
            transition: 'width 0.7s ease',
          }}
        />
      </div>

      <div style={{ fontSize: '0.75rem', marginTop: 4, color: isOverBudget ? '#f44336' : '#666' }}>
        {isOverBudget
          ? 'Over budget! 😬'
          : percentage >= 100
            ? 'Goal complete! 🎯'
            : `Used ${Math.floor(percentage)}%`}
      </div>
    </div>
  );
};

export default WeeklyGoalTracker;
