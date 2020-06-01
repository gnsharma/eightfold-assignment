import React, {
  Fragment,
  useState,
  useEffect,
  useReducer,
  useRef,
} from "react";
import PropTypes from "prop-types";
import * as Styled from "./styles";
import {
  buildCalendar,
  isDate,
  isSameDay,
  isSameMonth,
  getDateISO,
  getNextMonth,
  getPreviousMonth,
  WEEK_DAYS,
  CALENDAR_MONTHS,
} from "../helpers/calendar";
import { usePrevious } from "../hooks";

const resolveStateFromDate = (date) => {
  const isDateObject = isDate(date);
  const _date = isDateObject ? date : new Date();

  return {
    current: isDateObject ? date : null,
    month: +_date.getMonth() + 1,
    year: _date.getFullYear(),
  };
};

const dateReducer = (currentState, action) => {
  const { current, month, year } = currentState;
  switch (action.type) {
    case "SET_DATE": {
      const { date } = action.payload;
      return {
        ...currentState,
        ...resolveStateFromDate(date),
      };
    }
    case "GO_TO_PREVIOUS_MONTH": {
      return {
        ...currentState,
        ...getPreviousMonth(month, year),
      };
    }
    case "GO_TO_NEXT_MONTH": {
      return {
        ...currentState,
        ...getNextMonth(month, year),
      };
    }
    case "GO_TO_PREVIOUS_YEAR": {
      return {
        ...currentState,
        year: year - 1,
      };
    }
    case "GO_TO_NEXT_YEAR": {
      return {
        ...currentState,
        year: year + 1,
      };
    }
    default: {
      return { current, month, year };
    }
  }
};

function Calendar({ date, onDateChanged }) {
  const [{ current, month, year }, dispatch] = useReducer(
    dateReducer,
    resolveStateFromDate(date)
  );
  const [today, setToday] = useState(new Date());
  const pressureTimeout = useRef();
  const pressureTimer = useRef();
  const dayTimeout = useRef();
  const prevDate = usePrevious(date);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
    const ms = tomorrow - now;

    dayTimeout.current = setTimeout(() => {
      setToday(new Date());
    }, ms);

    return () => {
      clearPressureTimer();
      clearDayTimeout();
    };
  }, []);

  useEffect(() => {
    clearDayTimeout();
  }, [today]);

  useEffect(() => {
    typeof onDateChanged === "function" && onDateChanged(current);
  }, [current, month, year, date, onDateChanged]);

  useEffect(() => {
    const dateMatch = date === prevDate || isSameDay(date, prevDate);
    !dateMatch && dispatch({ type: "SET_DATE", payload: { date } });
  }, [date, prevDate]);

  const clearDayTimeout = () => {
    dayTimeout.current && clearTimeout(dayTimeout.current);
  };

  const getCalendarDates = () => {
    const calendarMonth = month || +current.getMonth() + 1;
    const calendarYear = year || current.getFullYear();

    return buildCalendar(calendarMonth, calendarYear);
  };

  const gotoDate = (date) => (event) => {
    event && event.preventDefault();
    if (!(current && isSameDay(date, current))) {
      dispatch({ type: "SET_DATE", payload: { date } });
    }
  };

  const gotoPreviousMonth = () => {
    dispatch({ type: "GO_TO_PREVIOUS_MONTH" });
  };

  const gotoNextMonth = () => {
    dispatch({ type: "GO_TO_NEXT_MONTH" });
  };

  const gotoPreviousYear = () => {
    dispatch({ type: "GO_TO_PREVIOUS_YEAR" });
  };

  const gotoNextYear = () => {
    dispatch({ type: "GO_TO_NEXT_YEAR" });
  };

  const handlePressure = (fn) => {
    if (typeof fn === "function") {
      fn();
      pressureTimeout.current = setTimeout(() => {
        pressureTimer.current = setInterval(fn, 100);
      }, 500);
    }
  };

  const clearPressureTimer = () => {
    pressureTimer.current && clearInterval(pressureTimer.current);
    pressureTimeout.current && clearTimeout(pressureTimeout.current);
  };

  const handlePrevious = (evt) => {
    evt && evt.preventDefault();
    const fn = evt.shiftKey ? gotoPreviousYear : gotoPreviousMonth;
    handlePressure(fn);
  };

  const handleNext = (evt) => {
    evt && evt.preventDefault();
    const fn = evt.shiftKey ? gotoNextYear : gotoNextMonth;
    handlePressure(fn);
  };

  // Render the month and year header with arrow controls
  // for navigating through months and years
  const renderMonthAndYear = () => {
    // Resolve the month name from the CALENDAR_MONTHS object map
    const monthname = Object.keys(CALENDAR_MONTHS)[
      Math.max(0, Math.min(month - 1, 11))
    ];

    return (
      <Styled.CalendarHeader>
        <Styled.ArrowLeft
          onMouseDown={handlePrevious}
          onMouseUp={clearPressureTimer}
          title='Previous Month'
        />

        <Styled.CalendarMonth>
          {monthname} {year}
        </Styled.CalendarMonth>

        <Styled.ArrowRight
          onMouseDown={handleNext}
          onMouseUp={clearPressureTimer}
          title='Next Month'
        />
      </Styled.CalendarHeader>
    );
  };

  // Render the label for day of the week
  // This method is used as a map callback as seen in render()
  const renderDayLabel = (day, index) => {
    // Resolve the day of the week label from the WEEK_DAYS object map
    const daylabel = WEEK_DAYS[day].toUpperCase();

    return (
      <Styled.CalendarDay key={daylabel} index={index}>
        {daylabel}
      </Styled.CalendarDay>
    );
  };

  // Render a calendar date as returned from the calendar builder function
  // This method is used as a map callback as seen in render()
  const renderCalendarDate = (date, index) => {
    const _date = new Date(date.join("-"));

    // Check if calendar date is same day as today
    const isToday = isSameDay(_date, today);

    // Check if calendar date is same day as currently selected date
    const isCurrent = current && isSameDay(_date, current);

    // Check if calendar date is in the same month as the state month and year
    const inMonth =
      month && year && isSameMonth(_date, new Date([year, month, 1].join("-")));

    // The click handler
    const onClick = gotoDate(_date);

    const props = { index, inMonth, onClick, title: _date.toDateString() };

    // Conditionally render a styled date component
    const DateComponent = isCurrent
      ? Styled.HighlightedCalendarDate
      : isToday
      ? Styled.TodayCalendarDate
      : Styled.CalendarDate;

    return (
      <DateComponent key={getDateISO(_date)} {...props}>
        {_date.getDate()}
      </DateComponent>
    );
  };

  return (
    <Styled.CalendarContainer>
      {renderMonthAndYear()}

      <Styled.CalendarGrid>
        <Fragment>{Object.keys(WEEK_DAYS).map(renderDayLabel)}</Fragment>

        <Fragment>{getCalendarDates().map(renderCalendarDate)}</Fragment>
      </Styled.CalendarGrid>
    </Styled.CalendarContainer>
  );
}

Calendar.propTypes = {
  date: PropTypes.instanceOf(Date),
  onDateChanged: PropTypes.func,
};

export default Calendar;
