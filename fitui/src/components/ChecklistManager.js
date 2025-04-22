import React from 'react';
import axios from 'axios';
import {
  NewTaskInput,
  AddNewTaskButton,
  CheckList,
  ChecklistItem,
  DeleteIcon,
  LinkButton,
  Label
} from '../styles/Styledcomponents';

const ChecklistManager = ({
  checklistItems,
  newTask,
  setNewTask,
  setChecklistItems,
  setProgressColor,
  setErrorMessage,
  userId,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleNewTaskChange = (e) => setNewTask(e.target.value);

  const getColor = (progress) => {
    if (progress === 1) return '#00c853';
    if (progress >= 0.75) return '#a2d729';
    if (progress >= 0.5) return '#ffd700';
    if (progress >= 0.3) return '#ffb347';
    if (progress >= 0.1) return '#ff6f61';
    return '#ff4c4c';
  };

  const setProgress = (checklist) => {
    const totalTasks = checklist.length;
    const completedTasks = checklist.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    setProgressColor(getColor(progress) + 'dd');
  };

  const handleAddNewTask = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || !newTask) return;

    try {
      const res = await axios.post(`${apiUrl}/api/checklist/add`, { task: newTask }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChecklistItems(res.data.checklist || []);
      setProgress(res.data.checklist || []);
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
      setErrorMessage('Failed to add task.');
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    const token = localStorage.getItem('auth_token');
    if (!token || !userId) return;

    try {
      const res = await axios.delete(`${apiUrl}/api/checklist/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { task: taskToDelete.task },
      });

      setChecklistItems(res.data.checklist || []);
      setProgress(res.data.checklist || []);
    } catch (error) {
      console.error('Error deleting task from server:', error);
      setErrorMessage('Failed to delete task.');
    }
  };

  const handleSetDefaultChecklist = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await axios.patch(
        `${apiUrl}/api/checklist/update`,
        { checklist: checklistItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('Checklist set as default successfully!');
      } else {
        alert(response.data.message || 'Failed to update default checklist');
      }
    } catch (error) {
      console.error('Error updating default checklist:', error);
      alert('Something went wrong while setting the default checklist.');
    }
  };

  return (
    <div>
      <h3>Select Your Activities:</h3>
      <div>
        <NewTaskInput
          type="text"
          value={newTask}
          onChange={handleNewTaskChange}
          placeholder="Add new task"
        />
        <AddNewTaskButton type="button" onClick={handleAddNewTask}>
          Add Task
        </AddNewTaskButton>
        <LinkButton type="button" onClick={handleSetDefaultChecklist}>
          Set as Default Checklist
        </LinkButton>
      </div>

      {checklistItems.filter(item => !item.completed).length > 0 ? (
        checklistItems.filter(item => !item.completed).map((item) => (
          <CheckList key={item._id}>
            <ChecklistItem>
              <input
                type="checkbox"
                disabled
                checked={false}
                onChange={() => {}}
              />
              <span>{item.task}</span>
            </ChecklistItem>
            <DeleteIcon onClick={() => handleDeleteTask(item)}>
              <img
                src="https://img.icons8.com/?size=15&id=99961&format=png&color=9f9f9f"
                alt="delete"
              />
            </DeleteIcon>
          </CheckList>
        ))
      ) : (
        <p>No checklist items. Add a new one above.</p>
      )}
    </div>
  );
};

export default ChecklistManager;
