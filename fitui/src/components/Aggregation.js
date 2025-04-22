import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const formatToIST = (date) => {
  return dayjs(date).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
};
// Convert any date string to IST
const toISTDate = (utcDateStr) => {
  const date = new Date(utcDateStr);
  const offsetIST = 5.5 * 60; // IST offset in minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + offsetIST * 60000);
};

// Helper for month sorting
const monthOrder = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * Group by Day (DD/MM/YYYY format in IST)
 */
const toLogicalISTDate = (utcStr) => {
  const date = new Date(utcStr);
  return new Date(date.getTime() + 5.5 * 60 * 60000); // add IST offset
};

export const groupByDay = (data) => {
  const days = {};

  data.forEach((item) => {
    // Convert to IST and format as YYYY-MM-DD
    const label = dayjs(item.date).tz("Asia/Kolkata").format("YYYY-MM-DD");

    if (!days[label]) days[label] = [];
    days[label].push(item);
  });

  // Sort by date keys
  const sortedLabels = Object.keys(days).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const sortedData = {};
  sortedLabels.forEach((label) => {
    sortedData[label] = days[label];
  });

  return sortedData;
};

/**
 * Group by Week (e.g. "APR W1")
 */
export const groupByWeek = (data) => {
  const weeks = {};

  data.forEach((item) => {
    const date = toISTDate(item.date);
    const month = date
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const weekNumber = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
    const label = `${month} W${weekNumber} ${year}`;

    if (!weeks[label]) weeks[label] = [];
    weeks[label].push(item);
  });

  const sortedLabels = Object.keys(weeks).sort((a, b) => {
    const [monthA, weekA, yearA] = a.split(" ");
    const [monthB, weekB, yearB] = b.split(" ");
    return (
      yearA - yearB ||
      monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB) ||
      parseInt(weekA.slice(1)) - parseInt(weekB.slice(1))
    );
  });

  const sortedData = {};
  sortedLabels.forEach((label) => (sortedData[label] = weeks[label]));
  return sortedData;
};

/**
 * Group by Month (e.g. "APR 2024")
 */
export const groupByMonth = (data) => {
  const months = {};

  data.forEach((item) => {
    const date = toISTDate(item.date);
    const month = date
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();
    const label = `${month} ${year}`;

    if (!months[label]) months[label] = [];
    months[label].push(item);
  });

  const sortedLabels = Object.keys(months).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    return (
      yearA - yearB || monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
    );
  });

  const sortedData = {};
  sortedLabels.forEach((label) => (sortedData[label] = months[label]));
  return sortedData;
};
