import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCountdown } from 'react-countdown-circle-timer'
import "./SpeakerCountdown.css";

const renderTime = ({ remainingTime }) => {
  if (remainingTime === 0) {
    return <div className="timer">Too lale...</div>;
  }

  return (
    <div className="timer">
      <div className="text">Remaining</div>
      <div className="value">{remainingTime}</div>
      <div className="text">seconds</div>
    </div>
  );
};

function SpeakerCountdown() {
  const [key, setKey] = useState(0);
  return (
      <><div className="timer-wrapper">
      <CountdownCircleTimer
        key={key}
        isPlaying
        duration={20}
        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[10, 6, 3, 0]}
        onComplete={() => [true, 1000]}
      >
        {renderTime}
      </CountdownCircleTimer>
    </div><div className="button-wrapper">
        <button onClick={() => setKey(prevKey => prevKey + 1)}>
          Restart Timer
        </button></div></>
  );
}

export default SpeakerCountdown;

