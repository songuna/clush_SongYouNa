import React, { useState, useEffect } from "react";
import { Calendar, Modal, Input, Button, TimePicker, DatePicker, message, Badge } from "antd";
import styled from "styled-components";
import { PlusOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface Event {
  date: string;
  title: string;
  startTime?: string;
  endTime?: string;
  tasks: string[];
  memo?: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartTime, setEventStartTime] = useState<Dayjs | null>(null);
  const [eventEndTime, setEventEndTime] = useState<Dayjs | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<'month' | 'year'>("month");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [eventMemo, setEventMemo] = useState<string>(""); // 메모 상태 추가

  // 앱이 처음 렌더링될 때 로컬스토리지에서 이벤트 불러오기
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // 날짜 선택 시
  const handleSelect = (date: Dayjs) => {
    if (currentMode === "year") {
      setCurrentMode("month");
      setCurrentDate(date);
      return;
    }

    const existingEvent = events.find((event) => event.date === date.format("YYYY-MM-DD"));
    if (!isEventDetailsOpen && !existingEvent && currentMode === "month") {
      setSelectedDate(date.format("YYYY-MM-DD"));
      setIsModalOpen(true);
      setErrorMessage("");
      resetForm();
    }
  };

  // 월간 뷰에서 연도 및 월 선택 시
  const handlePanelChange = (date: Dayjs, mode: 'month' | 'year') => {
    setCurrentMode(mode);
    setCurrentDate(date);
    if (mode === "month" || mode === "year") {
      setIsModalOpen(false); // 모달 닫기
    }
  };

  // 일정 추가
  const handleAddEvent = () => {
  if (validateEventInput()) {
    const newEvent: Event = createEvent();
    const updatedEvents = [...events, newEvent];
    updateEventsState(updatedEvents); // 새로운 일정 추가 후 폼 리셋
  }
};


 // 일정 수정
const handleUpdateEvent = () => {
  if (!eventTitle.trim()) return;

  const updatedEvent: Event = { 
    ...selectedEvent!, 
    title: eventTitle, 
    tasks: selectedEvent!.tasks, 
    startTime: eventStartTime?.format("HH:mm"), 
    endTime: eventEndTime?.format("HH:mm"),
    memo: eventMemo, // 수정된 메모 반영
  };
  const updatedEvents = events.map((event) =>
    event.date === selectedEvent?.date && event.title === selectedEvent?.title ? updatedEvent : event
  );
  updateEventsState(updatedEvents);
  setIsEventDetailsOpen(false);
};

  // 일정 삭제
  const handleDeleteEvent = (eventToDelete: Event) => {
  const updatedEvents = events.filter((event) => event !== eventToDelete); // 삭제할 이벤트를 제외한 새로운 배열 생성
  updateEventsState(updatedEvents); // 상태 업데이트
  message.success("일정이 삭제되었습니다."); // 삭제 성공 메시지 표시
  setIsEventDetailsOpen(false); // 이벤트 상세 모달 닫기
};

  // 이벤트 유효성 검사
  const validateEventInput = () => {
    if (!selectedDate && !eventTitle.trim()) {
      setErrorMessage("날짜와 일정을 입력해주세요.");
      return false;
    }
    if (!selectedDate) {
      setErrorMessage("날짜를 선택해주세요.");
      return false;
    }
    if (!eventTitle.trim()) {
      setErrorMessage("일정을 입력해주세요.");
      return false;
    }
    return true;
  };

  // 이벤트 객체 생성
  const createEvent = (): Event => ({
    date: selectedDate,
    title: eventTitle,
    tasks: [],
    startTime: eventStartTime ? eventStartTime.format("HH:mm") : undefined,
    endTime: eventEndTime ? eventEndTime.format("HH:mm") : undefined,
    memo: eventMemo, // 메모 추가
  });

  // 상태 업데이트 및 로컬스토리지 저장
const updateEventsState = (updatedEvents: Event[]) => {
  setEvents(updatedEvents);
  localStorage.setItem("events", JSON.stringify(updatedEvents));
  resetForm(); // 일정 추가 후 폼 리셋
};

  // 폼 리셋
  const resetForm = () => {
    setEventTitle("");
    setEventStartTime(null);
    setEventEndTime(null);
    setIsModalOpen(false);
    setErrorMessage("");
    setEventMemo("");
  };

 

  // 날짜 셀 렌더링
  const dateCellRender = (date: Dayjs) => {
    const dailyEvents = events.filter((event) => event.date === date.format("YYYY-MM-DD"));
    return (
      <EventList>
        {dailyEvents.map((event, index) => (
          <EventItem
            key={index}
            style={{
              color: shouldChangeColor(event.startTime) ? "#ccc" : "black",
              textDecoration: shouldChangeColor(event.endTime) ? "line-through" : "none",
            }}
            onClick={() => handleEventClick(event)}
          >
            {`${event.title}${event.startTime ? ` (${event.startTime})` : ""}`}
          </EventItem>
        ))}
      </EventList>
    );
  };

  // 월별 일정 개수 렌더링
  const monthCellRender = (date: Dayjs) => {
    const monthlyEvents = events.filter((event) => event.date.startsWith(date.format("YYYY-MM")));
    return monthlyEvents.length > 0 ? 
      <Badge 
        count={monthlyEvents.length} 
        style={{ backgroundColor: "#40a9ff", 
        borderRadius: "5px", 
        width: "217px"
      }} /> : null;
  };

  // 일정 클릭 시 상세 모달 열기
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
    setEventTitle(event.title);
    setEventStartTime(event.startTime ? dayjs(event.startTime, "HH:mm") : null);
    setEventEndTime(event.endTime ? dayjs(event.endTime, "HH:mm") : null);
    setEventMemo(event.memo || "");
  };

  // 시간이 지난 경우 글꼴 색상 변경
  const shouldChangeColor = (time?: string) => {
    if (!time) return false;
    const eventTime = dayjs(time, "HH:mm");
    return eventTime.isBefore(dayjs(), "minute");
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

      <Modal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}>
        <h2>일정 추가</h2>
        <DatePicker 
          value={selectedDate ? dayjs(selectedDate) : null} 
          onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")} 
          style={{ width: "100%", marginBottom: 13 }}
          placeholder="날짜 선택" 
        />
        <Input 
          value={eventTitle} 
          onChange={(e) => setEventTitle(e.target.value)} 
          placeholder="일정 제목" 
        />
        <TimePicker 
          value={eventStartTime} 
          onChange={(time) => setEventStartTime(time)} 
          format="HH:mm" 
          style={{ width: "100%", marginTop: 13 }}
          placeholder="시작 시간"
        />
        <TimePicker 
          value={eventEndTime} 
          onChange={(time) => setEventEndTime(time)} 
          format="HH:mm" 
          style={{ width: "100%", marginTop: 5 }}
          placeholder="종료 시간" 
        />
        <Input.TextArea 
          value={eventMemo} 
          onChange={(e) => setEventMemo(e.target.value)} 
          placeholder="메모" 
          rows={4} 
          style={{ marginTop: 10 }}
        />
        
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <AddTaskButton onClick={handleAddEvent}>일정 추가</AddTaskButton>
      </Modal>

      <Modal 
        open={isEventDetailsOpen} 
        onCancel={() => setIsEventDetailsOpen(false)} 
        footer={null}>
        <h2>일정 상세</h2>
        {selectedEvent && (
          <>
            <H3>{selectedEvent.title} {selectedEvent.startTime && `(${selectedEvent.startTime})`}</H3>
            <DatePicker 
              value={dayjs(selectedEvent.date)} 
              onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")} 
              style={{ width: "100%", marginBottom: 13 }}
              placeholder="날짜 선택" 
            />
            <Input 
              value={eventTitle} 
              onChange={(e) => setEventTitle(e.target.value)} 
              placeholder="일정 제목" 
            />
            <TimePicker 
              value={eventStartTime} 
              onChange={(time) => setEventStartTime(time)} 
              format="HH:mm" 
              style={{ width: "100%", marginTop: 13 }} 
              placeholder="시작 시간"
            />
            <TimePicker 
              value={eventEndTime} 
              onChange={(time) => setEventEndTime(time)} 
              format="HH:mm" 
              style={{ width: "100%", marginTop: 5 }} 
              placeholder="종료 시간"
            />
            <Input.TextArea 
              value={eventMemo} 
              onChange={(e) => setEventMemo(e.target.value)} 
              placeholder="메모" 
              rows={4} 
              style={{ marginTop: 10 }}
            />
            <AddTaskButton onClick={handleUpdateEvent}>일정 수정</AddTaskButton>
            <DeleteButton onClick={() => handleDeleteEvent(selectedEvent)} danger>일정 삭제</DeleteButton>
          </>
        )}
      </Modal>

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

const H3 = styled.h3`
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
  margin-left: 10px;
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
