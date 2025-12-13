import { useEffect, useState } from 'react';
import type { WhatsToday } from './types';
import './styles/App.scss';
import { getHours, getMinutes, getSeconds, getTimeColor } from './utils/utils';
import Overtime from './components/overtime/Overtime';
import Switch from './components/switch/Switch';

const App = () => {
  const secretDefaultWorkOvertimeToday = -30600;
  
  const [whatsToday, setWhatsToday] = useState<WhatsToday>('work');
  const [defaultOvertimeToday, setDefaultOvertimeToday] = useState<number>(secretDefaultWorkOvertimeToday);
  const [overtimeToday, setOvertimeToday] = useState<number>(secretDefaultWorkOvertimeToday);
  const [overtimeTotal, setOvertimeTotal] = useState<number>(secretDefaultWorkOvertimeToday);
  const [timeWorked, setTimeWorked] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ticking, setTicking] = useState<any>(null);
  
  useEffect(() => {
    const potentialWhatsToday = localStorage.getItem('whatsToday') as WhatsToday;
    const newWhatsToday = potentialWhatsToday ?? 'work';
    setWhatsToday(newWhatsToday);
    localStorage.setItem('whatsToday', newWhatsToday);
    
    const newDefaultOvertimeToday = Number(localStorage.getItem('defaultOvertimeToday') ?? secretDefaultWorkOvertimeToday);
    setDefaultOvertimeToday(newDefaultOvertimeToday);
    localStorage.setItem('defaultOvertimeToday', String(newDefaultOvertimeToday));

    const newOvertimeToday = Number(localStorage.getItem('overtimeToday') ?? (newWhatsToday === 'work' ? newDefaultOvertimeToday : 0));
    setOvertimeToday(newOvertimeToday);
    localStorage.setItem('overtimeToday', String(newOvertimeToday));

    const newOvertimeTotal = Number(localStorage.getItem('overtimeTotal')) + newOvertimeToday;
    setOvertimeTotal(newOvertimeTotal);
    localStorage.setItem('overtimeTotal', String(newOvertimeTotal));

    const newTimeWorked = Number(localStorage.getItem('timeWorked'));
    setTimeWorked(newTimeWorked);
    localStorage.setItem('timeWorked', String(newTimeWorked));
  }, [])

  useEffect(() => {
    if (!isRunning) {
      if (ticking) {
        clearInterval(ticking);
        setTicking(null);
      }
      return;
    }

    const id = setInterval(tick, 1000);
    setTicking(id);

    return () => clearInterval(id);
  }, [isRunning]);

  const tick = (): void => {
    setOvertimeToday(prev => {
      const newOvertimeToday = prev + 1;
      localStorage.setItem('overtimeToday', String(newOvertimeToday));
      return newOvertimeToday;
    });

    setOvertimeTotal(prev => {
      const newOvertimeTotal = prev + 1;
      localStorage.setItem('overtimeTotal', String(newOvertimeTotal));
      
      return newOvertimeTotal;
    });
    
    setTimeWorked(prev => {
      const newTimeWorked = prev + 1;
      localStorage.setItem('timeWorked', String(newTimeWorked));
      return newTimeWorked;
    });
  }

  const cta = (): void => {
    setIsRunning(prev => !prev);
  }

  const deductFifteen = (): void => {
    setOvertimeToday(prev => {
      const newOvertimeToday = prev - 900;
      localStorage.setItem('overtimeToday', String(newOvertimeToday));
      return newOvertimeToday;
    });

    setOvertimeTotal(prev => {
      const newOvertimeTotal = prev - 900;
      localStorage.setItem('overtimeTotal', String(newOvertimeTotal));
      
      return newOvertimeTotal;
    });
    
    setTimeWorked(prev => {
      const newTimeWorked = prev - 900;
      localStorage.setItem('timeWorked', String(newTimeWorked));
      return newTimeWorked;
    });
  }

  const addFifteen = (): void => {
    setOvertimeToday(prev => {
      const newOvertimeToday = prev + 900;
      localStorage.setItem('overtimeToday', String(newOvertimeToday));
      return newOvertimeToday;
    });

    setOvertimeTotal(prev => {
      const newOvertimeTotal = prev + 900;
      localStorage.setItem('overtimeTotal', String(newOvertimeTotal));
      
      return newOvertimeTotal;
    });
    
    setTimeWorked(prev => {
      const newTimeWorked = prev + 900;
      localStorage.setItem('timeWorked', String(newTimeWorked));
      return newTimeWorked;
    });
  }

  const clickWhatsToday = (type: WhatsToday): void => {
    setWhatsToday(type);
    localStorage.setItem('whatsToday', type);

    const newOvertimeToday = type === 'rest' ? 0 : defaultOvertimeToday;
    setOvertimeToday(newOvertimeToday);
    localStorage.setItem('overtimeToday', String(newOvertimeToday));

    setOvertimeTotal(prev => {
      const newOvertimeTotal = prev + (type === 'rest' ? -defaultOvertimeToday : defaultOvertimeToday);
      localStorage.setItem('overtimeToday', String(newOvertimeTotal));
      return newOvertimeTotal;
    });
  }

  const startNewDay = () => {
    const newOvertimeToday = whatsToday === 'rest' ? 0 : defaultOvertimeToday;
    setOvertimeToday(newOvertimeToday);
    localStorage.setItem('overtimeToday', String(newOvertimeToday));

    setOvertimeTotal(prev => {
      const newOvertimeTotal = prev + newOvertimeToday;
      localStorage.setItem('overtimeTotal', String(newOvertimeTotal));
      return newOvertimeTotal;
    });
    
    setTimeWorked(0);
    localStorage.setItem('timeWorked', '0');
  }

  return (
    <>
      <div className='overtimes-wrapper'>
        <Overtime label='Overtime today' overtime={overtimeToday} />
        <Overtime label='Total overtime' overtime={overtimeTotal} color={getTimeColor(overtimeTotal)} />
      </div>
      <main>
        <span className='time-worked'>{getHours(timeWorked)}:{getMinutes(timeWorked)}:{getSeconds(timeWorked)}</span>
        <div className='mid-buttons-wrapper'>
          {
            timeWorked > 900 && !isRunning
              ? <button
                  className='secondary small'
                  onClick={() => deductFifteen()}
                >
                  - 15 min
                </button>
              : <button className='small filler'></button>
          }
          <button
            className='primary'
            onClick={() => cta()}
          >
            {
              !isRunning
                ? <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
                    <path d='M8 5v14l11-7z'/>
                  </svg>
                : <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M6 19H10V5H6V19ZM14 5V19H18V5H14Z' fill='black'/>
                  </svg>
            }
            {!timeWorked && !isRunning ? 'Start' : isRunning ? 'Pause' : 'Continue'}
          </button>
          {
            timeWorked > 0 && !isRunning &&
            <button
              className='secondary small'
              onClick={() => addFifteen()}
            >
              + 15 min
            </button>
          }
        </div>
      </main>
      <footer>
        {
          isRunning && <div></div>
        }
        {
          !timeWorked && !isRunning &&
          <div className='daily-target-wrapper'>
            <label>What's today?</label>
            <Switch whatsToday={whatsToday} clickWhatsToday={clickWhatsToday} />
          </div>
        }
        {
          timeWorked > 0 && !isRunning &&
          <button
            className='secondary'
            onClick={() => startNewDay()}
          >
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
              <path d='M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z'/>
            </svg>
            Start new day
          </button>
        }
      </footer>
    </>
  )
}

export default App;
