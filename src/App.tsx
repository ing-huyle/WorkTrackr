import { useCallback, useEffect, useRef, useState } from 'react';
import type { WhatsToday } from './types';
import './styles/App.scss';
import { getHours, getMinutes, getSeconds, getTimeColor, loadNumber, persistNumber } from './utils/utils';
import Overtime from './components/overtime/Overtime';
import Switch from './components/switch/Switch';

const SECRET_DEFAULT_WORK_OVERTIME_TODAY = -30600;

const STORAGE_KEYS = {
  WHATS_TODAY: 'whatsToday',
  DEFAULT_OVERTIME_TODAY: 'defaultOvertimeToday',
  OVERTIME_TODAY: 'overtimeToday',
  OVERTIME_TOTAL: 'overtimeTotal',
  TIME_WORKED: 'timeWorked',
} as const;

const ONE_SECOND = 1000;
const FIFTEEN_MINUTES = 15 * 60;

const App = () => {
  const [whatsToday, setWhatsToday] = useState<WhatsToday>('work');
  const [defaultOvertimeToday, setDefaultOvertimeToday] = useState<number>(
    SECRET_DEFAULT_WORK_OVERTIME_TODAY
  );
  const [overtimeToday, setOvertimeToday] = useState<number>(
    SECRET_DEFAULT_WORK_OVERTIME_TODAY
  );
  const [overtimeTotal, setOvertimeTotal] = useState<number>(
    SECRET_DEFAULT_WORK_OVERTIME_TODAY
  );
  const [timeWorked, setTimeWorked] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load from localStorage
  useEffect(() => {
    const storedWhatsToday =
      (localStorage.getItem(STORAGE_KEYS.WHATS_TODAY) as WhatsToday | null) ?? 'work';
    setWhatsToday(storedWhatsToday);
    localStorage.setItem(STORAGE_KEYS.WHATS_TODAY, storedWhatsToday);

    const storedDefaultOvertimeToday = loadNumber(
      STORAGE_KEYS.DEFAULT_OVERTIME_TODAY,
      SECRET_DEFAULT_WORK_OVERTIME_TODAY
    );
    setDefaultOvertimeToday(storedDefaultOvertimeToday);
    persistNumber(STORAGE_KEYS.DEFAULT_OVERTIME_TODAY, storedDefaultOvertimeToday);

    const initialOvertimeToday = loadNumber(
      STORAGE_KEYS.OVERTIME_TODAY,
      storedWhatsToday === 'work' ? storedDefaultOvertimeToday : 0
    );
    setOvertimeToday(initialOvertimeToday);
    persistNumber(STORAGE_KEYS.OVERTIME_TODAY, initialOvertimeToday);

    const initialOvertimeTotal =
      loadNumber(STORAGE_KEYS.OVERTIME_TOTAL, 0) + initialOvertimeToday;
    setOvertimeTotal(initialOvertimeTotal);
    persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, initialOvertimeTotal);

    const initialTimeWorked = loadNumber(STORAGE_KEYS.TIME_WORKED, 0);
    setTimeWorked(initialTimeWorked);
    persistNumber(STORAGE_KEYS.TIME_WORKED, initialTimeWorked);
  }, []);

  // Apply a delta (in seconds) to overtimeToday, overtimeTotal, timeWorked
  const applyDelta = useCallback((deltaSeconds: number) => {
    setOvertimeToday(prev => {
      const value = prev + deltaSeconds;
      persistNumber(STORAGE_KEYS.OVERTIME_TODAY, value);
      return value;
    });

    setOvertimeTotal(prev => {
      const value = prev + deltaSeconds;
      persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, value);
      return value;
    });

    setTimeWorked(prev => {
      const value = Math.max(0, prev + deltaSeconds);
      persistNumber(STORAGE_KEYS.TIME_WORKED, value);
      return value;
    });
  }, []);

  const tick = useCallback(() => {
    applyDelta(1);
  }, [applyDelta]);

  // Interval management
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, ONE_SECOND);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  const toggleRunning = (): void => {
    setIsRunning(prev => !prev);
  };

  const changeByFifteenMinutes = (direction: 1 | -1): void => {
    applyDelta(direction * FIFTEEN_MINUTES);
  };

  const handleWhatsTodayClick = (type: WhatsToday): void => {
    setWhatsToday(type);
    localStorage.setItem(STORAGE_KEYS.WHATS_TODAY, type);

    const newOvertimeToday = type === 'rest' ? 0 : defaultOvertimeToday;
    setOvertimeToday(newOvertimeToday);
    persistNumber(STORAGE_KEYS.OVERTIME_TODAY, newOvertimeToday);

    setOvertimeTotal(prev => {
      const adjustment = type === 'rest' ? -defaultOvertimeToday : defaultOvertimeToday;
      const value = prev + adjustment;
      persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, value);
      return value;
    });
  };

  const startNewDay = (): void => {
    const newOvertimeToday = whatsToday === 'rest' ? 0 : defaultOvertimeToday;

    setOvertimeToday(newOvertimeToday);
    persistNumber(STORAGE_KEYS.OVERTIME_TODAY, newOvertimeToday);

    setOvertimeTotal(prev => {
      const value = prev + newOvertimeToday;
      persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, value);
      return value;
    });

    setTimeWorked(0);
    persistNumber(STORAGE_KEYS.TIME_WORKED, 0);
  };

  const canSubtractFifteen = timeWorked > FIFTEEN_MINUTES && !isRunning;
  const canAddFifteen = timeWorked > 0 && !isRunning;

  return (
    <>
    {/* OVERTIMES */}
      <div className='overtimes-wrapper'>
        <Overtime label='Overtime today' overtime={overtimeToday} />
        <Overtime
          label='Total overtime'
          overtime={overtimeTotal}
          color={getTimeColor(overtimeTotal)}
        />
      </div>


      {/* TIME WORKED */}
      <main>
        <span className='time-worked'>
          {getHours(timeWorked)}:{getMinutes(timeWorked)}:{getSeconds(timeWorked)}
        </span>

        <div className='mid-buttons-wrapper'>
          {canSubtractFifteen ? (
            <button
              className='secondary small'
              onClick={() => changeByFifteenMinutes(-1)}
            >
              - 15 min
            </button>
          ) : (
            timeWorked > 0 &&
            !isRunning && <button className='small filler'></button>
          )}

          <button className='primary' onClick={toggleRunning}>
            {!isRunning ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path d='M8 5v14l11-7z' />
              </svg>
            ) : (
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M6 19H10V5H6V19ZM14 5V19H18V5H14Z' fill='black' />
              </svg>
            )}
            {!timeWorked && !isRunning
              ? 'Start'
              : isRunning
              ? 'Pause'
              : 'Continue'}
          </button>

          {canAddFifteen && (
            <button
              className='secondary small'
              onClick={() => changeByFifteenMinutes(1)}
            >
              + 15 min
            </button>
          )}
        </div>
      </main>


      {/* FOOTER */}
      <footer>
        {isRunning && <div></div>}

        {!timeWorked && !isRunning && (
          <div className='daily-target-wrapper'>
            <label>What's today?</label>
            <Switch whatsToday={whatsToday} clickWhatsToday={handleWhatsTodayClick} />
          </div>
        )}

        {timeWorked > 0 && !isRunning && (
          <button className='secondary' onClick={startNewDay}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
            >
              <path d='M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z' />
            </svg>
            Start new day
          </button>
        )}
      </footer>
    </>
  );
};

export default App;
