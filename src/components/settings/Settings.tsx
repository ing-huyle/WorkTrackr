import { useEffect, useMemo, useState } from 'react';
import './Settings.scss';
import { STORAGE_KEYS } from '../../config';
import { hmToSeconds, persistNumber, signedHmToSeconds, splitSecondsToHm, splitSignedSecondsToHm } from '../../utils/utils';
import type { SettingsDialogProps } from '../../types';

const SettingsDialog = ({
  isOpen, toggleSettings, defaultOvertimeToday, setDefaultOvertimeToday,
  overtimeToday, setOvertimeToday, overtimeTotal, setOvertimeTotal,
  increment, setIncrement
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

  const updateTmpAFromHm = (nextH: number, nextM: number) => {
    const prevA = tmpA;
    const nextA = hmToSeconds(nextH, nextM);

    // Changing daily target changes total overtime too
    const delta = prevA - nextA;
    setTmpA(nextA);
    setTmpB(prev => prev + delta);
  };

  const updateTmpBFromSignedHm = (sign: 1 | -1, h: number, m: number) => {
    setTmpB(signedHmToSeconds(sign, h, m));
  };

  const save = () => {
    const oldTarget = -defaultOvertimeToday;
    const targetDelta = oldTarget - tmpA;
    const newOvertimeToday = overtimeToday + targetDelta;
    
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
    <div className='settings-wrapper'>
      <div className='settings-backdrop' />

      <div className='settings-dialog' role='dialog'>
        <div className='inputs-wrapper'>
          
          {/* Daily target */}
          <div className='hm-row'>
            <label className='hm-label'>Daily target</label>

            <div className='hm-inputs'>
              <input
                type='number'
                min={0}
                max={23}
                value={aHM.h}
                onChange={(e) => updateTmpAFromHm(Number(e.target.value), aHM.m)}
              />
              :
              <input
                type='number'
                min={0}
                max={59}
                value={aHM.m}
                onChange={(e) => updateTmpAFromHm(aHM.h, Number(e.target.value))}
              />
            </div>
          </div>

          {/* Total overtime */}
          <div className='hm-row'>
            <label className='hm-label'>Rewrite total overtime</label>

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
          <label>
            Increment (min)
            <input
              type='number'
              value={tmpIncrement}
              min={1}
              max={60}
              onChange={(e) => setTmpIncrement(Number(e.target.value))}
            />
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
