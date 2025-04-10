import React from 'react';
import { AggregationSelect } from '../styles/Styledcomponents';

const AggregationSelectComponent = ({ setAggregationOption, aggregationOption }) => {
  return (
    <AggregationSelect onChange={(e) => setAggregationOption(e.target.value)} value={aggregationOption}>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </AggregationSelect>
  );
};

export default AggregationSelectComponent;
