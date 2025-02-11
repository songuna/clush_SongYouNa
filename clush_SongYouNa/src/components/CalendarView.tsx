import React, { useState, useEffect } from "react";
import { Calendar, Modal, Input, Button, TimePicker, DatePicker, message, Badge } from "antd";
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<'month' | 'year'>("month");
  const [currentDate, setCurrentDate] = useState(dayjs());

   // 앱이 처음 렌더링될 때 로컬스토리지에서 이벤트 불러오기
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // 날짜 선택 시
  const handleSelect = (date: Dayjs) => {

    if (currentMode === "year") {
      setCurrentMode("month"); // 연도에서 월을 선택하면 월간 뷰로 변경
      setCurrentDate(date); // 해당 월을 중앙에 표시
      return;
    }

    const existingEvent = events.find((event) => event.date === date.format("YYYY-MM-DD"));
    if (!isEventDetailsOpen && !existingEvent && currentMode === "month") {
      setSelectedDate(date.format("YYYY-MM-DD"));
      setIsModalOpen(true);
      setErrorMessage("");
    }
  };

  // 월간 뷰에서 연도 및 월 선택 시
  const handlePanelChange = (date: Dayjs, mode: 'month' | 'year') => {
    setCurrentMode(mode);
    setCurrentDate(date); // 선택한 연도나 월로 이동

     if (mode === "month" || mode === "year") {
    setIsModalOpen(false); // 모달 닫기
  }
  };

  // 일정 추가
  const handleAddEvent = () => {
    if (!selectedDate && !eventTitle.trim()) {
      setErrorMessage("날짜와 일정을 입력해주세요.");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("날짜를 선택해주세요.");
      return;
    }
    if (!eventTitle.trim()) {
      setErrorMessage("일정을 입력해주세요.");
      return;
    }


    const newEvent: Event = {
      date: selectedDate,
      title: eventTitle,
      tasks: [],
    };

    if (eventTime) {
      newEvent.time = eventTime.format("HH:mm"); // 시간을 선택했으면 추가
    }

    // 새로운 이벤트를 state에 추가하고, localStorage에도 저장
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents)); // localStorage에 저장

    setEvents([...events, newEvent]);
    setEventTitle("");
    setEventTime(null);
    setIsModalOpen(false); // 일정 추가 후 모달 닫기
    setErrorMessage("");
  };

  // 일정 수정
  const handleUpdateEvent = () => {
    if (!eventTitle.trim()) return; // 제목이 없으면 일정 수정 안함

    const updatedEvent: Event = {
      ...selectedEvent!,
      date: selectedDate,
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
   const updatedEvents = events.filter((event) => event !== eventToDelete);
    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents); // 삭제된 후 로컬스토리지에 업데이트
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

  // 월별 일정 개수 렌더링
  const monthCellRender = (date: Dayjs) => {
    const monthlyEvents = events.filter((event) => event.date.startsWith(date.format("YYYY-MM")));
    if (monthlyEvents.length > 0) {
      return <Badge count={monthlyEvents.length} style={{ backgroundColor: "#40a9ff", width:"215px", borderRadius : "5px", }} />;
    }
    return null;
  };

  return (
    <Container>
      <H1>{currentDate.format("YYYY년 MM월")}</H1>
       <Calendar 
        dateCellRender={dateCellRender} 
        monthCellRender={monthCellRender} 
        onSelect={handleSelect} 
        mode={currentMode}
        onPanelChange={handlePanelChange}
      />

      {/* 일정 추가 모달 */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <h2>일정 추가</h2>

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
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <AddTaskButton onClick={handleAddEvent}>
        일정 추가
        </AddTaskButton>
      </Modal>

      {/* 일정 상세 모달 */}
      <Modal open={isEventDetailsOpen} onCancel={() => setIsEventDetailsOpen(false)} footer={null}>
        <h2>일정 상세</h2>
        {selectedEvent && (
          <>
            <h3>{selectedEvent.title} {selectedEvent.time && `(${selectedEvent.time})`}</h3>

            <DatePicker
              value={selectedEvent ? dayjs(selectedEvent.date) : null}
              onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")}
              style={{ width: "100%", marginBottom: 10 }}
              placeholder="날짜 선택"
            />

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
            <AddTaskButton onClick={handleUpdateEvent}>
              일정 수정
            </AddTaskButton>

            <DeleteButton
              onClick={() => {
                handleDeleteEvent(selectedEvent);
                setIsEventDetailsOpen(false); // 삭제 후 상세 모달 닫기
              }}
              danger
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

const H1 = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #40a9ff;
`;

const EventList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
  font-size: 14px;
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
  margin-top: 30px;
  background-color: white;
  border-color: #d9d9d9;
  color: #40a9ff;

  &:hover {
    background-color: #40a9ff;
    color: white;
  }
`;

const DeleteButton = styled(Button)`
  margin-top: 30px;
  background-color: white;
  border-color: #d9d9d9;
  color: red;

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
