import { useEffect, useMemo, useState } from 'react';
import './Settings.scss';
import { STORAGE_KEYS } from '../../config';
import { clamp, hmToSeconds, persistNumber, signedHmToSeconds, splitSecondsToHm, splitSignedSecondsToHm } from '../../utils/utils';
import type { SettingsDialogProps } from '../../types';

const SettingsDialog = ({
  isOpen, toggleSettings, whatsToday,
  defaultOvertimeToday, setDefaultOvertimeToday,
  overtimeToday, setOvertimeToday, overtimeTotal, setOvertimeTotal,
  increment, setIncrement, showTimeTab, setShowTimeTab
}: SettingsDialogProps) => {
  const [tmpA, setTmpA] = useState(-defaultOvertimeToday);
  const [tmpB, setTmpB] = useState(overtimeTotal);
  const [tmpIncrement, setTmpIncrement] = useState(increment);

  // Sync temp state when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setTmpA(-defaultOvertimeToday);
    setTmpB(overtimeTotal);
    setTmpIncrement(increment);
  }, [isOpen, defaultOvertimeToday, overtimeTotal, increment]);

  // Derived display values
  const aHM = useMemo(() => splitSecondsToHm(tmpA), [tmpA]);
  const bHM = useMemo(() => splitSignedSecondsToHm(tmpB), [tmpB]);

  const updateTmpAFromHm = (type: 'h' | 'm', nextH: number, nextM: number) => {
    const prevA = tmpA;
    const nextA = clamp(hmToSeconds(nextH, nextM), 0, (type ? 23 * 3600 + 59 * 60 : 59 * 60));

    // Changing daily target changes total overtime too
    const delta = prevA - nextA;
    setTmpA(nextA);
    setTmpB(prev => whatsToday === 'work' ? prev + delta : prev);
  };

  const updateTmpBFromSignedHm = (sign: 1 | -1, h: number, m: number) => {
    setTmpB(signedHmToSeconds(sign, h, m));
  };

  const save = () => {
    const oldTarget = -defaultOvertimeToday;
    const targetDelta = oldTarget - tmpA;
    const newOvertimeToday = whatsToday === 'work' ? overtimeToday + targetDelta : 0;
    
    setDefaultOvertimeToday(-tmpA);
    setOvertimeToday(newOvertimeToday);
    setOvertimeTotal(tmpB);
    setIncrement(tmpIncrement);

    persistNumber(STORAGE_KEYS.DEFAULT_OVERTIME_TODAY, -tmpA);
    persistNumber(STORAGE_KEYS.OVERTIME_TODAY, newOvertimeToday);
    persistNumber(STORAGE_KEYS.OVERTIME_TOTAL, tmpB);
    persistNumber(STORAGE_KEYS.INCREMENT, tmpIncrement);

    toggleSettings();
  };

  return (
    <div className={`settings-wrapper ${isOpen ? 'open' : ''}`}>
      <div className='settings-backdrop' />

      <div className='settings-dialog' role='dialog'>
        <h2>Settings</h2>

        <div className='inputs-wrapper'>
          
          {/* Daily target */}
          <div className='hm-row'>
            <label className='hm-label label-input'>Daily target</label>

            <div className='hm-inputs'>
              <input
                type='number'
                min={0}
                max={23}
                value={aHM.h}
                onChange={(e) => updateTmpAFromHm('h', Number(e.target.value), aHM.m)}
              />
              :
              <input
                type='number'
                min={0}
                max={59}
                value={aHM.m}
                onChange={(e) => updateTmpAFromHm('m', aHM.h, Number(e.target.value))}
              />
            </div>
          </div>

          {/* Total overtime */}
          <div className='hm-row'>
            <label className='hm-label label-input'>Rewrite total overtime</label>

            <div className='hm-inputs'>
              <select
                value={bHM.sign}
                onChange={(e) =>
                  updateTmpBFromSignedHm(
                    Number(e.target.value) as 1 | -1,
                    bHM.h,
                    bHM.m
                  )
                }
              >
                <option value={1}>+</option>
                <option value={-1}>−</option>
              </select>

              <input
                type='number'
                min={0}
                max={99}
                value={bHM.h}
                onChange={(e) =>
                  updateTmpBFromSignedHm(
                    bHM.sign,
                    Number(e.target.value),
                    bHM.m
                  )
                }
              />
              :
              <input
                type='number'
                min={0}
                max={59}
                value={bHM.m}
                onChange={(e) =>
                  updateTmpBFromSignedHm(
                    bHM.sign,
                    bHM.h,
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          {/* Increment */}
          <label className='label-input'>
            Increment (min)
            <input
              type='number'
              value={tmpIncrement}
              min={1}
              max={60}
              onChange={(e) => setTmpIncrement(clamp(Number(e.target.value), 1, 60))}
            />
          </label>

          {/* Time in tab title */}
          <label className='label-toggle-switch'>
            Show time in tab title
            <input
              type='checkbox'
              checked={showTimeTab}
              onChange={(e) => setShowTimeTab(e.target.checked)}
            />
            <span className='slider'></span>
          </label>
        </div>

        <div className='btns-wrapper'>
          <button className='tertiary-light small' onClick={toggleSettings}>Cancel</button>
          <button className='primary small' onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsDialog;
