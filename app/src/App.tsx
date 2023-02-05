import { useState, useRef, useEffect } from 'react';
import './App.css';

type VideoResolution = '360p' | '540p';
const mappingConstraints = {
  '360p': {
    width: 640,
    height: 360,
  },
  '540p': {
    width: 960,
    height: 540,
  },
} satisfies Record<VideoResolution, { width: number; height: number }>;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null
  );
  const [selectVideoResolution, setSelectVideoResolution] =
    useState<VideoResolution>('360p');

  // カメラデバイスの取得
  useEffect(() => {
    const initDevice = async () => {
      const device = await navigator.mediaDevices.enumerateDevices();
      const cameraDevice = device.filter((v) => v.kind === 'videoinput');
      console.log(device);
      setDeviceList(() => cameraDevice);
      setSelectedDevice(() => cameraDevice[0]);
    };

    initDevice();
  }, []);

  // streamの取得
  useEffect(() => {
    const initStream = async () => {
      if (selectedDevice) {
        const { width, height } = mappingConstraints['360p'];
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: selectedDevice.deviceId,
            width,
            height,
            facingMode: 'user',
          },
        });

        setStream(() => stream);
      }
    };

    initStream();
  }, [selectedDevice?.deviceId]);

  useEffect(() => {
    if (videoRef.current != null) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef.current, stream?.id]);

  // applyCOnstraints
  useEffect(() => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    track.applyConstraints(mappingConstraints[selectVideoResolution]).then(res => {
      console.warn(track.getSettings())
    });
  }, [selectVideoResolution]);

  return (
    <div
      className='App'
      style={{
        display: 'grid',
        justifyContent: 'center',
        justifyItems: 'center',
        gap: '10px',
      }}
    >
      <div>
        <label>使用中のカメラ: </label>
        <select
          onChange={(e) => {
            const device = deviceList!.find((v) => v.label === e.target.value);
            if (device) {
              setSelectedDevice(() => device);
            } else {
              setSelectedDevice(null);
            }
          }}
        >
          {deviceList.map((device) => {
            return <option key={device.label}>{device.label}</option>;
          })}
        </select>
      </div>
      <div>
        <label>解像度: </label>
        <select
          onChange={(e) => {
            if (e.target.value === selectVideoResolution) return;
            setSelectVideoResolution(() => e.target.value as VideoResolution);
          }}
        >
          {(
            Object.keys(
              mappingConstraints
            ) as (keyof typeof mappingConstraints)[]
          ).map((resolution) => {
            return <option key={resolution}>{resolution}</option>;
          })}
        </select>
      </div>
      <video autoPlay playsInline ref={videoRef} id='video' />
    </div>
  );
}

export default App;
