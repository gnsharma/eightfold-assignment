import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Calendar from "../calendar/Calendar";
import * as Styled from "./styles";
import { isDate, getDateISO } from "../helpers/calendar";
import { usePrevious } from "../hooks";

function Datepicker({ onDateChanged, label, value }) {
  const [date, setDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const prevValue = usePrevious(value);

  useEffect(() => {
    typeof onDateChanged === "function" && onDateChanged(date);
  }, [date, onDateChanged]);

  useEffect(() => {
    const newDate = value && new Date(value);
    isDate(newDate) && setDate(getDateISO(newDate));
  }, [value]);

  useEffect(() => {
    const dateISO = getDateISO(new Date(value));
    const prevDateISO = getDateISO(new Date(prevValue));
    dateISO !== prevDateISO && setDate(dateISO);
  }, [value, prevValue]);

  const toggleCalendar = () =>
    setIsCalendarOpen((isCalendarOpen) => !isCalendarOpen);

  const handleChange = (evt) => evt.preventDefault();

  const handleDateChange = (incomingDate) => {
    const newDate = incomingDate ? getDateISO(incomingDate) : null;
    if (date !== newDate) {
      setDate(newDate);
      setIsCalendarOpen(false);
    }
  };

  return (
    <Styled.DatePickerContainer>
      <Styled.DatePickerFormGroup>
        <Styled.DatePickerLabel>{label || "Enter Date"}</Styled.DatePickerLabel>

        <Styled.DatePickerInput
          type='text'
          value={date ? date.split("-").join(" / ") : ""}
          onChange={handleChange}
          readOnly='readonly'
          placeholder='YYYY / MM / DD'
        />
      </Styled.DatePickerFormGroup>

      <Styled.DatePickerDropdown
        isOpen={isCalendarOpen}
        toggle={toggleCalendar}
      >
        <Styled.DatePickerDropdownToggle color='transparent' />

        <Styled.DatePickerDropdownMenu>
          {isCalendarOpen && (
            <Calendar
              date={date && new Date(date)}
              onDateChanged={handleDateChange}
            />
          )}
        </Styled.DatePickerDropdownMenu>
      </Styled.DatePickerDropdown>
    </Styled.DatePickerContainer>
  );
}

Datepicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onDateChanged: PropTypes.func,
};

export default Datepicker;
