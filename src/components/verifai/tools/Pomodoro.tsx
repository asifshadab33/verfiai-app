import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const newMode = mode === "work" ? "break" : "work";
      setMode(newMode);
      setTimeLeft(newMode === "work" ? 25 * 60 : 5 * 60);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };
  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <div
        className={`text-6xl font-mono font-bold ${mode === "work" ? "text-blue-600" : "text-green-600"}`}
      >
        {mins}:{secs}
      </div>
      <div className="text-lg font-medium text-gray-700 capitalize">{mode} Time</div>
      <div className="flex gap-4">
        <button
          onClick={toggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={reset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-full transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
