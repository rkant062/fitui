import React, { useMemo } from 'react';
import styled from 'styled-components';
import { addDays, format, subDays, isSameDay, parseISO } from 'date-fns';

// Styled Components
const FireContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  margin-left: 20px;

  @media (max-width: 768px) {
  margin-left: 0;
`;

const FireButton = styled.div`
  //background: ${(props) => (props.completed ? '#e0ffe0' : '#ffe0e0')};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  cursor: default;
  position: relative;

  img, span {
    width: 24px;
    height: 24px;
    font-size: 20px;
  }
`;

const WeeklyFireTracker = ({ weekData = [] }) => {
  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  }, []);

  const completionMap = useMemo(() => {
    return last7Days.map((date) => {
      const dayData = weekData.find((entry) =>
        isSameDay(parseISO(entry.date), date)
      );

      const completed = dayData?.checklist?.length > 0 &&
                        dayData.checklist.every(task => task.completed);

      return {
        dateObj: date,
        completed,
      };
    });
  }, [weekData, last7Days]);

  return (
    <FireContainer>
      {completionMap.map((day, idx) => {
        const formatted = `${format(day.dateObj, 'EEE')} - ${format(day.dateObj, 'yyyy-MM-dd')}`;
        
        return (
          <FireButton
            key={idx}
            completed={day.completed}
            title={`Tasks for ${formatted}: ${day.completed ? 'Completed' : 'Incomplete'}`}
          >
            {day.completed ? (
              <img
                src="https://img.icons8.com/?size=70&id=GePHHPDUoJrZ&format=png&color=000122"
                alt="Trophy"
              />
            ) : (<img
                src="https://img.icons8.com/?size=30&id=3062&format=png&color=FA5252"
                alt="Miss"
                />
            )}
          </FireButton>
        );
      })}
    </FireContainer>
  );
};

export default WeeklyFireTracker;
