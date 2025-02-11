import React, { useState } from "react";
import { Calendar, Modal, Input, Button } from "antd";
import styled from "styled-components";
import type { Dayjs } from "dayjs";

interface Event {
  date: string;
  title: string;
  tasks: string[];
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [task, setTask] = useState("");

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim()) return;
    setEvents([...events, { date: selectedDate, title: eventTitle, tasks: [] }]);
    setEventTitle("");
    setIsModalOpen(false);
  };

  const handleAddTask = (date: string) => {
    setEvents(events.map(event => 
      event.date === date ? { ...event, tasks: [...event.tasks, task] } : event
    ));
    setTask("");
  };

  const dateCellRender = (date: Dayjs) => {
    const dailyEvents = events.filter(event => event.date === date.format("YYYY-MM-DD"));
    return (
      <EventList>
        {dailyEvents.map((event, index) => (
          <div key={index}>
            <EventItem>{event.title}</EventItem>
            <TaskList>
              {event.tasks.map((t, i) => (
                <TaskItem key={i}>{t}</TaskItem>
              ))}
            </TaskList>
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Add Task"
            />
            <Button onClick={() => handleAddTask(event.date)} type="default">
              Add Task
            </Button>
          </div>
        ))}
      </EventList>
    );
  };

  return (
    <Container>
      <Calendar dateCellRender={dateCellRender} onSelect={handleSelect} />
      <Modal
        title="일정"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Input
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Event Title"
        />
        <Button onClick={handleAddEvent} type="primary" style={{ marginTop: 10 }}>
          일정 추가
        </Button>
      </Modal>
    </Container>
  );
};

export default CalendarView;

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const EventList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const EventItem = styled.li`
  background: #1890ff;
  color: white;
  padding: 5px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 5px;
`;

const TaskItem = styled.li`
  background: #f0f0f0;
  padding: 3px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 2px;
  text-align: center;
`;
