import React from 'react';
import { DropdownContainer, Label, Select, LinkButton } from '../styles/Styledcomponents';

const TaskDropdown = ({
  selectedTask,
  onChange,
  tasks,
  onSaveSelection,
  taskProgress
}) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <DropdownContainer>
        <Label>Select a Task:</Label>
        <Select value={selectedTask} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>Select a Task</option>
          {tasks.map((task, idx) => (
            <option key={idx} value={task}>{task}</option>
          ))}
        </Select>
      </DropdownContainer>

      <LinkButton type="button" onClick={onSaveSelection}>
        Set as Default Selection
      </LinkButton>

      {selectedTask && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Weekly Consistency for: <i>{selectedTask}</i></h4>
          {taskProgress.map(({ week, percentage }) => (
            <div key={week} style={{ marginBottom: '0.75rem' }}>
              <strong>{week}</strong>
              <div style={{
                background: '#eee',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden',
                marginTop: '4px'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  backgroundColor: percentage > 70 ? '#4caf50' : '#ff9800',
                  height: '100%',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span>{percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskDropdown;
