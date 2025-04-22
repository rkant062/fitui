import React from 'react';

const CompletedTasksList = ({ tasks }) => {
  const completed = tasks.filter(item => item.completed);

  if (completed.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <h4 style={{ margin: '0' }}>✅ Completed Tasks:</h4>
      <ul style={{ paddingLeft: '20px' }}>
        {completed.map(item => (
          <li key={item._id} style={{ textDecoration: 'line-through', opacity: 0.7 }}>
            {item.task}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletedTasksList;
