export const groupByDay = (data) => {
    const days = {};
    data.forEach(item => {
      const date = new Date(item.date);
      const label = `${date.getDate()}/${date.getMonth() + 1}`; // Format as DD/MM
      if (!days[label]) days[label] = [];
      days[label].push(item);
    });
  
    // Sort the days array
    const sortedDays = Object.keys(days).sort((a, b) => {
      const [dayA, monthA] = a.split('/');
      const [dayB, monthB] = b.split('/');
      return new Date(2020, monthA - 1, dayA) - new Date(2020, monthB - 1, dayB); // Sort chronologically
    });
  
    const sortedDaysData = {};
    sortedDays.forEach(day => {
      sortedDaysData[day] = days[day];
    });
  
    return sortedDaysData;
  };
  
  
  export const groupByWeek = (data) => {
    const weeks = {};
  
    data.forEach(item => {
      const date = new Date(item.date);
      const month = date.toLocaleString('default', { month: 'short' }).toUpperCase(); // "APR"
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOfMonth = date.getDate();
      const weekNumber = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7); // Week number
  
      const label = `${month} W${weekNumber}`; // Format as "APR W1"
      if (!weeks[label]) weeks[label] = [];
      weeks[label].push(item);
    });
  
    // Sort weeks chronologically
    const sortedWeeks = Object.keys(weeks).sort((a, b) => {
      const [monthA, weekA] = a.split(' ');
      const [monthB, weekB] = b.split(' ');
      const monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB) || weekA.slice(1) - weekB.slice(1); // Sort by month and week number
    });
  
    const sortedWeeksData = {};
    sortedWeeks.forEach(week => {
      sortedWeeksData[week] = weeks[week];
    });
  
    return sortedWeeksData;
  };
  
  
  export const groupByMonth = (data) => {
    const months = {};
  
    data.forEach(item => {
      const date = new Date(item.date);
      const month = date.toLocaleString('default', { month: 'short' }).toUpperCase(); // "Jan", "Feb"
      const year = date.getFullYear();
      const label = `${month} ${year}`; // Format as "Jan 2021"
      
      if (!months[label]) months[label] = [];
      months[label].push(item);
    });
  
    // Sort months chronologically
    const sortedMonths = Object.keys(months).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      return yearA - yearB || monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB); // Sort by year and month
    });
  
    const sortedMonthsData = {};
    sortedMonths.forEach(month => {
      sortedMonthsData[month] = months[month];
    });
  
    return sortedMonthsData;
  };
  
