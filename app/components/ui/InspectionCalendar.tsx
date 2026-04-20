"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, isSameMonth, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isBefore, startOfToday, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface InspectionCalendarProps {
  officeId?: number;
  onSelectSlot: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export default function InspectionCalendar({
  officeId,
  onSelectSlot,
  selectedDate,
  selectedTime,
}: InspectionCalendarProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [scheduleConfig, setScheduleConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDate, setActiveDate] = useState<Date | null>(selectedDate ? parseISO(selectedDate) : null);
  
  const today = startOfToday();

  useEffect(() => {
    fetchSlotsForMonth(currentMonth);
  }, [currentMonth, officeId]);

  const fetchSlotsForMonth = async (monthDate: Date) => {
    setLoading(true);
    try {
      const monthStr = format(monthDate, "yyyy-MM");
      let url = `${API_BASE_URL}/inspection-slots?month=${monthStr}`;
      if (officeId) {
        url += `&office_id=${officeId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.data);
        setScheduleConfig(data.schedule);
      }
    } catch (error) {
      console.error("Failed to fetch inspection slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Determine the max date users can book
  const maxBookingDate = scheduleConfig 
    ? addDays(today, scheduleConfig.advance_booking_days) 
    : addDays(today, 30);

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (day: Date, dateStr: string) => {
    if (!availableSlots[dateStr] || availableSlots[dateStr].length === 0) return;
    setActiveDate(day);
    // Reset time when changing date
    if (selectedDate !== dateStr) {
      onSelectSlot(dateStr, "");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl border shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#9A2A2A]" />
          Select Date & Time
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
            disabled={isBefore(currentMonth, startOfMonth(today)) || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium text-sm flex items-center justify-center w-24">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
            disabled={isBefore(maxBookingDate, addMonths(currentMonth, 1)) || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative min-h-[220px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-[#9A2A2A]" />
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dateStr = format(day, dateFormat);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isPast = isBefore(day, today);
            const isTooFar = isBefore(maxBookingDate, day);
            const hasSlots = availableSlots[dateStr] && availableSlots[dateStr].length > 0;
            const isSelected = activeDate && isSameDay(day, activeDate);
            
            const isDisabled = !isCurrentMonth || isPast || isTooFar || !hasSlots;

            return (
              <div
                key={idx}
                onClick={() => !isDisabled && handleDateClick(day, dateStr)}
                className={`
                  h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all
                  ${!isCurrentMonth ? "text-slate-300 opacity-50" : ""}
                  ${isDisabled ? "cursor-not-allowed text-slate-300" : "cursor-pointer hover:bg-[#9A2A2A]/10"}
                  ${isSelected ? "bg-[#9A2A2A] text-white font-bold shadow-md hover:bg-[#7a2222]" : ""}
                  ${!isDisabled && !isSelected ? "text-slate-700 bg-slate-50 font-medium" : ""}
                  ${hasSlots && !isSelected ? "border border-[#9A2A2A]/20" : ""}
                `}
              >
                {format(day, "d")}
                {hasSlots && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-[#9A2A2A] rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {activeDate && (
        <div className="mt-6 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#9A2A2A]" />
            Available Times for {format(activeDate, "MMM d")}
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {availableSlots[format(activeDate, dateFormat)]?.map((time) => {
              const isSelectedTime = selectedTime === time;
              return (
                <Button
                  key={time}
                  type="button"
                  variant={isSelectedTime ? "default" : "outline"}
                  className={`w-full text-xs h-9 transition-all rounded-xl ${
                    isSelectedTime 
                      ? "bg-[#9A2A2A] text-white hover:bg-[#7a2222] shadow-md shadow-[#9A2A2A]/20" 
                      : "hover:border-[#9A2A2A] hover:text-[#9A2A2A] border-slate-200"
                  }`}
                  onClick={() => onSelectSlot(format(activeDate, dateFormat), time)}
                >
                  {time}
                </Button>
              );
            })}
            
            {(!availableSlots[format(activeDate, dateFormat)] || availableSlots[format(activeDate, dateFormat)].length === 0) && (
              <div className="col-span-3 text-center text-sm text-gray-500 py-4">
                No times available on this date.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
