export const updateChart = (data, setChartData) => {
    if (!data || data.length === 0) {
      setChartData({});
      return;
    }
  
    const chartLabels = data.map((item) => item.day || 'No Day Info');
    const chartValues = data.map((item) => item.caloriesBurned || 0);
  
    setChartData({
      labels: chartLabels,
      datasets: [{
        label: 'Calories Burned Over Time',
        data: chartValues,
        borderColor: '#4CAF50',
        borderWidth: 2,
        fill: false,
      }],
    });
  };
  
  export const updateTotalJobsChart = (data, aggregation, setTotalJobsData) => {
    if (!data || data.length === 0) {
      setTotalJobsData({});
      return;
    }
  
    let labels = [];
    let values = [];
  
    if (aggregation === 'daily') {
      labels = data.map(item => item.day);
      values = data.map(item => item.checklist.length);
    } else if (aggregation === 'weekly') {
      const weeks = groupByWeek(data);
      labels = Object.keys(weeks);
      values = Object.values(weeks).map(week => week.length);
    } else if (aggregation === 'monthly') {
      const months = groupByMonth(data);
      labels = Object.keys(months);
      values = Object.values(months).map(month => month.length);
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
    data.forEach(item => {
      const week = new Date(item.date).getWeek();
      if (!weeks[week]) weeks[week] = [];
      weeks[week].push(item);
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
  