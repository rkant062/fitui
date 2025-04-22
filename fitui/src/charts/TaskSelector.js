import React, { useState, useEffect } from 'react';

const TaskSelector = ({ uniqueTasks, onSaveSelection, selectedTasks, setSelectedTasks }) => {
  
  // Handle multiple task selection/deselection
  const handleSelectionChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    // Ensure no more than 3 tasks are selected
    if (selected.length <= 3) {
      setSelectedTasks(selected);
    }
  };

  // Save the selected tasks
  const saveSelection = () => {
    // Ensure selectedTasks is updated before passing to onSaveSelection
    onSaveSelection(selectedTasks);  // This will call the parent handler
    localStorage.setItem('selectedTasks', JSON.stringify(selectedTasks));
    alert('Task selection saved!');
  };

  useEffect(() => {
    // Ensure that initial selection is fetched from localStorage
    const savedTasks = localStorage.getItem('selectedTasks');
    if (savedTasks) {
      setSelectedTasks(JSON.parse(savedTasks));
    }
  }, [setSelectedTasks]); // Only run on initial mount or when setSelectedTasks changes

  return (
    <div>
      <label>Select up to 3 tasks:</label>
      <select
        multiple
        value={selectedTasks}
        onChange={handleSelectionChange}
      >
        {uniqueTasks.map((task, i) => (
          <option key={i} value={task}>
            {task}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={saveSelection} disabled={selectedTasks.length === 0}>
          Save Selection
        </button>
      </div>
    </div>
  );
};

export default TaskSelector;
