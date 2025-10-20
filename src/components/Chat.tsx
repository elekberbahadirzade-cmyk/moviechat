import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    socket.on("receive-message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("play-video", (link: string) => {
      setVideoLink(link);
      if (videoRef.current) {
        videoRef.current.src = link;
        videoRef.current.play();
      }
    });

    socket.on("voice", (data: ArrayBuffer) => {
      const audioBlob = new Blob([data], { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    });
  }, []);

  const sendMessage = () => {
    if (!text) return;
    socket.emit("send-message", text);
    setText("");
  };

  const changeVideo = () => {
    if (!videoLink) return;
    socket.emit("change-video", videoLink);
  };

  const startVoice = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      blob.arrayBuffer().then((buffer) => {
        socket.emit("voice", buffer);
      });
    };

    mediaRecorderRef.current.start();
  };

  const stopVoice = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        type="text"
        placeholder="Video linki..."
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        style={{ width: "60%" }}
      />
      <button onClick={changeVideo}>Play Video</button>

      <video
        ref={videoRef}
        controls
        width="600"
        style={{ display: "block", marginTop: 20 }}
      />

      <div
        style={{
          height: 200,
          overflowY: "scroll",
          border: "1px solid #ccc",
          marginTop: 20,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Mesaj yaz..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "60%", marginTop: 10 }}
      />
      <button onClick={sendMessage}>Göndər</button>

      <div style={{ marginTop: 10 }}>
        <button onMouseDown={startVoice} onMouseUp={stopVoice}>
          Səsli Danış
        </button>
      </div>
    </div>
  );
};
