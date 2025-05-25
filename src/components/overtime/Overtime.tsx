import type { OvertimeType } from '../../types';
import './Overtime.scss';

function Overtime({ label, overtime, color }: OvertimeType) {
  return (
    <div className='overtime-wrapper'>
      <label>{label}</label>
      <span className={'overtime ' + color}>{overtime}</span>
    </div>
  )
}

export default Overtime;
