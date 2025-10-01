import { useState, useRef, useEffect } from 'react';
import { BsCalendar3 } from 'react-icons/bs';
import './Input.css';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  required?: boolean;
}

function Input({
  className = '',
  type = 'text',
  label,
  required,
  id,
  value,
  onChange,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'date' && value) {
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    }
  }, [value, type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      days.push(prevMonthLastDay - startingDayOfWeek + i + 1);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateClick = (day: number | null, isCurrentMonth: boolean) => {
    if (day === null) return;

    let newDate: Date;
    if (!isCurrentMonth) {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      if (day > 20) {
        newDate = new Date(year, month - 1, day);
      } else {
        newDate = new Date(year, month + 1, day);
      }
    } else {
      newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    }

    setSelectedDate(newDate);

    const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

    if (onChange) {
      const syntheticEvent = {
        target: { value: formattedDate },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }

    setShowDatePicker(false);
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);

    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (onChange) {
      const syntheticEvent = {
        target: { value: formattedDate },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!selectedDate || !isCurrentMonth) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  if (type === 'date') {
    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className='input-wrapper'>
        {label && (
          <label htmlFor={inputId} className='input-label'>
            {label}
            {required && <span className='input-required'>*</span>}
          </label>
        )}
        <div className='date-input-container' ref={datePickerRef}>
          <input
            type='text'
            id={inputId}
            className={`input ${className}`}
            required={required}
            value={formatDate(selectedDate)}
            placeholder='mm/dd/yyyy'
            onFocus={() => setShowDatePicker(true)}
            readOnly
            {...props}
          />
          <button
            type='button'
            className='date-input-icon'
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <BsCalendar3 size={18} />
          </button>

          {showDatePicker && (
            <div className='date-picker'>
              <div className='date-picker-header'>
                <span className='date-picker-title'>Válido Hasta</span>
              </div>

              <div className='date-picker-controls'>
                <button type='button' onClick={() => changeMonth(-1)} className='date-picker-nav'>
                  ↑
                </button>
                <span className='date-picker-month'>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button type='button' onClick={() => changeMonth(1)} className='date-picker-nav'>
                  ↓
                </button>
              </div>

              <div className='date-picker-days-header'>
                {daysOfWeek.map((day, i) => (
                  <div key={i} className='date-picker-day-name'>
                    {day}
                  </div>
                ))}
              </div>

              <div className='date-picker-days'>
                {days.map((day, index) => {
                  const isCurrentMonth =
                    index >=
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() &&
                    index <
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() +
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          0
                        ).getDate();

                  return (
                    <button
                      key={index}
                      type='button'
                      className={`date-picker-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(day!, isCurrentMonth) ? 'today' : ''} ${isSelected(day!, isCurrentMonth) ? 'selected' : ''}`}
                      onClick={() => handleDateClick(day, isCurrentMonth)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className='date-picker-footer'>
                <button type='button' onClick={handleClear} className='date-picker-btn'>
                  Clear
                </button>
                <button type='button' onClick={handleToday} className='date-picker-btn primary'>
                  Today
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='input-wrapper'>
      {label && (
        <label htmlFor={inputId} className='input-label'>
          {label}
          {required && <span className='input-required'>*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`input ${className}`}
        required={required}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export default Input;
