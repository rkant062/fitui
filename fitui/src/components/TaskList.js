import React, { useState, useEffect } from 'react';
import { ChecklistItem, NewTaskInput, AddNewTaskButton } from '../styles/Styledcomponents'; // Assuming you have styled components for inputs and buttons

const TaskList = ({ formData, setFormData, setLoading, setErrorMessage }) => {
  const [newTask, setNewTask] = useState(""); // To store new task input
  const [checklist, setChecklist] = useState(formData.checklist || []); // Keep track of the checklist

  useEffect(() => {
    setChecklist(formData.checklist || []);
  }, [formData]);

  const handleChecklistChange = (e, task) => {
    const { checked } = e.target;
    const updatedChecklist = checklist.map((item) =>
      item.task === task ? { ...item, completed: checked } : item
    );
    setChecklist(updatedChecklist);
    setFormData((prev) => ({
      ...prev,
      checklist: updatedChecklist,
    }));
  };

  const handleAddNewTask = async () => {
    if (!newTask.trim()) return; // Don't add empty tasks

    const newTaskItem = { task: newTask, completed: false };

    // Add the new task to the checklist and update formData
    const updatedChecklist = [...checklist, newTaskItem];
    setChecklist(updatedChecklist);
    setFormData((prev) => ({
      ...prev,
      checklist: updatedChecklist,
    }));

    // Clear the input field
    setNewTask("");

    // Send request to add this task to the backend if necessary
    try {
      setLoading(true);
      const response = await fetch('/api/add-checklist-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: newTask,
          // You may need to add other fields such as "day" or user identification here
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.message || 'Error adding task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Error adding task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Select Your Activities:</h3>
      {checklist.map((item) => (
        <ChecklistItem key={item.task}>
          <input
            type="checkbox"
            id={item.task}
            checked={item.completed}
            onChange={(e) => handleChecklistChange(e, item.task)}
          />
          <span>{item.task}</span>
        </ChecklistItem>
      ))}

      <div>
        <NewTaskInput
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <AddNewTaskButton onClick={handleAddNewTask}>Add Task</AddNewTaskButton>
      </div>
    </div>
  );
};

export default TaskList;
