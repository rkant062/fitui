import styled from 'styled-components';

// Styled Components (improvements for better layout)
const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color:rgba(255, 255, 255, 0.29);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  height: 100vh;
`;

const Header = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5srem;
  color: #333;
  margin-left: 20px;
`;

const Caption = styled.h1`
margin-left: 20px;
  font-family: 'San Francisco', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 2.5rem;
  text-align: center;
  color: transparent;
  background-image: linear-gradient(to right, blue, green);
  background-clip: text;
  -webkit-background-clip: text;
    justify-content: center;
  font-weight: 200; /* Medium weight for a sleek look */
  letter-spacing: 0.5px; /* Slight letter-spacing for refinement */
  text-transform: uppercase; /* Optional: make text uppercase for a sleek look */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  justify-self: center;
`;


const Form = styled.form`
  display: flex;
  min-width: calc(50% - 10px);
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
`;

const ChecklistItem = styled.label`
  display: flex;
  width: 50%;
  align-items: center;
  font-size: 1rem;
  margin-bottom: 10px;
  cursor: pointer;
  input {
    margin-right: 10px;
  }
  &:hover {
    background-color: rgb(166, 212, 162);
    border-radius: 8px;
  }
  &:active {
    background-color: #ddd;
  }
  transition: all 0.3s ease;
`;

const NewTaskInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 47%;
  margin: 10px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
`;

const AddNewTaskButton = styled.button`
  padding: 10px;
  background-color: rgba(25, 255, 152, 0.57);
  color: black;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color:rgba(45, 245, 92, 0.62);
    box-shadow: 0 0 8px rgba(34, 255, 126, 0.3);
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  width: 50%;
  background-color: none;
  color: black;
  border-color: rgba(72, 184, 180, 0.57);;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
       background-color:rgba(25, 255, 152, 0.57);
       
  }
`;

const ChartWrapper = styled.div`
  
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 400px
`;

const ChartTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  justify-content: center;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  
`;

const AggregationSelect = styled.select`
  padding: 10px;
  margin: 20px;
  width: 100px;
  font-size: 1rem;
  float: center;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background-color:rgba(25, 255, 152, 0.57);
  color: black;
  border: none;
  float: right;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 5px;
  &:hover {
    background-color:rgba(45, 245, 92, 0.15);
    box-shadow: 0 0 8px rgba(34, 255, 126, 0.3);
  }
`;

const TaskWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns for tiles */
  gap: 20px; /* Space between tiles */
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  flex-direction: column;
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack tiles on small screens */
  }
    grid-template-rows: repeat(auto-fill, minmax(100px, 1fr)); /* Responsive rows */
`;

 const LoginForm = styled.form`
padding: 20px;
    
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
  margin: 0 auto;
  text-align: center;
`;

 const LoginButton = styled.button`
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background-color: #45a049;
  }
`;



export {
  Container,
  Header,
  Form,
  Input,
  ChecklistItem,
  NewTaskInput,
  AddNewTaskButton,
  SubmitButton,
  ChartWrapper,
  ChartTitle,
  ChartContainer,
  AggregationSelect,
  RefreshButton,
  TaskWrapper,
  LoginForm,
  LoginButton,
  Caption
};
