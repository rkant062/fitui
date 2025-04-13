import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
  box-sizing: border-box;
`;

const Header = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  color: #333;
  margin-left: 20px;
`;

const Caption = styled.h1`
  margin-left: 20px;
  font-family: 'San Francisco', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 2.2rem;
  color: transparent;
  background-image: linear-gradient(to right, blue, green);
  background-clip: text;
  -webkit-background-clip: text;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

const Input = styled.input`
margin: 0 5px 10px 0;

    width: 180px;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:focus {
    outline: 1px solid #4CAF50;
    border-color: #4CAF50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
`;

const LinkButton = styled.button`
  background: none;
  margin-bottom: 10px;
  align-items: end;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
 
  display: flex;
  justify-content: center;
  color: #007BFF;
  border: none;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #0056b3; // Darker shade for hover effect
  }
  &:focus {
    outline: none;
  }
`;

const ChecklistItem = styled.label`
  align-items: center;
  font-size: 1rem;
  cursor: pointer;
  input {
    margin-right: 10px;
  }
  &:hover {
    background-color: rgba(166, 212, 162, 0.4);
    border-radius: 8px;
  }
  transition: all 0.3s ease;
`;

const NewTaskInput = styled.input`
margin: 0 5px 10px 0;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 180px;
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
  width: 100px;
  transition: all 0.3s ease;
  &:hover {
    background-color: rgba(45, 245, 92, 0.62);
    box-shadow: 0 0 8px rgba(34, 255, 126, 0.3);
  }
`;

const SubmitButton = styled.button`
  width: 170px;
  height: 40px;
  padding: 12px;
  background-color: transparent;
  color: black;
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid rgba(72, 184, 180, 0.57);
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: rgba(25, 255, 152, 0.57);
  }
`;

const ChartWrapper = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 400px;
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
margin-left: 20px;
  padding: 10px;
  float: left;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background-color: rgba(25, 255, 152, 0.57);
  color: black;
  border: none;
  border-radius: 8px;
  float: right;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.3s ease;
  &:hover {
    background-color: rgba(45, 245, 92, 0.15);
    box-shadow: 0 0 8px rgba(34, 255, 126, 0.3);
  }
`;

const TaskWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LoginForm = styled.form`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
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

export const Label = styled.label`
  align-items: center;
  font-size: 1rem;
    margin-bottom: 10px;      
`;


export const CheckList= styled.div`
  display: block;
    align-items: center;
    margin-bottom: 10px;

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
    LinkButton,
    
  RefreshButton,
  TaskWrapper,
  LoginForm,
  LoginButton,
  Caption
};
