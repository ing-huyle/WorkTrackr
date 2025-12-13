import type { OvertimeType } from '../../types';
import { getHours, getMinutes, getSign } from '../../utils/utils';
import './Overtime.scss';

const Overtime = ({ label, overtime, color }: OvertimeType) => {
  return (
    <div className='overtime-wrapper'>
      <label>{label}</label>
      <span className={`overtime ${color ?? ''}`}>
        {getSign(overtime)}{getHours(overtime)}:{getMinutes(overtime)}
      </span>
    </div>
  )
}

export default Overtime;
