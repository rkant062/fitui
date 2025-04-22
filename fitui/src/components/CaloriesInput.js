import React from 'react';
import { Input, Label } from '../styles/Styledcomponents';

const CaloriesInput = ({ value, onChange }) => {
  return (
    <div>
      <Input
        type="number"
        name="caloriesBurned"
        value={value}
        onChange={onChange}
        placeholder="Enter Calories Burned"
      />
      <Label>KCal</Label>
    </div>
  );
};

export default CaloriesInput;
