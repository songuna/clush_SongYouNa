import React, { useState } from "react";
import { Calendar, Modal, Input, Button, TimePicker, DatePicker, message } from "antd";
import styled from "styled-components";
import { PlusOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface Event {
  date: string;
  title: string;
  time?: string;
  tasks: string[];
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState<Dayjs | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 날짜 선택 시
  const handleSelect = (date: Dayjs) => {
    const existingEvent = events.find((event) => event.date === date.format("YYYY-MM-DD"));
    if (!isEventDetailsOpen && !existingEvent) {
      setSelectedDate(date.format("YYYY-MM-DD"));
      setIsModalOpen(true);
    }
  };

  // 일정 추가
  const handleAddEvent = () => {
    if (!eventTitle.trim()) {
      message.error("일정 제목을 입력해주세요.");
      return; // 제목이 없으면 일정 추가 안 함
    }

    if (!selectedDate) {
      message.error("날짜를 선택해주세요.");
      return; // 날짜가 없으면 일정 추가 안 함
    }

    const newEvent: Event = {
      date: selectedDate,
      title: eventTitle,
      tasks: [],
    };

    if (eventTime) {
      newEvent.time = eventTime.format("HH:mm"); // 시간을 선택했으면 추가
    }

    setEvents([...events, newEvent]);
    setEventTitle("");
    setEventTime(null);
    setIsModalOpen(false); // 일정 추가 후 모달 닫기
  };

  // 일정 수정
  const handleUpdateEvent = () => {
    if (!eventTitle.trim()) return; // 제목이 없으면 일정 수정 안함

    const updatedEvent: Event = {
      ...selectedEvent!,
      title: eventTitle,
      tasks: selectedEvent!.tasks,
    };

    if (eventTime) {
      updatedEvent.time = eventTime.format("HH:mm"); // 시간을 선택했으면 수정
    } else {
      delete updatedEvent.time; // 시간을 삭제하거나 그대로 두기
    }

    setEvents(
      events.map((event) =>
        event.date === selectedEvent?.date && event.title === selectedEvent?.title
          ? updatedEvent
          : event
      )
    );
    setEventTitle("");
    setEventTime(null);
    setIsEventDetailsOpen(false); // 수정 후 상세 모달 닫기
  };

  // 일정 삭제
  const handleDeleteEvent = (eventToDelete: Event) => {
    setEvents(events.filter((event) => event !== eventToDelete));
    message.success("일정이 삭제되었습니다.");
  };

  // 날짜 셀 렌더링
  const dateCellRender = (date: Dayjs) => {
    const dailyEvents = events.filter((event) => event.date === date.format("YYYY-MM-DD"));
    return (
      <EventList>
        {dailyEvents.map((event, index) => (
          <EventItem
            key={index}
            onClick={() => {
              setSelectedEvent(event);
              setIsEventDetailsOpen(true); // 일정 클릭 시 상세 모달 열기
              setEventTitle(event.title);
              setEventTime(event.time ? dayjs(event.time, "HH:mm") : null); // 시간도 함께 표시
            }}
          >
            {`${event.title}${event.time ? ` (${event.time})` : ""}`}
          </EventItem>
        ))}
      </EventList>
    );
  };

  return (
    <Container>
      <Calendar dateCellRender={dateCellRender} onSelect={handleSelect} />

      {/* 일정 추가 모달 */}
      <Modal
        title="일정 추가"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {/* 날짜 선택 */}
        <DatePicker
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")}
          style={{ width: "100%", marginBottom: 10 }}
          placeholder="날짜 선택"
        />
        <Input
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="일정 제목"
        />
        <TimePicker
          value={eventTime}
          onChange={(time) => setEventTime(time)}
          format="HH:mm"
          placeholder="시간 선택"
          style={{ width: "100%", marginTop: 10 }}
        />
        <Button onClick={handleAddEvent} type="primary" style={{ marginTop: 10 }}>
          일정 추가
        </Button>
      </Modal>

      {/* 일정 상세 모달 */}
      <Modal open={isEventDetailsOpen} onCancel={() => setIsEventDetailsOpen(false)} footer={null}>
        <h2>일정 상세</h2>
        {selectedEvent && (
          <>
            <h3>{selectedEvent.title} {selectedEvent.time && `(${selectedEvent.time})`}</h3>
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event Title"
            />
            <TimePicker
              value={eventTime}
              onChange={(time) => setEventTime(time)}
              format="HH:mm"
              style={{ width: "100%", marginTop: 10 }}
            />
            <AddTaskButton onClick={handleUpdateEvent} type="primary">
              일정 수정
            </AddTaskButton>

            <DeleteButton
              onClick={() => {
                handleDeleteEvent(selectedEvent);
                setIsEventDetailsOpen(false); // 삭제 후 상세 모달 닫기
              }}
              type="danger"
              style={{ marginLeft: 10 }}
            >
              일정 삭제
            </DeleteButton>
          </>
        )}
      </Modal>

      {/* 일정 추가 플로팅 버튼 */}
      <AddButton
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
      />
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
  background: white;
  color: black;
  padding: 3px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  cursor: pointer;
  border-left: #40a9ff 4px solid;

  &:hover {
    background-color: #40a9ff;
    color: white;
  }
`;

const AddTaskButton = styled(Button)`
  margin-top: 10px;
  background-color: white;
  border-color: #d9d9d9;
  color: #000;

  &:hover {
    background-color: #40a9ff;
    color: white;
  }
`;

const DeleteButton = styled(Button)`
  margin-top: 10px;
  background-color: white;
  border-color: #d9d9d9;
  color: #000;

  &:hover {
    background-color: red;
    color: white;
  }
`;

const AddButton = styled(Button)`
  position: fixed;
  bottom: 55px;
  right: 440px;
  z-index: 1000;
  border-radius: 50%;
  background-color: #40a9ff;
  color: white;

  &:hover {
    background-color: #1890ff;
  }
`;
