import React, { useState } from "react";
import styled from "styled-components";
import ToDoList from "./components/ToDoList";
import CalendarView from "./components/CalendarView";

const App: React.FC = () => {
  const [view, setView] = useState<"todo" | "calendar">("todo");

  return (
    <Container>
      <Header>
        <TabButton active={view === "todo"} onClick={() => setView("todo")}>
          📋 To Do List
        </TabButton>
        <TabButton active={view === "calendar"} onClick={() => setView("calendar")}>
          📅 Calendar
        </TabButton>
      </Header>
      <Content>{view === "todo" ? <ToDoList /> : <CalendarView />}</Content>
    </Container>
  );
};

export default App;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 768px;
  min-height: 100vh;
  background-color: var(--color-white);
  padding: 20px;
`;
 
const Header = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: ${({ active }) => (active ? "#007bff" : "#f0f0f0")};
  color: ${({ active }) => (active ? "white" : "black")};
  border: none;
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: ${({ active }) => (active ? "#0056b3" : "#d9d9d9")};
  }
`;

const Content = styled.div`
  width: 100%;
`;
