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

export default function Home() {
  const [hours, setHours] = useState<{ [key: string]: string }>({});
  const [notifications, setNotifications] = useState<{
    [key: string]: { show: boolean; type: "under" | "over"; message?: string };
  }>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

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
    setHours({});
    setNotifications({});
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <Analytics />
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Weekly Time Entry
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
                    {notifications[day].message}
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

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleCopyLastWeek}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Copy Last Week&apos;s Timesheet
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Submit Timesheet
          </button>
        </div>

        {showThankYou && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            Thanks for coming in today! See you tomorrow! 👋
          </div>
        )}
      </div>
    </main>
  );
}
