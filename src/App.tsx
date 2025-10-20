import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    socket.on("receive-message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("video-link", (link: string) => {
      setVideoUrl(link);
      if (videoRef.current) {
        videoRef.current.src = link;
        videoRef.current.play();
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("video-link");
    };
  }, []);

  const sendMessage = () => {
    if (!text) return;
    socket.emit("send-message", text);
    setText("");
  };

  const setVideo = () => {
    if (!videoUrl) return;
    socket.emit("set-video-link", videoUrl);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎬 Movie Chat Room</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Video linki (YouTube, Netflix, Google)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{ width: "70%", marginRight: 10 }}
        />
        <button onClick={setVideo}>Set Video</button>
      </div>

      <video
        ref={videoRef}
        width="600"
        controls
        style={{ border: "1px solid #ccc", marginBottom: 10 }}
      />

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "70%", marginRight: 10 }}
        />
        <button onClick={sendMessage}>Göndər</button>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 10, height: 200, overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
