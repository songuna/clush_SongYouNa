import React, { useState, useEffect } from "react";
import styled from "styled-components";

interface ToDo {
  id: number;
  text: string;
  completed: boolean;
}

const ToDoList: React.FC = () => {
  const [todos, setTodos] = useState<ToDo[]>(
    JSON.parse(localStorage.getItem("todos") || "[]")
  );
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Container>
      <h2>To-Do List</h2>
      <InputContainer>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={addTodo}>Add</button>
      </InputContainer>
      <ul>
        {todos.map(todo => (
          <ListItem key={todo.id} completed={todo.completed}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </ListItem>
        ))}
      </ul>
    </Container>
  );
};

export default ToDoList;

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
  }
`;

const ListItem = styled.li<{ completed: boolean }> `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: ${({ completed }) => (completed ? "#d4edda" : "#f8d7da")};
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;

  span {
    text-decoration: ${({ completed }) => (completed ? "line-through" : "none")};
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;
