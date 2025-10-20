import { socket } from "./socket";

let localStream: MediaStream;
let peers: { [id: string]: RTCPeerConnection } = {};

export const startVoice = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  socket.on("offer", async (data: any) => {
    const pc = createPeerConnection(data.from);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { to: data.from, answer });
  });

  socket.on("answer", async (data: any) => {
    const pc = peers[data.from];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on("ice-candidate", (data: any) => {
    const pc = peers[data.from];
    if (pc) pc.addIceCandidate(data.candidate);
  });
};

const createPeerConnection = (id: string) => {
  const pc = new RTCPeerConnection();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    const audioEl = document.createElement("audio");
    audioEl.srcObject = event.streams[0];
    audioEl.autoplay = true;
    document.body.appendChild(audioEl);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) socket.emit("ice-candidate", { to: id, candidate: event.candidate });
  };

  peers[id] = pc;
  return pc;
};

export const callNewUser = async (id: string) => {
  const pc = createPeerConnection(id);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("offer", { to: id, offer });
};
