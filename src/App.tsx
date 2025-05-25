import Overtime from './components/overtime/Overtime';
import Switch from './components/switch/Switch';
import './styles/App.scss';

function App() {
  return (
    <>
      <div className='overtimes-wrapper'>
        <Overtime label='Overtime today' overtime='–07:30' />
        <Overtime label='Total overtime' overtime='–04:54' color='negative' />
      </div>
      <main>
        <span className='time-worked'>00:00:00</span>
        <button className='primary'>
          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z'/>
          </svg>
          Start
        </button>
      </main>
      <div className='daily-target-wrapper'>
        <label>What's today?</label>
        <Switch />
      </div>
    </>
  )
}

export default App;
