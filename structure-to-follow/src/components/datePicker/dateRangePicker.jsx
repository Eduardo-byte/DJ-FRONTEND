// components/DateRangePicker.jsx

import React, { useState } from 'react';
import { RangeCalendar, RadioGroup, Radio, ButtonGroup, Button } from "@heroui/react";
import {
    today,
    getLocalTimeZone,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from '@internationalized/date';
import { useLocale } from '@react-aria/i18n';

const DateRangePicker = ({ value, onDateChange, showQuickSelect = true, showTopContent = true }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { locale } = useLocale();
    const [focusedValue, setFocusedValue] = useState(today(getLocalTimeZone()));

    const handleCalendarToggle = () => {
        setCalendarOpen(!calendarOpen);
    };

    const handleQuickSelectChange = (selectedValue) => {
        const now = today(getLocalTimeZone());
        let newValue;

        switch (selectedValue) {
            case 'today':
                newValue = { start: now, end: now };
                break;
            case 'last_7_days':
                newValue = { start: now.subtract({ days: 6 }), end: now };
                break;
            case 'last_14_days':
                newValue = { start: now.subtract({ days: 13 }), end: now };
                break;
            case 'last_30_days':
                newValue = { start: now.subtract({ days: 29 }), end: now };
                break;
            default:
                newValue = { start: now.subtract({ days: 6 }), end: now };
                break;
        }

        onDateChange(newValue);
        setCalendarOpen(false);
    };

    const handleButtonClick = (preset) => {
        const now = today(getLocalTimeZone());
        let newValue;

        switch (preset) {
            case 'last_week':
                newValue = {
                    start: startOfWeek(now.subtract({ weeks: 1 }), locale),
                    end: endOfWeek(now.subtract({ weeks: 1 }), locale),
                };
                break;
            case 'this_month':
                newValue = {
                    start: startOfMonth(now),
                    end: endOfMonth(now),
                };
                break;
            case 'last_year':
                newValue = {
                    start: now.subtract({ years: 5 }),
                    end: now,
                };
                break;
            default:
                return;
        }

        onDateChange(newValue);
        setCalendarOpen(false);
    };

    const CustomRadio = (props) => {
        const { children, ...otherProps } = props;
        return (
            <Radio
                size='sm'
                {...otherProps}
                classNames={{
                    base: "flex-none m-0 bg-content1 hover:bg-content2 items-center justify-between cursor-pointer rounded-full border-2 border-default-200/60 data-[selected=true]:border-primary",
                    label: "text-tiny text-default-500",
                    labelWrapper: "px-1 m-0",
                    value: 'text-[12px]',
                    wrapper: "hidden",
                }}
            >
                {children}
            </Radio>
        );
    };
    return (
        <div className="relative sm:min-w-[300px]">
            <input
                type="text"
                value={`${value.start.toDate(getLocalTimeZone()).toDateString()} - ${value.end.toDate(getLocalTimeZone()).toDateString()}`}
                readOnly
                className="w-full text-[14px] px-2  py-1 border rounded cursor-pointer"
                onClick={handleCalendarToggle}
            />

            {calendarOpen && (
                <div className="absolute right-0 min-w-[400px] z-50 bg-transparent border rounded-lg w-full">
                    <RangeCalendar
                        className="flex flex-col justify-center align-middle items-center w-full"
                        value={value}
                        onChange={onDateChange}
                        focusedValue={focusedValue}
                        onFocusChange={setFocusedValue}
                        topContent={
                            showTopContent && (
                                <ButtonGroup
                                    fullWidth
                                    className="px-3 min-w-full pb-2 pt-3 bg-content1 w-full"
                                    //radius="full"
                                    size="sm"
                                    variant="bordered"
                                >
                                    <Button onPress={() => handleButtonClick('last_week')}>Last Week</Button>
                                    <Button onPress={() => handleButtonClick('this_month')}>This Month</Button>
                                    <Button onPress={() => handleButtonClick('last_year')}>Last Year</Button>
                                </ButtonGroup>
                            )
                        }
                        bottomContent={
                            <RadioGroup
                                aria-label="Date precision"
                                //defaultValue={value}
                                //className="w-full"
                                classNames={{ base: "w-full pb-2", wrapper: "-my-2.5 py-2.5 px-3 gap-1 flex-nowrap overflow-x-scroll" }}
                                orientation="horizontal"
                                onChange={(e) => handleQuickSelectChange(e.target.value)}  // Pass the selected value
                            >
                                <CustomRadio value="today">Today</CustomRadio>
                                <CustomRadio value="last_7_days">Last 7 Days</CustomRadio>
                                <CustomRadio value="last_14_days">Last 14 Days</CustomRadio>
                                <CustomRadio value="last_30_days">Last 30 Days</CustomRadio>
                            </RadioGroup>


                        }

                    />
                    <p className="text-default-500 text-sm" style={{ visibility: "hidden" }}>
                        Selected date:{" "}
                        {value
                            ? `${value.start.toDate(getLocalTimeZone()).toDateString()} - ${value.end.toDate(getLocalTimeZone()).toDateString()}`
                            : "--"}

                    </p>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
