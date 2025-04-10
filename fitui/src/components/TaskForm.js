import React, { useState, useEffect } from 'react';
import { Input, SubmitButton } from '../styles/Styledcomponents'; // Removed unused imports
import TaskList from './TaskList';
import { updateChart, updateTotalJobsChart } from '../utils/dataUtils'; // Corrected imports
import axios from 'axios';
import { apiUrl } from '../api/api';

const TaskForm = ({
  formData,
  setFormData,
  setData,
  setChartData,
  setTotalJobsData,
  setErrorMessage,
  aggregationOption
}) => {
  const [loading, setLoadingState] = useState(false);
  const [checklist, setChecklist] = useState(formData.checklist || []); // Track checklist locally
  const [error, setError] = useState(''); // Local error state for handling form submission errors

  // Sync formData with checklist state to keep the UI in sync
  useEffect(() => {
    setChecklist(formData.checklist || []);
  }, [formData]);

  // Handle input change for calories burned
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes (update the checklist)
  const handleChecklistChange = (e, task) => {
    const { checked } = e.target;
    setChecklist((prevChecklist) =>
      prevChecklist.map((item) =>
        item.task === task ? { ...item, completed: checked } : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingState(true); // Start loading

    const currentDate = new Date();
    const payload = { ...formData, date: currentDate.toISOString(), checklist };

    try {
      // Send the updated checklist to the backend for the current day
      const response = await axios.post(`${apiUrl}/api/update-checklist`, { day: formData.day, checklist }, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Assuming the response data returns the updated checklist
      setFormData((prev) => ({ ...prev, checklist: response.data.checklist }));

      // Update the charts after submitting the form
      setData((prevData) => {
        const updatedData = [...prevData, response.data];
        updateChart(updatedData, setChartData);
        updateTotalJobsChart(updatedData, aggregationOption, setTotalJobsData);
        return updatedData;
      });

      setErrorMessage(''); // Clear error message
      setError(''); // Clear local error state
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Error saving data. Please try again.'); // Set error message
    } finally {
      setLoadingState(false); // End loading
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="number"
        name="caloriesBurned"
        value={formData.caloriesBurned}
        onChange={handleInputChange}
        placeholder="Enter Calories Burned"
        required
      />
      
      <TaskList
        formData={formData}
        setFormData={setFormData}
        checklist={checklist} // Pass the checklist for rendering
        handleChecklistChange={handleChecklistChange} // Handle task completion change
      />
      
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if present */}
      
      <SubmitButton type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </SubmitButton>
    </form>
  );
};

export default TaskForm;
