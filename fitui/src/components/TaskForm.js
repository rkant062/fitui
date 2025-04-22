import React from 'react';
import {
  Form,
  NewTaskInput,
  AddNewTaskButton,
  LinkButton,
  CheckList,
  ChecklistItem,
  Input,
  Label,
  SubmitButton
} from '../styles/Styledcomponents';
import Spinner from './Spinner';

const TaskForm = ({
  formData,
  checklistItems,
  newTask,
  loading,
  progressColor,
  handleInputChange,
  handleChecklistChange,
  handleNewTaskChange,
  handleAddNewTask,
  handleSetDefaultChecklist,
  handleDeleteTask,
  handleSubmit
}) => {
  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <h3>Select Your Activities:</h3>
        <div>
          <NewTaskInput
            type="text"
            value={newTask}
            onChange={handleNewTaskChange}
            placeholder="Add new task"
          />
          <AddNewTaskButton
            bgColor={progressColor}
            type="button"
            onClick={handleAddNewTask}
          >
            Add task
          </AddNewTaskButton>
          <LinkButton type="button" onClick={handleSetDefaultChecklist}>
            Set as Default Checklist
          </LinkButton>
        </div>

        {checklistItems.filter(item => !item.completed).length > 0 ? (
          checklistItems.filter(item => !item.completed).map((item) => (
            <CheckList key={item._id}>
              <ChecklistItem>
                <input
                  type="checkbox"
                  checked={formData.checklist.includes(item.task)}
                  onChange={(e) => handleChecklistChange(e, item.task)}
                />
                <span>{item.task}</span>
              </ChecklistItem>
              <span onClick={() => handleDeleteTask(item)} style={{ cursor: 'pointer' }}>
                🗑️
              </span>
            </CheckList>
          ))
        ) : (
          <p>No checklist items. Add a new one above.</p>
        )}
      </div>

      <div>
        <Input
          type="number"
          name="caloriesBurned"
          onChange={handleInputChange}
          placeholder="Enter Calories Burned"
        />
        <Label>KCal</Label>
      </div>

      <SubmitButton bgColor={progressColor} type="submit" disabled={loading}>
        {loading ? <Spinner /> : 'Submit'}
      </SubmitButton>

      {checklistItems.filter(item => item.completed).length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4 style={{ margin: '0' }}>✅ Completed Tasks:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {checklistItems
              .filter(item => item.completed)
              .map(item => (
                <li key={item._id} style={{ textDecoration: 'line-through', opacity: 0.7 }}>
                  {item.task}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Form>
  );
};

export default TaskForm;
