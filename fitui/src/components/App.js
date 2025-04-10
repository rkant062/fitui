import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import { Header, Caption, Container, Form, Input, ChecklistItem, NewTaskInput, AddNewTaskButton, SubmitButton, TaskWrapper, ChartWrapper, ChartTitle, ChartContainer, RefreshButton } from '../styles/Styledcomponents'; 
import { AggregationSelect } from '../styles/Styledcomponents';
import { LoginForm, LoginButton } from '../styles/Styledcomponents'; // Assuming you have styled components for inputs and buttons
const apiUrl = process.env.REACT_APP_API_URL;

const App = () => {
  const [formData, setFormData] = useState({ caloriesBurned: 0, checklist: [] });
  const [checklistItems, setChecklistItems] = useState([
    'Push-ups', 'Jogging', 'Yoga', 'Cycling', 'Walking'
  ]);
  const [newTask, setNewTask] = useState('');
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [totalJobsData, setTotalJobsData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aggregationOption, setAggregationOption] = useState('daily');
  const [userId, setUserId] = useState(null); 
  const [userName, setUserName] = useState(''); // Store username

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  const createDummyUser = async () => {
    const dummyUser = {
      username: 'dummyuser1',
      email: 'dummyuser1@example.com',
      password: 'password123',
    };
  
    try {
      const response = await axios.post(`${apiUrl}/api/create-user`, dummyUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('User created successfully:', response.data);
  
      const token = response.data.token; // Assuming the token is in response.data.token
      localStorage.setItem('auth_token', token);
      setUserId(response.data.user._id); 
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const fetchData = async () => {
    if (!userId) {
      console.log('No user ID available. Create a user first.');
      return;
    }
  
    const token = localStorage.getItem('auth_token');
  
    if (!token) {
      console.log('No token found. User might not be authenticated.');
      return;
    }
  
    try {
      const response = await axios.get(`${apiUrl}/api/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedData = response.data;
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Error fetching data. Please try again.');
    }
  };

  useEffect(() => {
    // Check if the user is authenticated on page load
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id'); 
    const userName = localStorage.getItem('user_name'); // Assuming you store userName in localStorage
    // Assuming you store userId in localStorage
    if (token) {
      // If a token exists, decode it (optional step) or just proceed with fetching data
     // const userIdFromToken =  // This is optional, just an example if you want to decode and extract userId from token
      setUserId(userId);  // Set userId from decoded token (if you have this logic)
      setUserName(userName); // Set the username from the token (if you have this logic)
      setIsLoggedIn(true);  // Set the user as logged in
    } else {
      setIsLoggedIn(false);  // Set the user as logged out
    }
  }, []);  // This runs only once on page load
  
  useEffect(() => {
    // Fetch data if userId exists
    if (userId) {
      fetchData(); 
    }
  }, [userId]);  // This will run whenever userId changes (which happens after a successful login)
  

  useEffect(() => {
    if (data?.length > 0) {
      updateChart(data, aggregationOption);
      updateTotalJobsChart(data, aggregationOption);
    }
  }, [data, aggregationOption]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleNewTaskChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleAddNewTask = () => {
    if (newTask && !checklistItems.includes(newTask)) {
      setChecklistItems((prev) => [...prev, newTask]);
      setNewTask('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentDate = new Date();
    const dayIndex = currentDate.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = currentDate.toISOString();

    const payload = {
      ...formData,
      day: dayNames[dayIndex],
      date: date,
      complete: true,
      userId,
    };

    const token = localStorage.getItem('auth_token'); // Assuming the token is stored in localStorage

    if (!token) {
      console.error('No authentication token found');
      setErrorMessage('Authentication token is missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/add-data`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );
  
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error('Error saving data:', error);
      setErrorMessage('Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateChart = (data, aggregation) => {
    if (!data?.length) {
      setChartData({ labels: [], datasets: [] });
      return;
    }

    let labels = [];
    let values = [];

    if (aggregation === 'daily') {
      const dailyData = groupByDay(data);
      labels = Object.keys(dailyData);
      values = labels.map((day) => dailyData[day].reduce((sum, item) => sum + item.caloriesBurned, 0));
    } else if (aggregation === 'weekly') {
      const weeklyData = groupByWeek(data);
      labels = Object.keys(weeklyData);
      values = labels.map((week) => weeklyData[week].reduce((sum, item) => sum + item.caloriesBurned, 0));
    } else if (aggregation === 'monthly') {
      const monthlyData = groupByMonth(data);
      labels = Object.keys(monthlyData);
      values = labels.map((month) => monthlyData[month].reduce((sum, item) => sum + item.caloriesBurned, 0));
    }

    setChartData({
      labels: labels,
      datasets: [{
        label: 'Calories Burned Over Time',
        data: values,
        borderColor: '#4CAF50',
        borderWidth: 2,
        fill: false,
      }],
    });
  };

  const groupByDay = (data) => {
    const days = {};
    data.forEach(item => {
      const day = item.day;
      if (!days[day]) days[day] = [];
      days[day].push(item);
    });
    return days;
  };

  const updateTotalJobsChart = (data, aggregation) => {
    if (!data?.length) {
      setTotalJobsData({ labels: [], datasets: [] });
      return;
    }

    let labels = [];
    let values = [];

    if (aggregation === 'daily') {
      const dailyData = groupByDay(data);
      labels = Object.keys(dailyData);
      values = labels.map((week) => dailyData[week].length);
    } else if (aggregation === 'weekly') {
      const weeklyData = groupByWeek(data);
      labels = Object.keys(weeklyData);
      values = labels.map((week) => weeklyData[week].length);
    } else if (aggregation === 'monthly') {
      const monthlyData = groupByMonth(data);
      labels = Object.keys(monthlyData);
      values = labels.map((month) => monthlyData[month].length);
    }

    setTotalJobsData({
      labels: labels,
      datasets: [{
        label: 'Total Jobs Done',
        data: values,
        borderColor: '#FF9800',
        borderWidth: 2,
        fill: false,
      }],
    });
  };

  const groupByWeek = (data) => {
    const weeks = {};

    const getWeekNumber = (date) => {
      const tempDate = new Date(date);
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7)); 
      const yearStart = new Date(tempDate.getFullYear(), 0, 1);
      const week = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
      return week;
    };

    data.forEach(item => {
      const weekNumber = getWeekNumber(item.date);
      if (!weeks[weekNumber]) weeks[weekNumber] = [];
      weeks[weekNumber].push(item);
    });

    return weeks;
  };

  const groupByMonth = (data) => {
    const months = {};
    data.forEach(item => {
      const month = new Date(item.date).getMonth();
      if (!months[month]) months[month] = [];
      months[month].push(item);
    });
    return months;
  };

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/login`, loginCredentials, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', userId);  
      localStorage.setItem('user_name', user.username); // Store username in localStorage
      setUserId(user._id);
      setUserName(user.username);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid credentials. Please try again.');
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token'); // Remove token on logout
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
  };

  return (
    <Container>
      <Caption>Welcome to FIT UI</Caption>
      

       {/* Show login form if not logged in */}
       {!isLoggedIn ? (
        <LoginForm onSubmit={handleLogin}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={loginCredentials.email}
            onChange={handleLoginInputChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={loginCredentials.password}
            onChange={handleLoginInputChange}
            required
          />
          <LoginButton type="submit">Login</LoginButton>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </LoginForm>
      ) : (

        <div>
           <Header>Hi, {userName}</Header>
           <RefreshButton onClick={handleLogout}>Logout</RefreshButton>
      <RefreshButton onClick={fetchData}>Manual Refresh</RefreshButton>
      <AggregationSelect onChange={(e) => setAggregationOption(e.target.value)} value={aggregationOption}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </AggregationSelect>
      {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}

      <TaskWrapper>
        <Form onSubmit={handleSubmit}>
          <Input
            type="number"
            name="caloriesBurned"
            value={formData.caloriesBurned}
            onChange={handleInputChange}
            placeholder="Enter Calories Burned"
            required
          />

          <div>
            <h3>Select Your Activities:</h3>
            {checklistItems?.length > 0 ? (
              checklistItems.map((item) => (
                <ChecklistItem key={item}>
                  <input
                    type="checkbox"
                    id={item}
                    checked={formData.checklist?.includes(item)}
                    onChange={(e) => handleChecklistChange(e, item)}
                  />
                  <span>{item}</span>
                </ChecklistItem>
              ))
            ) : (
              <p>No checklist items available. Add a new task below.</p>
            )}
          </div>

          

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </SubmitButton>
          <div>
            <NewTaskInput
              type="text"
              value={newTask}
              onChange={handleNewTaskChange}
              placeholder="Add new task"
            />
            <AddNewTaskButton type="button" onClick={handleAddNewTask}>Add Task</AddNewTaskButton>
          </div>
        </Form>

        {data?.length > 0 ? (
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
      </TaskWrapper>
      </div> )}
    </Container>
  );
};

export default App;
