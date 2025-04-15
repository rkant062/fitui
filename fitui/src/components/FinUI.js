import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import AppLayout from './AppLayout';
import Login from './Login';
import WeeklyGoalTracker from '../charts/WeeklyGoalTracker';
import {
  Header,
  Caption,
  Container,
  Form,
  Input,
  TaskWrapper,
  AddNewTaskButton_v2,
  SubmitButton,
  ChartWrapper,
  ChartContainer,
  RefreshButton,
  AggregationSelect,
} from '../styles/Styledcomponents';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { groupByDay, groupByWeek, groupByMonth } from './Aggregation';
import Spinner from './Spinner';

const apiUrl = process.env.REACT_APP_API_URL;

const FinUI = (onLogout) => {
  const [expenseEntries, setExpenseEntries] = useState([{ amount: '', category: '' }]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], datasets: [], backgroundColor: [] });
  const [aggregationOption, setAggregationOption] = useState('daily');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
const [newCategoryBudget, setNewCategoryBudget] = useState('');

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
  
      // ✅ Wait for DB write, then fetch fresh data
      await fetchChartData();
  
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
      const catresponse = await axios.get(`${apiUrl}/api/expenses/categories`, {
        headers: { Authorization: `Bearer ${token}` },  
      });
const uniqueCats = catresponse.data;
console.log('Unique categories:', uniqueCats);
const enrichedCats = uniqueCats;
setCategories(enrichedCats);
    } catch (err) {
      console.error('Fetch chart error:', err);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(now.setDate(diff));
  };

  const updateTotalExpenseChart = (data, aggregation) => {
    const grouped = groupByTime(data, aggregation);
    const labels = Object.keys(grouped);
    const values = labels.map(date =>
      grouped[date].reduce((sum, e) => sum + e.amount, 0)
    );

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
        (grouped[label] || []).reduce((sum, entry) =>
          entry.category === cat ? sum + entry.amount : sum, 0
        )
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
  const handleDeleteCategory = async (name) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
  
    if (!window.confirm(`Delete category "${name}"?`)) return;
  
    try {
      await axios.delete(`${apiUrl}/api/expenses/categories/${name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCategories(prev => prev.filter(cat => cat.name !== name));
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };
  
  const handleNewCategory = async (newCategory, newCategoryBudget) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const trimmed = newCategory.trim();
    const budget = parseFloat(newCategoryBudget);
    try {
      if (trimmed && !categories.find(cat => cat.name === trimmed)) {
        setCategories([...categories, { name: trimmed, budget: isNaN(budget) ? 0 : budget }]);
        setNewCategory('');
        setNewCategoryBudget('');
      }
      const res = await axios.post(
        `${apiUrl}/api/expenses/categories`,
        { category : trimmed, 
          budget: budget },
        { headers: { Authorization: `Bearer ${token}` } }
      );               
                        
    } catch (err) {
      console.error('Add category error:', err);
    }
  }


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
                  <div
                    key={index}
                    style={{
                      marginBottom: '12px',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '10px',
                    }}
                  >
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
                    >
                      {categories.map((cat) => {
  const isSelected = cat.name === entry.category;
  return (
    <span
      key={cat.name}
      onClick={() => {
        const updated = [...expenseEntries];
        updated[index].category = cat.name;
        setExpenseEntries(updated);
      }}
      style={{
        padding: '5px 10px',
        borderRadius: '20px',
        backgroundColor: isSelected ? '#2196F3' : '#ccc',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.8rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
      }}
    >
      {cat.name}
      {isSelected && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCategory(cat.name);
          }}
          style={{
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '12px',
            background: '#113c33',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          ×
        </span>
      )}
    </span>
  );
})}

                    </div>

                    {index === expenseEntries.length - 1 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <AddNewTaskButton_v2
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                          }}
                          type="button"
                          onClick={() =>
                            setExpenseEntries([...expenseEntries, { amount: '', category: '' }])
                          }
                        >
                          <img
                            src="https://img.icons8.com/?size=20&id=21097&format=png&color=000000"
                            alt="Add"
                          />
                        </AddNewTaskButton_v2>

                        <AddNewTaskButton_v2
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                          }}
                          type="button"
                          onClick={handleSubmit}
                        >
                          <img
                            src="https://img.icons8.com/?size=20&id=11849&format=png&color=000000"
                            alt="Submit"
                          />
                        </AddNewTaskButton_v2>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ marginTop: '20px' }}>
                  <h4>Manage Categories</h4>
                  <div >
                    <Input
                      type="text"
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Input
                    style = {{ width: '80px' }}
                    type="number"
                    placeholder="Budget"
                    value={newCategoryBudget}
                    onChange={(e) => setNewCategoryBudget(e.target.value)}
/>
                    <AddNewTaskButton_v2
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                      type="button"
                      onClick={() => {
                        handleNewCategory(newCategory, newCategoryBudget);
                      }}
                    >
                      <img
                        src="https://img.icons8.com/?size=20&id=21097&format=png&color=000000"
                        alt="Add"
                      />
                    </AddNewTaskButton_v2>
                  </div>
                </div>
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
                      <Bar data={categoryChartData}  />
                    </ChartContainer>
                  </ChartWrapper>
                </>
              )}

<div
  style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',

  }}
>
  <h3 style={{ marginBottom: '16px' }}>Weekly Budget Progress</h3>
  {categories.map((cat) => {
    const weeklySpent = data.filter((e) => {
      const entryDate = new Date(e.date);
      return (
        e.category === cat.name &&
        entryDate >= getStartOfWeek()
      );
    });

    const spent = weeklySpent.reduce((sum, e) => sum + e.amount, 0);

    return (
      <WeeklyGoalTracker
        key={cat._id}
        categoryName={cat.name}
        spent={spent}
        budget={cat.budget}
      />
    );
  })}
</div>


            </TaskWrapper>
          </>
        )}
      </Container>
    </AppLayout>
  );
};

export default FinUI;
