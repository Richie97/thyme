"use client";

import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const UNDER_HOURS_MESSAGES = [
  "Oh, only {hours} hours? I'm sure your boss will understand...",
  "Wow, {hours} hours? That's... ambitious.",
  "8 hours is just a suggestion, right? 😏",
  "I'm sure your coworkers are thrilled to pick up your slack...",
  "Breaking news: The standard workday is 8 hours! 📰",
];

const getDayDisplay = (day: string) => {
  return {
    full: day,
    short: day.slice(0, 3),
  };
};

const getRandomMessage = (hours: number) => {
  const randomIndex = Math.floor(Math.random() * UNDER_HOURS_MESSAGES.length);
  return UNDER_HOURS_MESSAGES[randomIndex].replace("{hours}", hours.toString());
};

export default function Home() {
  const [hours, setHours] = useState<{ [key: string]: string }>({});
  const [notifications, setNotifications] = useState<{
    [key: string]: { show: boolean; type: "under" | "over"; message?: string };
  }>({});
  const [showThankYou, setShowThankYou] = useState(false);

  const handleHoursChange = (day: string, value: string) => {
    const numValue = parseFloat(value);
    setHours((prev) => ({
      ...prev,
      [day]: value,
    }));

    // Show notification if value is not 8 and not empty
    if (value !== "" && numValue !== 8) {
      setNotifications((prev) => ({
        ...prev,
        [day]: {
          show: true,
          type: numValue > 8 ? "over" : "under",
          message: numValue < 8 ? getRandomMessage(numValue) : undefined,
        },
      }));
    } else {
      setNotifications((prev) => ({
        ...prev,
        [day]: {
          show: false,
          type: "under",
        },
      }));
    }
  };

  const calculateTotal = () => {
    return Object.values(hours).reduce((sum, value) => {
      const num = parseFloat(value) || 0;
      return sum + num;
    }, 0);
  };

  const handleSubmit = () => {
    setHours({});
    setNotifications({});
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <Analytics />
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Weekly Time Entry
        </h1>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {DAYS.map((day) => {
            const dayDisplay = getDayDisplay(day);
            return (
              <div
                key={day}
                className="bg-white rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3 text-center">
                  <span className="md:hidden">{dayDisplay.short}</span>
                  <span className="hidden md:inline">{dayDisplay.full}</span>
                </h2>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={hours[day] || ""}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                  <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
                    hrs
                  </span>
                </div>
                {notifications[day]?.show && (
                  <div
                    className={`mt-1 text-xs text-center animate-fade-in ${
                      notifications[day].type === "over"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {notifications[day].type === "over"
                      ? "Thank you for your dedication! 🌟"
                      : notifications[day].message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Total Hours
            </h2>
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              {calculateTotal().toFixed(1)} hrs
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Submit Timesheet
          </button>
        </div>

        {showThankYou && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            Thanks for coming in today! See you next time! 👋
          </div>
        )}
      </div>
    </main>
  );
}
