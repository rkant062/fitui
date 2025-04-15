import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import AppLayout from './AppLayout';
import Login from './Login';
import {
  Header,
  Caption,
  Container,
  Form,
  Input,
  TaskWrapper,
  AddNewTaskButton,
  SubmitButton,
  ChartWrapper,
  ChartContainer,
  RefreshButton,
  AggregationSelect,
  AddNewTaskButton_v2
} from '../styles/Styledcomponents';
import { groupByDay, groupByWeek, groupByMonth } from './Aggregation';

const apiUrl = process.env.REACT_APP_API_URL;

const FinUI = (onLogout) => {
  const [expenseEntries, setExpenseEntries] = useState([{ amount: '', category: '' }]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], datasets: [] });
  const [aggregationOption, setAggregationOption] = useState('daily');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserName = localStorage.getItem('user_name');

    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName || '');
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchChartData();
  }, [userId]);

  useEffect(() => {
    if (data.length > 0) {
      updateTotalExpenseChart(data, aggregationOption);
      updateCategoryBreakdownChart(data, aggregationOption);
    }
  }, [data, aggregationOption]);

  const onLoginSuccess = (user) => {
    setUserId(user._id);
    setUserName(user.username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const currentDate = new Date().toISOString();
    const validExpenses = expenseEntries.filter(e => e.amount && e.category);

    const payload = validExpenses.map(item => ({
      date: currentDate,
      amount: parseFloat(item.amount),
      category: item.category,
    }));

    try {
      await axios.post(`${apiUrl}/api/expenses`, { expenses: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenseEntries([{ amount: '', category: '' }]);
      fetchChartData();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await axios.get(`${apiUrl}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      const uniqueCats = [...new Set(res.data.map(d => d.category))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error('Fetch chart error:', err);
    }
  };

  const updateTotalExpenseChart = (data, aggregation) => {
    const grouped = groupByTime(data, aggregation);
    const labels = Object.keys(grouped);
    const values = labels.map(date => grouped[date].reduce((sum, e) => sum + e.amount, 0));

    setChartData({
      labels,
      datasets: [{
        label: 'Total Expenses',
        data: values,
        borderColor: '#4CAF50',
        borderWidth: 2,
        fill: false,
      }],
    });
  };

  const updateCategoryBreakdownChart = (data, aggregation) => {
    const grouped = groupByTime(data, aggregation);
    const labels = Object.keys(grouped);
    const categoryMap = {};

    labels.forEach(label => {
      const entries = grouped[label];
      entries.forEach(entry => {
        if (!categoryMap[entry.category]) {
          categoryMap[entry.category] = [];
        }
      });
    });

    Object.keys(categoryMap).forEach(cat => {
      categoryMap[cat] = labels.map(label =>
        (grouped[label] || []).reduce((sum, entry) => entry.category === cat ? sum + entry.amount : sum, 0)
      );
    });

    const datasets = Object.keys(categoryMap).map((cat, index) => ({
      label: cat,
      data: categoryMap[cat],
      borderColor: getColor(index),
      fill: false,
      tension: 0.3,
    }));

    setCategoryChartData({ labels, datasets });
  };

  const groupByTime = (data, aggregation) => {
    if (aggregation === 'daily') return groupByDay(data);
    if (aggregation === 'weekly') return groupByWeek(data);
    return groupByMonth(data);
  };

  const getColor = (i) => ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#2ECC71'][i % 5];

  return (
    <AppLayout onLogout={onLogout}>
      <Container>
        <Caption>Welcome to Expense Tracker</Caption>
        {!isLoggedIn ? (
          <Login onLoginSuccess={onLoginSuccess} />
        ) : (
          <>
          <Header>Hi, {userName}</Header>
            <RefreshButton onClick={handleLogout}>Logout</RefreshButton>
            <RefreshButton onClick={fetchChartData}>Refresh Data</RefreshButton>
            <AggregationSelect
              onChange={(e) => setAggregationOption(e.target.value)}
              value={aggregationOption}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </AggregationSelect>
            <TaskWrapper>
            <Form onSubmit={handleSubmit} style={{ display: 'inline-block', width: '100%' }}>
              <h3>Add Expenses</h3>
              {expenseEntries.map((entry, index) => (
  <div key={index} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
    <Input
      type="number"
      placeholder="Amount"
      value={entry.amount}
      onChange={(e) => {
        const updated = [...expenseEntries];
        updated[index].amount = e.target.value;
        setExpenseEntries(updated);
      }}
    />
    <button
        type="button"
        onClick={() => {
          const updated = [...expenseEntries];
          updated.splice(index, 1);
          setExpenseEntries(updated);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'red',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        ✕
      </button>

<div
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px',
    margin: '2px',
  }}
>      {categories.map((cat) => (
        <span
          key={cat}
          onClick={() => {
            const updated = [...expenseEntries];
            updated[index].category = cat;
            setExpenseEntries(updated);
          }}
          style={{
            padding: '5px 10px',
            borderRadius: '20px',
            backgroundColor: cat === entry.category ? '#2196F3' : '#ccc',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          {cat}
        </span>
        
      ))}
    </div>
    
    

    {/* <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
      <span style={{ flex: 1, fontSize: '0.9rem', color: '#555' }}>
        Selected: {entry.category || 'None'}
      </span>
      
    </div> */}
    

    {/* Only show add button on the last entry */}
    {index === expenseEntries.length - 1 && (
      <AddNewTaskButton_v2
      style={{
        backgroundColor: '#2196F3',
    
      }}
        type="button"
        onClick={() => setExpenseEntries([...expenseEntries, { amount: '', category: '' }])}
      >
        +
      </AddNewTaskButton_v2>
    )}
  </div>
))}
<div style={{ marginTop: '20px' }}>
  <h4>Manage Categories</h4>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <Input
      type="text"
      placeholder="New category"
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
    />
    <AddNewTaskButton_v2
      type="button"
      onClick={() => {
        if (newCategory.trim() && !categories.includes(newCategory)) {
          setCategories([...categories, newCategory.trim()]);
          setNewCategory('');
        }
      }}
    >
      + 
    </AddNewTaskButton_v2>
  </div>
</div>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </SubmitButton>
            </Form>

            {data.length > 0 && (
              <>
                <ChartWrapper>
                  <ChartContainer>
                    <Line data={chartData} />
                  </ChartContainer>
                </ChartWrapper>
                <ChartWrapper>
                  <ChartContainer>
                    <Line data={categoryChartData} />
                  </ChartContainer>
                </ChartWrapper>
              </>
            )}
         
          </TaskWrapper>
          </>
        )}
       
      </Container>
    </AppLayout>
  );
};

export default FinUI;
