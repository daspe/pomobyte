import { useEffect, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import useInterval from './hooks/useInterval';
import { AppContext } from './contexts/AppContext';
import { TimerContext } from './contexts/TimerContext';
import { PHASE_TRANSITION_DELAY } from './config/constants';

import Nav from './features/navigation/Nav';
import Timer from './features/timer/Timer';
import TimerControls from './features/timer/TimerControls';
import Modal from './features/modal/Modal';

dayjs.extend(duration);

function App() {
  const { config, modal } = useContext(AppContext);
  const { timer, status, timerDispatch, statusDispatch } = useContext(TimerContext);

  const updateTimer = () => {
    if (timer.asSeconds() <= 0) {
      statusDispatch({type: 'SET_STATUS', status: 'finished'});
      // handlePhaseTransition();
      // setTimerFromPhase();
    } else {
      timerDispatch({type: 'UPDATE_TIMER'});
    }
  }

  const handlePhaseTransition = () => {
    if (status.phase === 1) {
      if (status.interval + 1 > config.breakInterval) {
        statusDispatch({type: 'SET_PHASE', phase: 3});
      } else {
        statusDispatch({type: 'SET_PHASE', phase: 2});
      }
    } else if (status.phase === 2) {
      statusDispatch({type: 'SET_PHASE', phase: 1});
      statusDispatch({type: 'SET_INTERVAL', interval: status.interval + 1});
    } else if (status.phase === 3) {
      statusDispatch({type: 'SET_PHASE', phase: 1});
      statusDispatch({type: 'SET_INTERVAL', interval: 1});
    }
  }

  const setTimerFromPhase = () => {
    let newTime;
    switch (status.phase) {
      case 1: newTime = config.pomoTime; break;
      case 2: newTime = config.shortBreak; break;
      case 3: newTime = config.longBreak; break;
      default: newTime = config.pomoTime;
    }

    timerDispatch({type: 'SET_TIMER', timer: dayjs.duration(newTime, 'minutes')});
  }

  useInterval(() => {
    if (status.status === 'active') updateTimer();
  }, 1000);

  useEffect(() => {
    if (status.status === 'initial') {
      setTimerFromPhase();

      clearTimeout(status.phaseTimeoutID);
      statusDispatch({type: 'CLEAR_PHASE_TIMEOUT_ID'});
    } else if (status.status === 'finished') {
      handlePhaseTransition();
      
      // Remember timeout id in state and cancel if status changes to initial
      const timeoutID = setTimeout(() => {
        statusDispatch({type: 'SET_STATUS', status: 'initial'});
      }, PHASE_TRANSITION_DELAY);

      statusDispatch({type: 'SET_PHASE_TIMEOUT_ID', id: timeoutID});
    }
  }, [status.status, config]);

  return (
    <>
      <div className="container flex col">
        <Nav />
        <div>Status: {status.status} | Phase: {status.phase} | Interval: {status.interval}/{config.breakInterval}</div>
        <Timer />
        <TimerControls setTimerFromPhase={setTimerFromPhase} />
      </div>

      <AnimatePresence initial={false} exitBeforeEnter={true}>
        {modal.isOpen && <Modal />}
      </AnimatePresence>
    </>
  );
}

export default App;
