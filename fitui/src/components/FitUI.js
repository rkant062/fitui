import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import { groupByDay, groupByWeek, groupByMonth } from './Aggregation'
import Login from './Login'; // Add this import
import AppLayout from './AppLayout';
import TaskCompletionIndicator from '../charts/TaskCompletionIndicator';
import {
  Header,
  Caption,
    LinkButton,
  Container,
  Form,
  Input,
  ChecklistItem,
  NewTaskInput,
  AddNewTaskButton,
  SubmitButton,
  TaskWrapper,
  ChartWrapper,
  ChartTitle,
  CheckList,
  Label,
  ChartContainer,
  RefreshButton,
  AggregationSelect,
  LoginForm,
  LoginButton
} from '../styles/Styledcomponents';
import Spinner from './Spinner';

const apiUrl = process.env.REACT_APP_API_URL;

const DeleteIcon = styled.span`
  color: black;
  cursor: pointer;
  float: right;
  &:hover {
    color: darkred;
  }
    
`;


const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fafafa;
  color: #333;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4caf50;
    outline: none;
  }

  option {
    padding: 10px;
  }
`;

const DropdownContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;


const FitUI = ({ onLogout }) => {
 

  const [formData, setFormData] = useState({ caloriesBurned: 0, checklist: [] });
  const [checklistItems, setChecklistItems] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [data, setData] = useState([]);
  const [dataVerb, setdataVerb] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [totalJobsData, setTotalJobsData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aggregationOption, setAggregationOption] = useState('daily');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [taskProgress, setTaskProgress] = useState([]); // array of { week, percentage }
const [selectedTask, setSelectedTask] = useState(''); // selected task for progress tracking
const [progressColor, setProgressColor] = useState(''); // default color

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserName = localStorage.getItem('user_name');
    const selectedTasks = localStorage.getItem('selectedTasks');

    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName || '');
      setIsLoggedIn(true);
    }
    if (selectedTasks) {
      setSelectedTask(selectedTasks.trim());
      console.log('Selected tasks from localStorage:', selectedTasks);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
      fetchChartData();
    }
  }, [userId]);
  

  useEffect(() => {
    if (dataVerb?.length > 0) {
      updateChart(dataVerb, aggregationOption);
      updateTotalJobsChart(dataVerb, aggregationOption);
    }
  }, [dataVerb, aggregationOption]);

  useEffect(() => {
    if (selectedTask && dataVerb.length > 0) {
      handleTaskChange(selectedTask);
    }
  }, [selectedTask, dataVerb]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleChecklistChange = (e, item) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      checklist: checked
        ? [...prev.checklist, item]
        : prev.checklist.filter(i => i !== item),
    }));
  };

  const handleNewTaskChange = (e) => setNewTask(e.target.value);

  const handleAddNewTask = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || !newTask) return;
  
    try {
      const res = await axios.post(`${apiUrl}/api/checklist/add`, { task: newTask }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setChecklistItems(res.data.checklist || []);
      setProgress(res.data.checklist || []);
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
      setErrorMessage('Failed to add task.');
    }
  };

  const setProgress = (checklist) => {
    const totalTasks = checklist.length;
    const completedTasks = checklist.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  setProgressColor(getColor(progress) + 'dd');
 
  };

  const getColor = (progress) => {
    if (progress === 1) return '#00c853';      // Bright green
  if (progress >= 0.75) return '#a2d729';    // Lime
  if (progress >= 0.5) return '#ffd700';     // Gold
  if (progress >= 0.3) return '#ffb347';     // Orange
  if (progress >= 0.1) return '#ff6f61';     // Coral
  return '#ff4c4c';  
  }

  
  const handleDeleteTask = async (taskToDelete) => {
    const token = localStorage.getItem('auth_token');
    if (!token || !userId) return;
  
    try {
      const res = await axios.delete(`${apiUrl}/api/checklist/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { task: taskToDelete.task },
      });
  
      setChecklistItems(res.data.checklist || []);
      setProgress(res.data.checklist || []);
      setFormData(prev => ({
        ...prev,
        checklist: prev.checklist.filter(task => task !== taskToDelete),
      }));
    } catch (error) {
      console.error('Error deleting task from server:', error);
      setErrorMessage('Failed to delete task.');
    }
  };
  
  const onLoginSuccess = (user) => {
    setUserId(user._id);
    setUserName(user.username);
    setIsLoggedIn(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const currentDate = new Date();
    const date = currentDate.toISOString();
  
    const enrichedChecklist = formData.checklist.map(taskName => {
      // Find the task in checklistItems that matches the taskName from the formData
      const taskObj = checklistItems.find(item => item.task === taskName);
    
      // If the task exists, return the updated task with the completed status
      if (taskObj) {
        return {
          ...taskObj,
          completed: true, // Mark the task as completed
        };
      }
    
      // If the task doesn't exist in checklistItems, return null or skip it
      return null;
    }).filter(task => task !== null); // Filter out null values
    
    const payload = {
      date,
      caloriesBurned: formData.caloriesBurned,
      checklist: enrichedChecklist,
    };
  
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('Authentication token is missing. Please log in.');
      setLoading(false);
      return;
    }
  
    try {
      await axios.patch(`${apiUrl}/api/data/update`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error updating data:', error);
      setErrorMessage('Error updating data. Please try again.');
    } finally {
      setLoading(false);
      
      setFormData({ caloriesBurned: 0, checklist: [] });
      setNewTask('');
      fetchData();
    }
  };
  
  const fetchData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
      setChecklistItems(response.data.checklist || []);
      setProgress(response.data.checklist || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Error fetching data. Please try again.');
    }
  };

  const fetchChartData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setdataVerb(response.data);      
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Error fetching data. Please try again.');
    }
  };


  const updateChart = (data, aggregation) => {
    let labels = [];
    let values = [];

    if (aggregation === 'daily') {
      const dailyData = groupByDay(data);
      labels = Object.keys(dailyData);
      values = labels.map(day => dailyData[day].reduce((sum, item) => sum + item.caloriesBurned, 0));
    } else if (aggregation === 'weekly') {
      const weeklyData = groupByWeek(data);
      labels = Object.keys(weeklyData);
      values = labels.map(week => weeklyData[week].reduce((sum, item) => sum + item.caloriesBurned, 0));
    } else if (aggregation === 'monthly') {
      const monthlyData = groupByMonth(data);
      labels = Object.keys(monthlyData);
      values = labels.map(month => monthlyData[month].reduce((sum, item) => sum + item.caloriesBurned, 0));
    }

    setChartData({
      labels,
      datasets: [{
        label: 'Calories Burned Over Time',
        data: values,
        borderColor: '#4CAF50',
        borderWidth: 2,
        fill: false,
      }],
    });
  };

  const updateTotalJobsChart = (data, aggregation) => {
    let labels = [];
    let percentages = [];
    
    if (aggregation === 'daily') {
      const dailyData = groupByDay(dataVerb);
      labels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
      percentages = labels.map(day => calculatePercentage(dailyData[day]));
    
    } else if (aggregation === 'weekly') {
      const weeklyData = groupByWeek(dataVerb);
      labels = Object.keys(weeklyData).sort((a, b) => new Date(a) - new Date(b));
      percentages = labels.map(week => calculatePercentage(weeklyData[week]));
    
    } else if (aggregation === 'monthly') {
      const monthlyData = groupByMonth(dataVerb);
      labels = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
      percentages = labels.map(month => calculatePercentage(monthlyData[month]));
    }

    
    
    setTotalJobsData({
      labels,
      datasets: [{
        label: 'Checklist Completion (%)',
        data: percentages,
        borderColor: '#2196F3',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: '#2196F3',
        tension: 0.2,
      }],
    });

  };

 
  
  const saveSelection = () => {
    localStorage.setItem('selectedTasks', selectedTask);
    alert('Task selection saved!');
  };
  
  
  const handleTaskChange = (task) => {
    setSelectedTask(task);
    const weeklyData = groupByWeek(dataVerb);
  
    const weeklyProgress = Object.entries(weeklyData).map(([week, entries]) => {
      const totalDays = entries.length;
  
      const completedDays = entries.filter(entry =>
        (entry.checklist || []).some(item => item.task === task && item.completed)
      ).length;
  
      const percentage = Math.round((completedDays / totalDays) * 100);
  
      return { week, percentage };
    });
  
    setTaskProgress(weeklyProgress);
  };
  

  const uniqueTasks = Array.from(
    new Set(
      dataVerb.flatMap(entry =>
        (entry.checklist || []).map(item => item.task)
      )
    )
  );
  

  const calculatePercentage = (entries) => {
    let totalItems = 0;
    let totalCompleted = 0;
  
    entries.forEach(entry => {
      const checklist = entry.checklist || [];
      totalItems += checklist.length;
      totalCompleted += checklist.filter(item => item.completed).length;
    });
  
    if (totalItems === 0) return 0;
    return Math.round((totalCompleted / totalItems) * 100);
  };
  

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
  };


  const handleSetDefaultChecklist = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await axios.patch(
        `${apiUrl}/api/checklist/update`,
        { checklist: checklistItems },
        {
          headers: {
            Authorization: `Bearer ${token}`, // replace with your actual token variable
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
    <AppLayout onLogout={onLogout}>
    <Container>
      <Caption>Welcome to FIT UI</Caption>

      {!isLoggedIn ? (
        <>
        <Login onLoginSuccess={onLoginSuccess} setErrorMessage={setErrorMessage} />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </>
      ) : (
        <div>
          <Header>Hi, {userName}</Header>
          <div>
          <ChartWrapper>
              <TaskCompletionIndicator checklist={checklistItems} />
              </ChartWrapper>
          <RefreshButton bgColor={progressColor} onClick={handleLogout}>Logout</RefreshButton>
          {/* <RefreshButton onClick={fetchData}>Refresh</RefreshButton>  */}
          <AggregationSelect onChange={(e) => setAggregationOption(e.target.value)} value={aggregationOption}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </AggregationSelect>
          </div>
          <TaskWrapper>
            <Form onSubmit={handleSubmit}>
              
              <div>
                <h3>Select Your Activities:</h3>
                <div>
                <NewTaskInput  type="text" value={newTask} onChange={handleNewTaskChange} placeholder="Add new task" />
                <AddNewTaskButton
                bgColor={progressColor}
  type="button"
  onClick={handleAddNewTask}
>
  Add task
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
          checked={formData.checklist.includes(item.task)}
          onChange={(e) => handleChecklistChange(e, item.task)}
        />
        <span>{item.task}</span>
      </ChecklistItem>
                    <DeleteIcon onClick={() => handleDeleteTask(item)}>
                      <span role="img" aria-label="delete">
                        <img
                          src="https://img.icons8.com/?size=15&id=99961&format=png&color=9f9f9f"
                          alt="delete"
                        />
                      </span>
                    </DeleteIcon>
                  </CheckList>
                ))                      
                   
                ) : (
                  <p>No checklist items. Add a new one below.</p>
                )}
              </div>
              <div>
              <Input type="number" name="caloriesBurned" onChange={handleInputChange} placeholder="Enter Calories Burned" />
              <Label>KCal</Label>
              </div>
              <SubmitButton bgColor={progressColor} type="submit" disabled={loading}>{loading ? <Spinner/> : 'Submit'}</SubmitButton>  

            </Form>
            

            {dataVerb.length > 0 ? (
              <>
             
                <ChartWrapper>
                  <ChartContainer>
                    <Line data={chartData} />
                  </ChartContainer>
                </ChartWrapper>
                <ChartWrapper>
                  <ChartContainer>
                    <Line data={totalJobsData} />
                  </ChartContainer>
                </ChartWrapper>
              </>
            ) : (
              <p>No data available to display</p>
            )}
<ChartWrapper>
<div style={{ marginTop: '1rem' }}>
<DropdownContainer>
    <Label>Select a Task:</Label>
    <Select value={selectedTask} onChange={(e) => handleTaskChange(e.target.value)}>
      <option value="" disabled>Select a Task</option>
      {uniqueTasks.map((task, idx) => (
        <option key={idx} value={task}>{task}</option>
      ))}
    </Select>
  </DropdownContainer>
  <LinkButton type="button" onClick={saveSelection}>
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

</ChartWrapper>

          </TaskWrapper>
        </div>
      )}
    </Container>
    </AppLayout>
  );
};

export default FitUI;
