"use client";

import { useState, useEffect } from "react";
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
  "Oh, only {hours} hours? I'm sure your boss will be thrilled with your dedication...",
  "Wow, {hours} hours? That's... impressive. For a part-time job, maybe?",
  "8 hours is just a suggestion, right? Like how brushing your teeth is 'suggested' twice daily...",
  "I'm sure your coworkers love carrying your workload while you're 'working' {hours} hours...",
  "Breaking news: The standard workday is 8 hours! But who needs standards, right? 📰",
  "Only {hours} hours? Your commitment to mediocrity is truly inspiring...",
  "At this rate, you'll be promoted to customer in no time!",
  "I'm sure your manager will understand... after they finish laughing.",
  "Working {hours} hours? That's cute. Real cute.",
  "Your dedication to doing the bare minimum is truly remarkable.",
  "Oh, {hours} hours? I didn't realize we were running a charity here...",
  "Your work ethic is as impressive as your hours are short.",
  "I'm sure your coworkers are thrilled to pick up your slack... again.",
  "Only {hours} hours? Your commitment to excellence is truly... something.",
  "At least you're consistent - consistently disappointing!",
];

const EXACT_HOURS_MESSAGES = [
  "Congratulations on being perfectly average! 🎯",
  "8 hours? How... conventional of you. 😐",
  "Meeting expectations, how boring! 😴",
  "Just doing the bare minimum, I see... 👀",
  "Living life on the edge of mediocrity! 🎭",
  "Your commitment to mediocrity is impressive! 🏆",
  "Wow, exactly 8 hours? How... predictable. 🎪",
  "Playing it safe, are we? 🎲",
  "Your dedication to being average is truly something! 🎨",
  "Just another day of meeting expectations... 🎭",
];

const OVER_HOURS_MESSAGES = [
  "Thank you for your dedication! 🌟",
  "You're a true work warrior! 💪",
  "Your commitment is inspiring! ⭐",
  "Going above and beyond! 🚀",
  "You're crushing it! 💫",
  "Setting the bar high! 🎯",
  "Your work ethic is unmatched! 🔥",
  "Making it happen! 💪",
  "You're a productivity powerhouse! ⚡",
  "Leading by example! 🌟",
  "Your dedication is remarkable! 🎉",
  "Setting new standards! 📈",
  "You're unstoppable! 🚀",
  "Making excellence look easy! 💫",
  "Your commitment shines! ⭐",
];

const MANAGER_MESSAGES = [
  "Hey! Don't forget to submit your timesheet! 📝",
  "Timesheet submission reminder: Your manager is waiting... ⏰",
  "Quick reminder: Timesheets are due! 🎯",
  "Your manager would love to see your timesheet! 😊",
  "Timesheet submission: It's that time again! ⏳",
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

const getRandomOverHoursMessage = () => {
  const randomIndex = Math.floor(Math.random() * OVER_HOURS_MESSAGES.length);
  return OVER_HOURS_MESSAGES[randomIndex];
};

const getRandomManagerMessage = () => {
  const randomIndex = Math.floor(Math.random() * MANAGER_MESSAGES.length);
  return MANAGER_MESSAGES[randomIndex];
};

const getRandomExactHoursMessage = () => {
  const randomIndex = Math.floor(Math.random() * EXACT_HOURS_MESSAGES.length);
  return EXACT_HOURS_MESSAGES[randomIndex];
};

const generateRandomHours = () => {
  return DAYS.reduce((acc, day) => {
    // Generate random number between 6 and 16 with 0.5 step
    const randomHours = Math.floor(Math.random() * 21) / 2 + 6; // This gives us numbers from 6 to 16 in 0.5 steps
    acc[day] = randomHours.toString();
    return acc;
  }, {} as { [key: string]: string });
};

const TimerDisplay = ({ elapsedTime }: { elapsedTime: number }) => {
  const formatElapsedTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    const seconds = Math.floor(((hours - wholeHours) * 60 - minutes) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return <span className="font-mono">{formatElapsedTime(elapsedTime)}</span>;
};

// Cookie management functions
const TOTAL_TIME_COOKIE = "total_time_tracked";

const getTotalTimeFromCookie = (): number => {
  if (typeof window === "undefined") return 0;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(TOTAL_TIME_COOKIE));
  return cookie ? parseFloat(cookie.split("=")[1]) : 0;
};

const setTotalTimeCookie = (hours: number) => {
  if (typeof window === "undefined") return;
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1); // Cookie expires in 1 year
  document.cookie = `${TOTAL_TIME_COOKIE}=${hours}; expires=${date.toUTCString()}; path=/`;
};

export default function Home() {
  const [hours, setHours] = useState<{ [key: string]: string }>({});
  const [notifications, setNotifications] = useState<{
    [key: string]: { show: boolean; type: "under" | "over"; message?: string };
  }>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [selectedTip, setSelectedTip] = useState<string>("");
  const [customTip, setCustomTip] = useState<string>("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [totalTimeTracked, setTotalTimeTracked] = useState<number>(0);

  // Load total time from cookie on mount
  useEffect(() => {
    setTotalTimeTracked(getTotalTimeFromCookie());
  }, []);

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Set initial permission state
    setNotificationPermission(Notification.permission);

    // Request permission if not already granted
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          // Send initial notification to test
          new Notification("Manager Reminder", {
            body: getRandomManagerMessage(),
            icon: "/favicon.ico",
          });
        }
      });
    }

    // Set up periodic notifications
    let notificationInterval: NodeJS.Timeout;

    if (Notification.permission === "granted") {
      // Send initial notification
      new Notification("Manager Reminder", {
        body: getRandomManagerMessage(),
        icon: "/favicon.ico",
      });

      // Set up interval for future notifications
      notificationInterval = setInterval(() => {
        new Notification("Manager Reminder", {
          body: getRandomManagerMessage(),
          icon: "/favicon.ico",
        });
      }, 20 * 60 * 1000); // 20 minutes
    }

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, []); // Empty dependency array since we only want this to run once

  // Add timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - timerStartTime) / (1000 * 60 * 60); // Convert to hours
        setElapsedTime(elapsed);
      }, 1000); // Update every second is sufficient for a timer
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerStartTime]);

  const handleHoursChange = (day: string, value: string) => {
    const numValue = parseFloat(value);
    setHours((prev) => ({
      ...prev,
      [day]: value,
    }));

    // Show notification if value is not empty
    if (value !== "") {
      setNotifications((prev) => ({
        ...prev,
        [day]: {
          show: true,
          type: numValue > 8 ? "over" : "under",
          message:
            numValue === 8
              ? getRandomExactHoursMessage()
              : numValue < 8
              ? getRandomMessage(numValue)
              : getRandomOverHoursMessage(),
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
    setShowTipDialog(true);
  };

  const handleTipSubmit = () => {
    // Update total time tracked with this week's total
    const weekTotal = calculateTotal();
    const newTotalTime = totalTimeTracked + weekTotal;
    setTotalTimeTracked(newTotalTime);
    setTotalTimeCookie(newTotalTime);

    setShowTipDialog(false);
    setHours({});
    setNotifications({});
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
    // Reset tip state
    setSelectedTip("");
    setCustomTip("");
  };

  const handleTipCancel = () => {
    // Update total time tracked with this week's total
    const weekTotal = calculateTotal();
    const newTotalTime = totalTimeTracked + weekTotal;
    setTotalTimeTracked(newTotalTime);
    setTotalTimeCookie(newTotalTime);

    setShowTipDialog(false);
    setHours({});
    setNotifications({});
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
    // Reset tip state
    setSelectedTip("");
    setCustomTip("");
  };

  const handleCopyLastWeek = () => {
    const randomHours = generateRandomHours();
    setHours(randomHours);

    // Generate notifications for each day
    const newNotifications = DAYS.reduce((acc, day) => {
      const hours = parseFloat(randomHours[day]);
      if (hours !== 8) {
        acc[day] = {
          show: true,
          type: hours > 8 ? "over" : "under",
          message:
            hours < 8 ? getRandomMessage(hours) : getRandomOverHoursMessage(),
        };
      } else {
        acc[day] = {
          show: true,
          type: "under",
          message: getRandomExactHoursMessage(),
        };
      }
      return acc;
    }, {} as { [key: string]: { show: boolean; type: "under" | "over"; message?: string } });

    setNotifications(newNotifications);
  };

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      // Stop timer and add time to current day
      const now = new Date();
      const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Convert Sunday (0) to 6
      const currentHours = parseFloat(hours[currentDay] || "0");
      const newHours = currentHours + elapsedTime;

      setHours((prev) => ({
        ...prev,
        [currentDay]: newHours.toFixed(1),
      }));

      // Trigger notification for the new hours
      handleHoursChange(currentDay, newHours.toFixed(1));

      // Reset timer state
      setIsTimerRunning(false);
      setTimerStartTime(null);
      setElapsedTime(0);
    } else {
      // Start timer
      setIsTimerRunning(true);
      setTimerStartTime(Date.now());
      setElapsedTime(0);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <Analytics />
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Weekly Thyme Entry
        </h1>

        {notificationPermission !== "granted" && (
          <div className="mb-4 text-center">
            <button
              onClick={() => {
                Notification.requestPermission().then((permission) => {
                  setNotificationPermission(permission);
                  if (permission === "granted") {
                    new Notification("Manager Reminder", {
                      body: getRandomManagerMessage(),
                      icon: "/favicon.ico",
                    });
                  }
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              {notificationPermission === "denied"
                ? "Re-enable Notifications"
                : "Enable Reminder Notifications"}
            </button>
          </div>
        )}

        {/* Add Thymer Button */}
        <div className="mb-6 text-center">
          <button
            onClick={handleTimerToggle}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
              isTimerRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isTimerRunning ? (
              <div className="flex items-center gap-2">
                <span>Stop Thymer</span>
                <TimerDisplay elapsedTime={elapsedTime} />
              </div>
            ) : (
              "Start Thymer"
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 sm:gap-4">
          {DAYS.map((day) => {
            const dayDisplay = getDayDisplay(day);
            return (
              <div
                key={day}
                className="bg-white rounded-xl shadow-sm p-2 sm:p-3 md:p-4 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1 sm:mb-2 md:mb-3 text-center">
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
                    className="w-full px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                  <span className="absolute right-1.5 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] sm:text-xs md:text-sm">
                    hrs
                  </span>
                </div>
                {notifications[day]?.show && (
                  <div
                    className={`mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-center animate-fade-in ${
                      notifications[day].type === "over"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {notifications[day].message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Total Hours
            </h2>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              {calculateTotal().toFixed(1)} hrs
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <button
            onClick={handleCopyLastWeek}
            className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Copy Last Week&apos;s Timesheet
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Submit Timesheet
          </button>
        </div>

        {/* Total Time Tracked Display - Moved to bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                {totalTimeTracked > 1000000000
                  ? "THERE IS ONLY MANAGEMENT, HAIL MANAGEMENT"
                  : totalTimeTracked > 1000000
                  ? "Management Thanks You For Your Sacrifice"
                  : "Total Thyme Ever Tracked"}
              </h2>
              <div
                className={`flex items-center gap-2 ${
                  totalTimeTracked > 1000000000 ? "animate-shake" : ""
                }`}
              >
                <span
                  className={`font-semibold ${
                    totalTimeTracked > 1000000
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  <TimerDisplay elapsedTime={totalTimeTracked} />
                </span>
                <span
                  className={`${
                    totalTimeTracked > 1000000
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {showTipDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Thanks for using Thyme! 💚
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                If you enjoyed using Thyme, consider leaving a tip to support
                management!
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {["$1", "$2", "$5"].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setSelectedTip(tip)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedTip === tip
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {tip}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    setSelectedTip("");
                  }}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleTipCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleTipSubmit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showThankYou && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            Thanks for coming in today! See you next Thyme! 👋
          </div>
        )}
      </div>
    </main>
  );
}
