import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line, Pie, Radar } from "react-chartjs-2";
import styled from "styled-components";
import Chart from "chart.js/auto";
import AppLayout from "./AppLayout";
import Login from "./Login";
import WeeklyGoalTracker from "../charts/WeeklyGoalTracker";
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
} from "../styles/Styledcomponents";
import PullToRefresh from "react-pull-to-refresh";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { groupByDay, groupByWeek, groupByMonth } from "./Aggregation";
import Spinner from "./Spinner";

const apiUrl = process.env.REACT_APP_API_URL;

const FinUI = ({ onLogout }) => {
  const [expenseEntries, setExpenseEntries] = useState([
    { amount: "", category: "", note: "", showNote: false },
  ]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [data, setData] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [newSuperCategory, setNewSuperCategory] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [],
    datasets: [],
    backgroundColor: [],
  });
  const [aggregationOption, setAggregationOption] = useState("daily");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('personal');
  const [showShareModal, setShowShareModal] = useState(false);
  const [newSharedAccount, setNewSharedAccount] = useState({ name: '' });
  const [shareToken, setShareToken] = useState('');
  const [createdShareToken, setCreatedShareToken] = useState('');
  const [viewingToken, setViewingToken] = useState(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);

  const handleRefresh = () => {
    return new Promise((resolve) => {
      fetchChartData();
      resolve();
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedUserId = localStorage.getItem("user_id");
    const storedUserName = localStorage.getItem("user_name");

    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName || "");
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchChartData();
      fetchSuperCategories();
      fetchSharedAccounts();
    }
  }, [userId, selectedAccount]);

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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    setIsLoggedIn(false);
    setUserId(null);
    setUserName("");
    if (onLogout) {
      onLogout();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const currentDate = new Date().toISOString();
    const validExpenses = expenseEntries.filter((e) => e.amount && e.category);

    const payload = validExpenses.map((item) => ({
      date: currentDate,
      amount: parseFloat(item.amount),
      category: item.category,
      description: item.note || "",
    }));

    try {
      await axios.post(
        `${apiUrl}/api/expenses`,
        { 
          expenses: payload,
          sharedAccountId: selectedAccount !== 'personal' ? selectedAccount : null
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenseEntries([{ amount: "", category: "", note: "", showNote: false }]);
      await fetchChartData();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      console.log('Fetching data with date range:', { startDate, endDate });

      const response = await axios.get(`${apiUrl}/api/data/chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: 'expense',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          sharedAccountId: selectedAccount !== 'personal' ? selectedAccount : null
        },
        withCredentials: true,
      });
      
      console.log('Received data:', response.data);
      setData(response.data);

      const catresponse = await axios.get(`${apiUrl}/api/expenses/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Received categories:', catresponse.data);
      const uniqueCats = catresponse.data;
      const enrichedCats = uniqueCats;
      setCategories(enrichedCats);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Error fetching data. Please try again.");
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(now.setDate(diff));
  };

  const updateTotalExpenseChart = (data, aggregation) => {
    console.log('Updating chart with data:', data);
    console.log('Aggregation type:', aggregation);
    
    const grouped = groupByTime(data, aggregation);
    console.log('Grouped data:', grouped);
    
    const labels = Object.keys(grouped);
    const values = labels.map((date) =>
      grouped[date].reduce((sum, e) => sum + e.amount, 0)
    );
    
    console.log('Chart labels:', labels);
    console.log('Chart values:', values);

    setChartData({
      labels,
      datasets: [
        {
          label: "Total Expenses",
          data: values,
          borderColor: "#4CAF50",
          borderWidth: 2,
          fill: false,
        },
      ],
    });
  };

  const updateCategoryBreakdownChart = (data, aggregation) => {
    const grouped = groupByTime(data, aggregation);
    const labels = Object.keys(grouped);
    const categoryMap = {};

    labels.forEach((label) => {
      const entries = grouped[label];
      entries.forEach((entry) => {
        if (!categoryMap[entry.category]) {
          categoryMap[entry.category] = [];
        }
      });
    });

    Object.keys(categoryMap).forEach((cat) => {
      categoryMap[cat] = labels.map((label) =>
        (grouped[label] || []).reduce(
          (sum, entry) => (entry.category === cat ? sum + entry.amount : sum),
          0
        )
      );
    });

    const datasets = Object.keys(categoryMap).map((cat, index) => ({
      label: cat,
      data: categoryMap[cat],
      borderColor: getColor(index),
      fill: true,
      tension: 0.3,
      backgroundColor: getColor(index) + "66", // Use backgroundColor instead of borderColor
      borderWidth: 2,
      barPercentage: 0.5, // 0 to 1 — smaller means narrower bars
      categoryPercentage: 0.5, // 0 to 1 — smaller means narrower bars
    }));

    setCategoryChartData({ labels, datasets });
  };

  const getColor = (index) => {
    const palette = [
      "#4e79a7", // Blue
      "#f28e2b", // Orange
      "#e15759", // Red
      "#76b7b2", // Teal
      "#59a14f", // Green
      "#edc949", // Yellow
      "#af7aa1", // Purple
      "#ff9da7", // Pink
      "#9c755f", // Brown
      "#bab0ab", // Gray
    ];
    return palette[index % palette.length];
  };

  const groupByTime = (data, aggregation) => {
    if (aggregation === "daily") return groupByDay(data);
    if (aggregation === "weekly") return groupByWeek(data);
    return groupByMonth(data);
  };

  const handleDeleteCategory = async (name) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (!window.confirm(`Delete category "${name}"?`)) return;

    try {
      await axios.delete(`${apiUrl}/api/expenses/categories/${name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories((prev) => prev.filter((cat) => cat.name !== name));
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  const handleNewCategory = async (newCategory, newCategoryBudget) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const trimmed = newCategory.trim();
    const budget = parseFloat(newCategoryBudget);
    try {
      if (trimmed && !categories.find((cat) => cat.name === trimmed)) {
        setCategories([
          ...categories,
          { name: trimmed, budget: isNaN(budget) ? 0 : budget },
        ]);
        setNewCategory("");
        setNewCategoryBudget("");
      }
      const res = await axios.post(
        `${apiUrl}/api/expenses/categories`,
        { category: trimmed, budget: budget },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Add category error:", err);
    }
  };

  const fetchSuperCategories = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      console.log('Fetching super categories...');
      const response = await axios.get(`${apiUrl}/api/expenses/super-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched super categories:', response.data);
      
      // Ensure the response data is in the correct format
      const formattedCategories = response.data.map(cat => ({
        name: cat.name,
        startDate: new Date(cat.startDate),
        endDate: new Date(cat.endDate),
        expenses: cat.expenses || [],
        total: cat.total || 0
      }));
      
      setSuperCategories(formattedCategories);
    } catch (err) {
      console.error("Error fetching super categories:", err);
      setErrorMessage("Failed to fetch statements. Please try again.");
    }
  };

  const handleCreateSuperCategory = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      console.log('Creating super category with data:', newSuperCategory);
      
      // Validate dates
      const startDate = new Date(newSuperCategory.startDate);
      const endDate = new Date(newSuperCategory.endDate);
      
      if (startDate > endDate) {
        setErrorMessage("Start date cannot be after end date");
        return;
      }

      console.log('Date range:', { startDate, endDate });

      const response = await axios.post(
        `${apiUrl}/api/expenses/super-categories`,
        {
          name: newSuperCategory.name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Super category created:', response.data);

      // Add the new super category to the state
      setSuperCategories(prev => [...prev, response.data]);

      // Clear the form
      setNewSuperCategory({ name: "", startDate: "", endDate: "" });
      setErrorMessage("");
      
      // Refresh the data
      await fetchChartData();

      // Show success message
      alert('Statement created successfully!');
    } catch (err) {
      console.error("Error creating super category:", err);
      setErrorMessage(err.response?.data?.message || "Failed to create statement. Please try again.");
    }
  };

  const handleDeleteSuperCategory = async (name) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (!window.confirm(`Delete super category "${name}"?`)) return;

    try {
      await axios.delete(`${apiUrl}/api/expenses/super-categories/${name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchSuperCategories();
      await fetchChartData();
    } catch (err) {
      console.error("Error deleting super category:", err);
    }
  };

  const handleSendEmail = async (statement) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await axios.post(
        `${apiUrl}/api/expenses/send-statement`,
        {
          statementName: statement.name,
          startDate: statement.startDate,
          endDate: statement.endDate
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Statement sent:', response.data);
      alert('Statement has been sent to your email!');
    } catch (err) {
      console.error("Error sending statement:", err);
      alert('Email feature coming soon!');
    }
  };

  const fetchSharedAccounts = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/shared-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSharedAccounts(response.data);
    } catch (err) {
      console.error("Error fetching shared accounts:", err);
    }
  };

  const handleCreateSharedAccount = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await axios.post(
        `${apiUrl}/api/shared-accounts`,
        { name: newSharedAccount.name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSharedAccounts([...sharedAccounts, response.data.sharedAccount]);
      setCreatedShareToken(response.data.sharedAccount.shareToken);
      setNewSharedAccount({ name: '' });
    } catch (err) {
      console.error("Error creating shared account:", err);
    }
  };

  const handleJoinSharedAccount = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await axios.post(
        `${apiUrl}/api/shared-accounts/join`,
        { shareToken },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchSharedAccounts();
      setShareToken('');
      setShowShareModal(false);
    } catch (err) {
      console.error("Error joining shared account:", err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Share token copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleViewToken = async (accountId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/shared-accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewingToken({
        name: response.data.name,
        token: response.data.shareToken
      });
      setShowShareModal(true);
    } catch (err) {
      console.error("Error fetching share token:", err);
    }
  };

  const fetchAllExpenses = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/expenses/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          sharedAccountId: selectedAccount !== 'personal' ? selectedAccount : null
        }
      });
      
      // Filter expenses to show only last 10 days
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      const filteredExpenses = response.data.filter(expense => 
        new Date(expense.date) >= tenDaysAgo
      );
      
      setAllExpenses(filteredExpenses);
    } catch (err) {
      console.error("Error fetching all expenses:", err);
      setErrorMessage("Error fetching expenses. Please try again.");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`${apiUrl}/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted expense from the state
      setAllExpenses(prev => prev.filter(expense => expense._id !== expenseId));
      
      // Refresh chart data
      await fetchChartData();
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense. Please try again.");
    }
  };

  useEffect(() => {
    if (showAllExpenses) {
      fetchAllExpenses();
    }
  }, [showAllExpenses, selectedAccount]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <AppLayout onLogout={onLogout}>
        <Container>
          <Caption>Welcome to Expense Tracker</Caption>

          {!isLoggedIn ? (
            <Login onLoginSuccess={onLoginSuccess} />
          ) : (
            <>
              <Header>Hi, {userName}</Header>
              <RefreshButton onClick={handleLogout}>Logout</RefreshButton>

              {/* Account Selector */}
              <div style={{ marginLeft: "10px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    flex: 1
                  }}
                >
                  <option value="personal">Personal Account</option>
                  {sharedAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {selectedAccount !== 'personal' && sharedAccounts.some(acc => acc._id === selectedAccount) && (
                  <button
                    onClick={() => handleViewToken(selectedAccount)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    View Token
                  </button>
                )}
                {selectedAccount === 'personal' && (
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setViewingToken(null);
                      setCreatedShareToken('');
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Share Account
                  </button>
                )}
              </div>

              {/* Share Modal */}
              {showShareModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "8px",
                      width: "400px",
                    }}
                  >
                    <h3>Share Account</h3>
                    
                    {viewingToken ? (
                      <div style={{ marginBottom: "20px" }}>
                        <h4>Share Token for {viewingToken.name}</h4>
                        <div style={{ 
                          marginTop: "15px", 
                          padding: "10px", 
                          background: "#f5f5f5", 
                          borderRadius: "4px" 
                        }}>
                          <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                            Share this token with others to let them join:
                          </p>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "10px",
                            background: "white",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd"
                          }}>
                            <code style={{ flex: 1, fontSize: "14px" }}>{viewingToken.token}</code>
                            <button
                              onClick={() => copyToClipboard(viewingToken.token)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {selectedAccount === 'personal' && (
                          <div style={{ marginBottom: "20px" }}>
                            <h4>Create New Shared Account</h4>
                            <Input
                              type="text"
                              placeholder="Account Name"
                              value={newSharedAccount.name}
                              onChange={(e) =>
                                setNewSharedAccount({ name: e.target.value })
                              }
                            />
                            <button
                              onClick={handleCreateSharedAccount}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "10px",
                              }}
                            >
                              Create
                            </button>

                            {createdShareToken && (
                              <div style={{ marginTop: "15px", padding: "10px", background: "#f5f5f5", borderRadius: "4px" }}>
                                <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Share this token with others to let them join:</p>
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "10px",
                                  background: "white",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #ddd"
                                }}>
                                  <code style={{ flex: 1, fontSize: "14px" }}>{createdShareToken}</code>
                                  <button
                                    onClick={() => copyToClipboard(createdShareToken)}
                                    style={{
                                      padding: "4px 8px",
                                      backgroundColor: "#2196F3",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <h4>Join Existing Account</h4>
                          <Input
                            type="text"
                            placeholder="Share Token"
                            value={shareToken}
                            onChange={(e) => setShareToken(e.target.value)}
                          />
                          <button
                            onClick={handleJoinSharedAccount}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#4CAF50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginTop: "10px",
                            }}
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setCreatedShareToken('');
                        setViewingToken(null);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "20px",
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <AggregationSelect
                onChange={(e) => setAggregationOption(e.target.value)}
                value={aggregationOption}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </AggregationSelect>

              <TaskWrapper>
                <Form
                  onSubmit={handleSubmit}
                  style={{ display: "inline-block", width: "100%" }}
                >
                  <h3>Add Expenses</h3>

                  {expenseEntries.map((entry, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "12px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                            updated[index].showNote = !updated[index].showNote;
                            setExpenseEntries(updated);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Add note"
                        >
                          <img
                            src="https://img.icons8.com/?size=22&id=RQAaBlEwu126&format=png&color=000000"
                            alt="Note"
                            style={{
                            }}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...expenseEntries];
                            updated.splice(index, 1);
                            setExpenseEntries(updated);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "red",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {entry.showNote && (
                        <Input
                          type="text"
                          placeholder="Add a note (optional)"
                          value={entry.note}
                          onChange={(e) => {
                            const updated = [...expenseEntries];
                            updated[index].note = e.target.value;
                            setExpenseEntries(updated);
                          }}
                          style={{ marginTop: "8px" }}
                        />
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "2px",
                          margin: "2px",
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
                                padding: "5px 10px",
                                borderRadius: "20px",
                                backgroundColor: isSelected
                                  ? "#2196F3"
                                  : "#ccc",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                position: "relative",
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
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    background: "#113c33",
                                    borderRadius: "50%",
                                    width: "16px",
                                    height: "16px",
                                    display: "flex",
                                    justifyContent: "center",
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
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "4px",
                          }}
                        >
                          <AddNewTaskButton_v2
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px",
                              cursor: "pointer",
                            }}
                            type="button"
                            onClick={() =>
                              setExpenseEntries([
                                ...expenseEntries,
                                { amount: "", category: "", note: "", showNote: false },
                              ])
                            }
                          >
                            <img
                              src="https://img.icons8.com/?size=20&id=21097&format=png&color=000000"
                              alt="Add"
                            />
                          </AddNewTaskButton_v2>

                          <AddNewTaskButton_v2
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px",
                              cursor: "pointer",
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

                  <div style={{ marginTop: "20px" }}>
                    <h4>Manage Categories</h4>
                    <div>
                      <Input
                        type="text"
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <Input
                        style={{ width: "80px" }}
                        type="number"
                        placeholder="Budget"
                        value={newCategoryBudget}
                        onChange={(e) => setNewCategoryBudget(e.target.value)}
                      />
                      <AddNewTaskButton_v2
                        style={{
                          background: "none",
                          border: "none",
                          padding: "4px",
                          cursor: "pointer",
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

                {/* Charts */}
                {data.length > 0 && (
                  <>
                    <ChartWrapper>
                      <ChartContainer>
                        <Line data={chartData} />
                      </ChartContainer>
                    </ChartWrapper>
                    <ChartWrapper>
                      <ChartContainer>
                        <Bar data={categoryChartData} />
                      </ChartContainer>
                    </ChartWrapper>
                  </>
                )}

                {/* All Expenses Table */}
                <div style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3>All Expenses</h3>
                    <button
                      onClick={() => setShowAllExpenses(!showAllExpenses)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: showAllExpenses ? "#666" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {showAllExpenses ? "Hide Expenses" : "Show All Expenses"}
                    </button>
                  </div>

                  {showAllExpenses && (
                    <div style={{ 
                      overflowX: "auto",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      background: "white"
                    }}>
                      <table style={{ 
                        width: "100%", 
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "14px"
                      }}>
                        <thead>
                          <tr>
                            <th style={{ 
                              padding: "16px",
                              textAlign: "left",
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              fontWeight: "600",
                              borderBottom: "2px solid #e9ecef",
                              position: "sticky",
                              top: 0,
                              zIndex: 1
                            }}>Date</th>
                            <th style={{ 
                              padding: "16px",
                              textAlign: "left",
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              fontWeight: "600",
                              borderBottom: "2px solid #e9ecef",
                              position: "sticky",
                              top: 0,
                              zIndex: 1
                            }}>User</th>
                            <th style={{ 
                              padding: "16px",
                              textAlign: "right",
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              fontWeight: "600",
                              borderBottom: "2px solid #e9ecef",
                              position: "sticky",
                              top: 0,
                              zIndex: 1
                            }}>Cost</th>
                            <th style={{ 
                              padding: "16px",
                              textAlign: "left",
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              fontWeight: "600",
                              borderBottom: "2px solid #e9ecef",
                              position: "sticky",
                              top: 0,
                              zIndex: 1
                            }}>Category</th>
                            <th style={{ 
                              padding: "16px",
                              textAlign: "center",
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              fontWeight: "600",
                              borderBottom: "2px solid #e9ecef",
                              position: "sticky",
                              top: 0,
                              zIndex: 1
                            }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allExpenses.map((expense, index) => (
                            <tr 
                              key={expense._id}
                              style={{ 
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#f8f9fa"
                                }
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa"}
                            >
                              <td style={{ 
                                padding: "16px",
                                borderBottom: "1px solid #e9ecef",
                                color: "#495057"
                              }}>
                                {new Date(expense.date).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td style={{ 
                                padding: "16px",
                                borderBottom: "1px solid #e9ecef",
                                color: "#495057"
                              }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  backgroundColor: "#e9ecef",
                                  color: "#495057",
                                  fontSize: "12px",
                                  fontWeight: "500"
                                }}>
                                  {expense.user}
                                </span>
                              </td>
                              <td style={{ 
                                padding: "16px",
                                textAlign: "right",
                                borderBottom: "1px solid #e9ecef",
                                color: "#495057",
                                fontWeight: "500"
                              }}>
                                ₹{expense.cost.toFixed(2)}
                              </td>
                              <td style={{ 
                                padding: "16px",
                                borderBottom: "1px solid #e9ecef",
                                color: "#495057"
                              }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  borderRadius: "16px",
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  fontSize: "12px",
                                  fontWeight: "500"
                                }}>
                                  {expense.category}
                                </span>
                              </td>
                              <td style={{ 
                                padding: "16px",
                                borderBottom: "1px solid #e9ecef",
                                color: "#495057",
                                textAlign: "center"
                              }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (expense._id) {
                                      handleDeleteExpense(expense._id);
                                    } else {
                                      console.error("No expense ID found");
                                      alert("Cannot delete expense: Missing ID");
                                    }
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc3545",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    fontSize: "16px"
                                  }}
                                  title="Delete expense"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {allExpenses.length === 0 && (
                        <div style={{
                          padding: "32px",
                          textAlign: "center",
                          color: "#6c757d",
                          fontSize: "14px"
                        }}>
                          No expenses found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Weekly Budget Progress */}
                <div style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "12px" }}>
                  <h3 style={{ marginBottom: "16px" }}>Weekly Budget Progress</h3>
                  {categories.map((cat) => {
                    const weeklySpent = data.filter((e) => {
                      const entryDate = new Date(e.date);
                      return (
                        e.category === cat.name && entryDate >= getStartOfWeek()
                      );
                    });

                    const spent = weeklySpent.reduce(
                      (sum, e) => sum + e.amount,
                      0
                    );

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

                {/* Fetch Statements Card */}
                <div style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "12px" }}>
                  <h3>Fetch Statements</h3>
                  <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Input
                      type="text"
                      placeholder="Super Category Name (e.g., 'Trip to Paris')"
                      value={newSuperCategory.name}
                      onChange={(e) =>
                        setNewSuperCategory({ ...newSuperCategory, name: e.target.value })
                      }
                      style={{ flex: "1", minWidth: "200px" }}
                    />
                    <Input
                      type="date"
                      value={newSuperCategory.startDate}
                      onChange={(e) =>
                        setNewSuperCategory({ ...newSuperCategory, startDate: e.target.value })
                      }
                      style={{ width: "150px" }}
                    />
                    <Input
                      type="date"
                      value={newSuperCategory.endDate}
                      onChange={(e) =>
                        setNewSuperCategory({ ...newSuperCategory, endDate: e.target.value })
                      }
                      style={{ width: "150px" }}
                    />
                    <button
                      onClick={handleCreateSuperCategory}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      disabled={!newSuperCategory.name || !newSuperCategory.startDate || !newSuperCategory.endDate}
                    >
                      Create
                    </button>
                  </div>

                  {errorMessage && (
                    <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>
                  )}

                  {superCategories.length > 0 ? (
                    superCategories.map((superCat) => (
                      <div
                        key={superCat.name}
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          background: "#f5f5f5",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ margin: 0 }}>{superCat.name}</h4>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleSendEmail(superCat)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px 8px",
                                display: "flex",
                                alignItems: "center",
                              }}
                              title="Send to email"
                            >
                              <img
                                src="https://img.icons8.com/?size=20&id=37246&format=png&color=000000"
                                alt="Email"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteSuperCategory(superCat.name)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "red",
                                cursor: "pointer",
                                padding: "4px 8px",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          {new Date(superCat.startDate).toLocaleDateString()} -{" "}
                          {new Date(superCat.endDate).toLocaleDateString()}
                        </div>
                        <div style={{ marginTop: "8px" }}>
                          <strong>Total: ₹{superCat.total.toFixed(2)}</strong>
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                          {superCat.expenses.map((expense) => (
                            <div key={expense._id} style={{ marginBottom: "4px" }}>
                              {new Date(expense.date).toLocaleDateString()} - {expense.category}: ₹{expense.amount}
                              {expense.description && ` - ${expense.description}`}
                              <span style={{ color: "#666", marginLeft: "8px" }}>
                                (by {expense.username})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                      No super categories yet. Create one to group related expenses!
                    </div>
                  )}
                </div>
              </TaskWrapper>
            </>
          )}
        </Container>
      </AppLayout>
    </PullToRefresh>
  );
};

export default FinUI;
