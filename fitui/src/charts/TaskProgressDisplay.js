import React from 'react';

const TaskProgressDisplay = ({ selectedTasks, taskProgress }) => {
  return (
    selectedTasks.length > 0 && (
      <div style={{ marginTop: '1rem' }}>
        <h4>Weekly Consistency for: <i>{selectedTasks.join(', ')}</i></h4>
        {taskProgress.map(({ week, percentage, task }) => {
          // Only show progress for the selected tasks
          if (selectedTasks.includes(task)) {
            return (
              <div key={week} style={{ marginBottom: '0.75rem' }}>
                <strong>{week}</strong>
                <div
                  style={{
                    background: '#eee',
                    borderRadius: '8px',
                    height: '12px',
                    overflow: 'hidden',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: percentage > 70 ? '#4caf50' : '#ff9800',
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span>{percentage}%</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    )
  );
};

export default TaskProgressDisplay;
