import { useCallback, useEffect, useRef, useState } from 'react';
import './styles/App.scss';
import type { WhatsToday } from './types';
import { ONE_SECOND, SECRET_DEFAULT_WORK_OVERTIME_TODAY, STORAGE_KEYS } from './config';
import { getHours, getMinutes, getSeconds, getTimeColor, loadNumber, persistNumber } from './utils/utils';
import Overtime from './components/overtime/Overtime';
import Switch from './components/switch/Switch';
import SettingsDialog from './components/settings/Settings';

const App = () => {
  const [whatsToday, setWhatsToday] = useState<WhatsToday>('work');
  const [defaultOvertimeToday, setDefaultOvertimeToday] = useState<number>(SECRET_DEFAULT_WORK_OVERTIME_TODAY);
  const [overtimeToday, setOvertimeToday] = useState<number>(SECRET_DEFAULT_WORK_OVERTIME_TODAY);
  const [overtimeTotal, setOvertimeTotal] = useState<number>(SECRET_DEFAULT_WORK_OVERTIME_TODAY);
  const [timeWorked, setTimeWorked] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [increment, setIncrement] = useState<number>(15);
  const [isSettingsOn, setIsSettingsOn] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const baseTitleRef = useRef<string>('');

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

    const initialOvertimeTotal = loadNumber(STORAGE_KEYS.OVERTIME_TOTAL, overtimeTotal);
    setOvertimeTotal(initialOvertimeTotal);
    persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, initialOvertimeTotal);

    const initialTimeWorked = loadNumber(STORAGE_KEYS.TIME_WORKED, 0);
    setTimeWorked(initialTimeWorked);
    persistNumber(STORAGE_KEYS.TIME_WORKED, initialTimeWorked);

    const storedIncrement = loadNumber(STORAGE_KEYS.INCREMENT, 15);
    setIncrement(storedIncrement);
    persistNumber(STORAGE_KEYS.INCREMENT, storedIncrement);

    baseTitleRef.current = document.title;
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
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      hiddenAtRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // Listen for the tab being hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning) return;

      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (document.visibilityState === 'visible' && hiddenAtRef.current != null) {
        const diffMs = Date.now() - hiddenAtRef.current;
        const deltaSeconds = Math.floor(diffMs / 1000);

        if (deltaSeconds > 0) applyDelta(deltaSeconds);

        hiddenAtRef.current = null;

        if (!intervalRef.current) {
          intervalRef.current = setInterval(tick, ONE_SECOND);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applyDelta, isRunning, tick]);

  // Write time worked in the tab
  useEffect(() => {
    const hh = getHours(timeWorked);
    const mm = getMinutes(timeWorked);
    const ss = getSeconds(timeWorked);

    document.title = `${hh}:${mm}:${ss} | ${baseTitleRef.current}`;

    return () => {
      document.title = baseTitleRef.current;
    };
  }, [timeWorked]);


  // Click actions
  const toggleRunning = (): void => {
    setIsRunning(prev => !prev);
  };

  const changeByIncrement = (direction: 1 | -1): void => {
    applyDelta(direction * increment * 60);
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


  // Settings
  const toggleSettings = (): void => {
    setIsSettingsOn(prev => !prev);
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.settings-dialog, .settings-btn')) {
        setIsSettingsOn(false);
      }
    };

    if (isSettingsOn) {
      document.addEventListener('click', handleClick);
    }

    return () => document.removeEventListener('click', handleClick);
  }, [isSettingsOn]);


  const canSubtractIncrement = timeWorked > increment * 60 && !isRunning;
  const canAddIncrement = timeWorked > 0 && !isRunning;

  return (
    <>
      {/* SETTINGS */}
      {
        !isRunning &&
        <div
          className='settings-btn'
          onClick={toggleSettings}
        >
          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <rect width='18' height='18' />
            <path d='M8.71409 11.2576C9.89398 11.2576 10.8505 10.3012 10.8505 9.12125C10.8505 7.94136 9.89398 6.98486 8.71409 6.98486C7.53419 6.98486 6.5777 7.94136 6.5777 9.12125C6.5777 10.3012 7.53419 11.2576 8.71409 11.2576Z' stroke='white' strokeWidth='1.5'/>
            <path d='M9.97101 2.10824C9.70965 2 9.3778 2 8.7141 2C8.05039 2 7.71854 2 7.45719 2.10824C7.28427 2.17982 7.12715 2.28478 6.99482 2.41711C6.86248 2.54945 6.75753 2.70656 6.68595 2.87948C6.62043 3.03829 6.59408 3.22415 6.58411 3.49405C6.57948 3.68912 6.52544 3.87983 6.42705 4.04834C6.32866 4.21685 6.18914 4.35764 6.02153 4.45756C5.85119 4.55282 5.65947 4.60332 5.46431 4.60431C5.26915 4.60531 5.07692 4.55678 4.90562 4.46326C4.66635 4.3365 4.4933 4.26671 4.32168 4.24392C3.94732 4.19469 3.56874 4.29613 3.26915 4.52593C3.04554 4.69897 2.8789 4.98596 2.54705 5.56065C2.2152 6.13534 2.04856 6.42233 2.01224 6.70362C1.98777 6.8891 2.00007 7.07758 2.04846 7.2583C2.09685 7.43901 2.18037 7.60843 2.29424 7.75686C2.39964 7.89359 2.54705 8.00824 2.77564 8.15209C3.11248 8.3636 3.32897 8.72393 3.32897 9.1213C3.32897 9.51867 3.11248 9.87901 2.77564 10.0898C2.54705 10.2344 2.39892 10.349 2.29424 10.4857C2.18037 10.6342 2.09685 10.8036 2.04846 10.9843C2.00007 11.165 1.98777 11.3535 2.01224 11.539C2.04927 11.8196 2.2152 12.1073 2.54634 12.682C2.8789 13.2566 3.04483 13.5436 3.26915 13.7167C3.41758 13.8306 3.587 13.9141 3.76771 13.9625C3.94843 14.0108 4.13691 14.0232 4.32239 13.9987C4.4933 13.9759 4.66635 13.9061 4.90562 13.7793C5.07692 13.6858 5.26915 13.6373 5.46431 13.6383C5.65947 13.6393 5.85119 13.6898 6.02153 13.785C6.36549 13.9844 6.56987 14.3512 6.58411 14.7486C6.59408 15.0192 6.61972 15.2043 6.68595 15.3631C6.75753 15.536 6.86248 15.6932 6.99482 15.8255C7.12715 15.9578 7.28427 16.0628 7.45719 16.1344C7.71854 16.2426 8.05039 16.2426 8.7141 16.2426C9.3778 16.2426 9.70965 16.2426 9.97101 16.1344C10.1439 16.0628 10.301 15.9578 10.4334 15.8255C10.5657 15.6932 10.6707 15.536 10.7422 15.3631C10.8078 15.2043 10.8341 15.0192 10.8441 14.7486C10.8583 14.3512 11.0627 13.9837 11.4067 13.785C11.577 13.6898 11.7687 13.6393 11.9639 13.6383C12.159 13.6373 12.3513 13.6858 12.5226 13.7793C12.7618 13.9061 12.9349 13.9759 13.1058 13.9987C13.2913 14.0232 13.4798 14.0108 13.6605 13.9625C13.8412 13.9141 14.0106 13.8306 14.159 13.7167C14.3834 13.5443 14.5493 13.2566 14.8811 12.682C15.213 12.1073 15.3796 11.8203 15.416 11.539C15.4404 11.3535 15.4281 11.165 15.3797 10.9843C15.3313 10.8036 15.2478 10.6342 15.134 10.4857C15.0286 10.349 14.8811 10.2344 14.6526 10.0905C14.4859 9.98896 14.3477 9.84678 14.2509 9.67727C14.1541 9.50776 14.1019 9.31647 14.0992 9.1213C14.0992 8.72393 14.3157 8.3636 14.6526 8.15281C14.8811 8.00824 15.0293 7.89359 15.134 7.75686C15.2478 7.60843 15.3313 7.43901 15.3797 7.2583C15.4281 7.07758 15.4404 6.8891 15.416 6.70362C15.3789 6.42304 15.213 6.13534 14.8819 5.56065C14.5493 4.98596 14.3834 4.69897 14.159 4.52593C14.0106 4.41205 13.8412 4.32853 13.6605 4.28015C13.4798 4.23176 13.2913 4.21945 13.1058 4.24392C12.9349 4.26671 12.7618 4.3365 12.5219 4.46326C12.3506 4.55665 12.1585 4.60511 11.9635 4.60412C11.7685 4.60312 11.5769 4.5527 11.4067 4.45756C11.2391 4.35764 11.0995 4.21685 11.0011 4.04834C10.9028 3.87983 10.8487 3.68912 10.8441 3.49405C10.8341 3.22344 10.8085 3.03829 10.7422 2.87948C10.6707 2.70656 10.5657 2.54945 10.4334 2.41711C10.301 2.28478 10.1439 2.17982 9.97101 2.10824Z' stroke='white' strokeWidth='1.5'/>
          </svg>
        </div>
      }
      {
        isSettingsOn && 
          <SettingsDialog
            isOpen={isSettingsOn}
            toggleSettings={toggleSettings}
            whatsToday={whatsToday}
            defaultOvertimeToday={defaultOvertimeToday}
            setDefaultOvertimeToday={setDefaultOvertimeToday}
            overtimeToday={overtimeToday}
            setOvertimeToday={setOvertimeToday}
            overtimeTotal={overtimeTotal}
            setOvertimeTotal={setOvertimeTotal}
            increment={increment}
            setIncrement={setIncrement}
          />
      }


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
          {canSubtractIncrement ? (
            <button
              className='secondary small'
              onClick={() => changeByIncrement(-1)}
            >
              - {increment} min
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

          {canAddIncrement && (
            <button
              className='secondary small'
              onClick={() => changeByIncrement(1)}
            >
              + {increment} min
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
