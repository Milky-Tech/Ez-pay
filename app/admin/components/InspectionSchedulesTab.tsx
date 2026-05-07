"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, RefreshCw, Save } from "lucide-react";
import { Office } from "./OfficesTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface InspectionSchedulesTabProps {
  offices: Office[];
  token: string | null;
}

const DEFAULT_TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const DAYS = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 7, label: "Sunday" },
];

export default function InspectionSchedulesTab({ offices, token }: InspectionSchedulesTabProps) {
  const { toast } = useToast();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string>("default");

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [availableTimes, setAvailableTimes] = useState<string[]>(DEFAULT_TIMES);
  const [maxBookings, setMaxBookings] = useState(3);
  const [advanceDays, setAdvanceDays] = useState(30);

  const fetchSchedule = async (officeId: string) => {
    setLoading(true);
    try {
      const endpoint = officeId === "default" 
        ? `${API_BASE_URL}/inspection-schedule`
        : `${API_BASE_URL}/inspection-schedule/${officeId}`;
        
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        const schedule = data.data;
        if (schedule) {
          setDaysOfWeek(schedule.days_of_week || [1, 2, 3, 4, 5]);
          setAvailableTimes(schedule.available_times || DEFAULT_TIMES);
          setMaxBookings(schedule.max_bookings_per_slot || 3);
          setAdvanceDays(schedule.advance_booking_days || 30);
        }
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load schedule." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedOffice);
  }, [selectedOffice]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const endpoint = selectedOffice === "default" 
        ? `${API_BASE_URL}/inspection-schedule`
        : `${API_BASE_URL}/inspection-schedule/${selectedOffice}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          days_of_week: daysOfWeek,
          available_times: availableTimes,
          max_bookings_per_slot: maxBookings,
          advance_booking_days: advanceDays,
          is_active: true
        }),
      });

      if (!res.ok) throw new Error("Failed to save schedule");
      
      toast({ title: "Saved", description: "Inspection schedule updated successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setDaysOfWeek(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const toggleTime = (time: string) => {
    setAvailableTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time].sort()
    );
  };

  // Generate a bunch of time slots to pick from (every hour from 06:00 to 20:00)
  const allPossibleTimes = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <Card className="border-none shadow-none bg-transparent max-w-4xl">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-raleway font-bold">Inspection Schedules</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Configure available days, times, and slot capacities for inspections.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={selectedOffice} onValueChange={setSelectedOffice}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select Office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">System Default</SelectItem>
                {offices.map(office => (
                  <SelectItem key={office.id} value={office.id.toString()}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => fetchSchedule(selectedOffice)}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-500 text-sm">Loading schedule configuration...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-8">
            {/* Days Selection */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900">
                <Calendar className="h-5 w-5 text-primary" />
                Available Days
              </h3>
              <div className="flex flex-wrap gap-4">
                {DAYS.map(day => (
                  <div key={day.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border">
                    <Checkbox 
                      id={`day-${day.id}`} 
                      checked={daysOfWeek.includes(day.id)}
                      onCheckedChange={() => toggleDay(day.id)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Times Selection */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900">
                <Clock className="h-5 w-5 text-primary" />
                Time Slots
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                {allPossibleTimes.map(time => {
                  const isSelected = availableTimes.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-10 ${isSelected ? "bg-primary" : "text-gray-600"}`}
                      onClick={() => toggleTime(time)}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">Select the times that will be available on the active days.</p>
            </div>

            {/* Capacity & Limits */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="max-bookings">Max Bookings Per Slot</Label>
                <Input 
                  id="max-bookings" 
                  type="number" 
                  min="1" 
                  max="50"
                  value={maxBookings}
                  onChange={(e) => setMaxBookings(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-gray-500">How many simultaneous physical inspections can happen in one time slot.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance-days">Advance Booking Window (Days)</Label>
                <Input 
                  id="advance-days" 
                  type="number" 
                  min="7" 
                  max="90"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-gray-500">How far into the future users can see and book slots (max 90 days).</p>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={submitting || daysOfWeek.length === 0 || availableTimes.length === 0}
                className="w-full md:w-auto"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Configuration</>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
