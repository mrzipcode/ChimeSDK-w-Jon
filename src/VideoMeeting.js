import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  useLocalVideo,
  VideoTileGrid,
  VideoGrid,
  VideoTile,
  useMeetingStatus,
  MeetingStatus,
  useAudioVideo,
} from 'amazon-chime-sdk-component-library-react';
import '@aws-amplify/ui-react/styles.css';
import '@cloudscape-design/global-styles/index.css';
import MyCustomVideoTileGrid from './MyCutstomVideoTileGrid';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const useCountdown = (audioVideo) => {
  const [message, setMessage] = useState();
  const [incomingMessage, setIncomingMessage] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputDuration, setInputDuration] = useState(30);
  const [duration, setDuration] = useState(30);
  const [restartKey, setRestartKey] = useState(0);

  const onClickStartCountdown = (shouldSendMessage) => {
    setIsPlaying(true);
    setMessage({
      action: 'startTimer'
    })
  }

  const onStartCountdownMessageReceived = () => {
    setIsPlaying(true);
    console.log("[custom-log] onStartCountdownMessageReceived", {
      duration,
      isPlaying,
      restartKey
    })
  }

  const onClickResetCountdown = (shouldSendMessage) => {
    setIsPlaying(false);
    setRestartKey(restartKey + 1);
    setMessage({
      action: 'resetTimer'
    })
  }

  const onResetCountdownMessageReceived = (shouldSendMessage) => {
    setIsPlaying(false);
    setRestartKey(restartKey + 1);
    console.log("[custom-log] onResetCountdownMessageReceived", {
      duration,
      isPlaying,
      restartKey
    })
  }

  const onChangeDuration = (event) => {
    const value = event.target.value;
    setInputDuration(value);
  }

  const onClickSetCountdownDuration = () => {
    setDuration(inputDuration);
    setMessage({
      action: 'setCountdownDuration',
      duration: inputDuration,
    })
  }

  const onSetCountdownDurationMessageReceived = (newDuration) => {
    setDuration(newDuration);
    console.log("[custom-log] onResetCountdownMessageReceived", {
      duration,
      newDuration,
      isPlaying,
      restartKey
    })
  }

  useEffect(() => {
    if (!audioVideo) {
      console.error('No audioVideo');
      return;
    }

    audioVideo.realtimeSubscribeToReceiveDataMessage(
      'timerEvent',
      (data) => {
        const receivedData = (data && data.json()) || {};
        const { message } = receivedData;
        processMessageCallback(message);
      },
    );

    return () => {
      console.log('unsubscribing from receive data message');
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage('Message');
    };
  }, [audioVideo]);
}

const useSendMessage = (audioVideo) => {
  const [message, setMessage] = useState();
  useEffect(() => {
    if (!audioVideo) {
      console.error('No audioVideo');
      return;
    }
    if (message) {
      audioVideo.realtimeSendDataMessage(
        'timerEvent',
        { message: message },
        120000,
      );
    }
  }, [message]);

  return {
    sendMessage: setMessage
  }
}

const VideoMeeting = ({ setLine, setTranscribeStatus, setTranslateStatus }) => {
  const meetingStatus = useMeetingStatus();
  const { toggleVideo } = useLocalVideo();
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputDuration, setInputDuration] = useState(30);
  const [duration, setDuration] = useState(30);
  const [restartKey, setRestartKey] = useState(0);
  const audioVideo = useAudioVideo();
  const [incomingMessage, setIncomingMessage] = useState();

  useEffect(() => {
    async function tog() {
      if (meetingStatus === MeetingStatus.Succeeded) {
        await toggleVideo();
      }
      if (meetingStatus === MeetingStatus.Ended) {
        setLine([]);
        setTranscribeStatus(false);
        setTranslateStatus(false);
      }
    }
    tog();
  }, [meetingStatus]);

  const { sendMessage } = useSendMessage(audioVideo);

  useSubscribeToDataChannel(audioVideo, (incomingMessage) => {
    if (incomingMessage) {
      switch (incomingMessage.action) {
        case 'startTimer':
          handleStartCountdown(false);
          break;
        case 'resetTimer':
          handleResetCountdown(false);
          break;
        case 'setCountdownDuration':
          handleSetCountdownDurationMessage(incomingMessage.duration);
          break;
        default:
          break;
      }
    }
  });

  const handleStartCountdown = (shouldSendMessage) => {
    setIsPlaying(true);
    shouldSendMessage && sendMessage({
      action: 'startTimer'
    })
  }

  const handleResetCountdown = (shouldSendMessage) => {
    setIsPlaying(false);
    setRestartKey(restartKey + 1);
    shouldSendMessage && sendMessage({
      action: 'resetTimer'
    })
  }

  const handleSetCountdownDurationMessage = (duration) => {
    setDuration(duration);
  }

  const handleChangeDuration = (event) => {
    const value = event.target.value;
    setInputDuration(value);
  }

  const handleSetCountdownDuration = () => {
    setDuration(inputDuration);
    sendMessage({
      action: 'setCountdownDuration',
      duration: inputDuration,
    })
  }

  return (
    < div style={{ padding: '1rem', height: '70vh', boxSizing: 'border-box' }}>
      {
        meetingStatus == MeetingStatus.Succeeded ? <>
          <CountdownCircleTimer
            isPlaying={isPlaying}
            key={restartKey}
            duration={duration}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[7, 5, 2, 0]}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
          <label htmlFor="seconds">Seconds</label>
          <input type="number" id="seconds" value={inputDuration} onChange={handleChangeDuration} />
          <button onClick={handleSetCountdownDuration}> Set timer duration </button>
          <button onClick={() => handleStartCountdown(true)}> Start timer </button>
          <button onClick={handleResetCountdown}> Reset timer </button>

          <MyCustomVideoTileGrid noRemoteVideoView={undefined} />
        </> : <></>
      }
    </div >
  );
};

export default VideoMeeting;
