import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null
  );

  useEffect(() => {
    const initDevice = async () => {
      const device = await navigator.mediaDevices.enumerateDevices();
      const cameraDevice = device.filter((v) => v.kind === 'videoinput');
      setDeviceList(() => cameraDevice);
      setSelectedDevice(() => cameraDevice[0]);
    };

    initDevice();
  }, []);

  useEffect(() => {
    const initStream = async () => {
      if (selectedDevice) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: selectedDevice.deviceId,
            width: 300,
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
      console.log(stream)
    }
  }, [videoRef.current, stream?.id]);

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
      <video autoPlay playsInline ref={videoRef} />
    </div>
  );
}

export default App;
