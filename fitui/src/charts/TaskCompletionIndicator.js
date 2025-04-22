import React from 'react';
import styled from 'styled-components';

const getColor = (progress) => {
    if (progress === 1) return '#00c853';      // Bright green
    if (progress >= 0.75) return '#a2d729';    // Lime
    if (progress >= 0.5) return '#ffd700';     // Gold
    if (progress >= 0.3) return '#ffb347';     // Orange
    if (progress >= 0.1) return '#ff6f61';     // Coral
    return '#fff';                          
  };

const TaskSquare = styled.div`
  width: auto;
  height: auto;
  border-radius: 12px;
  color: ${({ progress }) => (progress >= 0.5 ? '#000' : '#fff')};
  background-color: ${({ progress }) => getColor(progress) + 'dd'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease;
  padding: 10px;
`;

const MotivationalText = styled.div`
  font-size: 0.85rem;
  margin-top: 4px;
  opacity: 0.85;
`;


const TaskCompletionIndicator = ({ checklist }) => {
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(task => task.completed).length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const getMotivation = (progress) => {
    if (progress === 1) return '✅ All done! You crushed it!';
    if (progress >= 0.75) return '💪 Almost there!';
    if (progress >= 0.5) return '🔥 Keep it rolling!';
    if (progress >= 0.3) return '🚀 You’re building momentum!';
    if (progress > 0) return '⚡ Let’s get moving!';
    return 'Ready to conquer the day?';
  };

  return (
    <TaskSquare progress={progress}>
      <div>{totalTasks - completedTasks} / {totalTasks} tasks left</div>
      <MotivationalText>{getMotivation(progress)}</MotivationalText>
    </TaskSquare>
  );
};

export default TaskCompletionIndicator;
