import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, RotateCcw, Settings } from 'lucide-react';
import CustomButton from '../ui/CustomButton';

interface PomodoroTimerProps {
  onTimeUpdate?: (timeSpent: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onTimeUpdate }) => {
  // Default durations in seconds
  const defaultWorkDuration = 25 * 60; // 25 minutes
  const defaultShortBreakDuration = 5 * 60; // 5 minutes
  const defaultLongBreakDuration = 15 * 60; // 15 minutes

  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(defaultWorkDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [workDuration, setWorkDuration] = useState(defaultWorkDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(defaultShortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(defaultLongBreakDuration);
  
  const timerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const accumulatedWorkTimeRef = useRef<number>(0);

  // Effect to handle timer countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Record start time when timer starts
      if (mode === 'work' && sessionStartTimeRef.current === null) {
        sessionStartTimeRef.current = Date.now();
      }
    } else {
      // Clear the interval when not running
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // If we're pausing during work mode, calculate accumulated time
      if (mode === 'work' && sessionStartTimeRef.current !== null) {
        const sessionTime = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        accumulatedWorkTimeRef.current += sessionTime;
        sessionStartTimeRef.current = null;
        
        // Update parent component with accumulated time
        if (onTimeUpdate) {
          onTimeUpdate(Math.floor(accumulatedWorkTimeRef.current / 60)); // Convert to minutes
        }
      }
    }

    // Cleanup interval on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, onTimeUpdate]);

  // Handle timer completion
  const handleTimerComplete = () => {
    // Play sound notification
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed', e));
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    
    // Record completed work session and accumulated time
    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      if (sessionStartTimeRef.current !== null) {
        const sessionTime = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        accumulatedWorkTimeRef.current += sessionTime;
        sessionStartTimeRef.current = null;
        
        // Update parent component with accumulated time
        if (onTimeUpdate) {
          onTimeUpdate(Math.floor(accumulatedWorkTimeRef.current / 60)); // Convert to minutes
        }
      }
      
      // After 4 work sessions, take a long break
      if ((completedSessions + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration);
      }
    } else {
      // After a break, go back to work
      setMode('work');
      setTimeLeft(workDuration);
    }
  };

  // Toggle timer between running and paused
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration);
    // Don't reset completed sessions or accumulated time
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalDuration;
    switch (mode) {
      case 'work':
        totalDuration = workDuration;
        break;
      case 'shortBreak':
        totalDuration = shortBreakDuration;
        break;
      case 'longBreak':
        totalDuration = longBreakDuration;
        break;
    }
    
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  // Update timer settings
  const handleSettingsUpdate = () => {
    // Update current timer if settings change
    if (mode === 'work') {
      setTimeLeft(workDuration);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakDuration);
    } else {
      setTimeLeft(longBreakDuration);
    }
    
    setShowSettings(false);
  };

  // Get mode color
  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return timeLeft < 60 ? 'text-destructive animate-pulse-ring' : 'text-primary';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Pomodoro Timer</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {showSettings ? (
        <div className="animate-fade-in">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={workDuration / 60}
              onChange={(e) => setWorkDuration(parseInt(e.target.value) * 60)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Short Break (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakDuration / 60}
              onChange={(e) => setShortBreakDuration(parseInt(e.target.value) * 60)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Long Break (minutes)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={longBreakDuration / 60}
              onChange={(e) => setLongBreakDuration(parseInt(e.target.value) * 60)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex justify-end">
            <CustomButton onClick={handleSettingsUpdate}>Save Settings</CustomButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => { setMode('work'); setTimeLeft(workDuration); }}
                className={`px-3 py-1 rounded ${mode === 'work' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              >
                Work
              </button>
              <button
                onClick={() => { setMode('shortBreak'); setTimeLeft(shortBreakDuration); }}
                className={`px-3 py-1 rounded ${mode === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-secondary'}`}
              >
                Short Break
              </button>
              <button
                onClick={() => { setMode('longBreak'); setTimeLeft(longBreakDuration); }}
                className={`px-3 py-1 rounded ${mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-secondary'}`}
              >
                Long Break
              </button>
            </div>
          </div>

          <div className="relative h-48 w-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${calculateProgress() * 2.76} 276`}
                className={`${getModeColor()} transition-all duration-500`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getModeColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`p-3 rounded-full ${isRunning ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-secondary"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Completed Sessions: <span className="font-medium">{completedSessions}</span>
            </p>
            {accumulatedWorkTimeRef.current > 0 && (
              <p className="text-sm text-muted-foreground">
                Time spent: <span className="font-medium">{Math.floor(accumulatedWorkTimeRef.current / 60)} minutes</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PomodoroTimer;
