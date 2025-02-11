import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DatePicker } from "antd"; // DatePicker import
import type { Dayjs } from "dayjs";
import moment from "moment"; // DatePicker에 필요한 moment 사용
import { IoIosClose } from "react-icons/io";

interface ToDo {
  id: number;
  text: string;
  completed: boolean;
  date: string; // 날짜 속성 추가
}

const ToDoList: React.FC = () => {
  const [todos, setTodos] = useState<ToDo[]>(JSON.parse(localStorage.getItem("todos") || "[]"));
  const [input, setInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!selectedDate && !input.trim()) {
      setErrorMessage("날짜와 할 일을 입력해주세요");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("날짜를 선택해 주세요");
      return;
    }
    if (!input.trim()) {
      setErrorMessage("할 일을 입력해주세요");
      return;
    }
    
    setTodos([...todos, { id: Date.now(), text: input, completed: false, date: selectedDate }]);
    setInput("");
    setErrorMessage(""); // 에러 메시지 초기화
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const onDateSelect = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format("YYYY-MM-DD"));
      setErrorMessage(""); // 날짜 선택 시 에러 메시지 제거
    }
  };

  const today = new Date();
  const dateString = today.toISOString().split("T")[0];
  const filteredTodos = todos.filter(todo => todo.date === selectedDate);

  return (
    <Container>
      <h2>To-Do List</h2>
      <DateDisplay>{`Today : ${dateString}`}</DateDisplay>
      <SelectedDateDisplay>{`Select Day : ${selectedDate}`}</SelectedDateDisplay>
      <DatePickerContainer>
        <DatePickerStyled
          value={selectedDate ? moment(selectedDate) : null}
          onChange={onDateSelect}
          format="YYYY-MM-DD"
          placeholder="날짜 선택"
        />
      </DatePickerContainer>
      <InputContainer>
        <InputField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="할 일을 입력하세요"
        />
        <AddButton onClick={addTodo}>추가</AddButton>
      </InputContainer>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>} {/* 에러 메시지 표시 */}
      <TodoList>
        {filteredTodos.map(todo => (
          <ListItem key={todo.id} completed={todo.completed}>
            <Checkbox
              type="checkbox"
              size={20}
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <DeleteButton onClick={() => deleteTodo(todo.id)}><IoIosClose size={24}/></DeleteButton>
          </ListItem>
        ))}
      </TodoList>
    </Container>
  );
};

export default ToDoList;

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const DateDisplay = styled.div`
  font-size: 15px;
  margin-bottom: 15px;
  color: #333;
`;

const SelectedDateDisplay = styled.div`
  font-size: 15px;
  margin: 10px 0px;
  color: #007bff;
`;

const DatePickerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const DatePickerStyled = styled(DatePicker)`
  width: 100%;
  max-width: 300px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const AddButton = styled.button`
  background: white;
  color: #007bff;
  border: 1px solid #ccc;
  padding: 9px 14px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li<{ completed: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${({ completed }) => (completed ? "#c3e6cb" : "#f5c6cb")};
  }

  span {
    text-decoration: ${({ completed }) => (completed ? "line-through" : "none")};
    flex: 1;
    font-size: 15px;
    color: black;
  }
`;

const Checkbox = styled.input`
  margin:0px 14px;
`;

const DeleteButton = styled.button`
  background: transparent;
  cursor: pointer;
  transition: color 0.3s ease;
  border: none;

  &:hover {
    color: #c82333;
  }
`;
