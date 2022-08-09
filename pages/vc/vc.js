
import io from 'Socket.IO-client'
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import React, { useEffect, useRef, useState,useCallback } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"



let socket

const vc = () => {
  
  const [ me, setMe ] = useState("")
  const [ stream, setStream ] = useState()
  const [ receivingCall, setReceivingCall ] = useState(false)
  const [ caller, setCaller ] = useState("")
  const [ callerSignal, setCallerSignal ] = useState()
  const [ callAccepted, setCallAccepted ] = useState(false)
  const [ idToCall, setIdToCall ] = useState("")
  const [ callEnded, setCallEnded] = useState(false)
  const [ name, setName ] = useState("")
  const myVideo = useRef(null)
  const userVideo = useRef(null)
  const connectionRef= useRef()
  const videoRef = useRef(null);


useEffect(() => {
    socketInitializer();
 }, []);


const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io()

  

    const getUserMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          myVideo.current.srcObject = stream;
          setStream(stream);
        } catch (err) {
          console.log(err);
        }
      };
      getUserMedia();
   

    socket.on("me", (id) => {
        setMe(id)
    })

    socket.on("callUser", (data) => {
        setReceivingCall(true)
        setCaller(data.from)
        setName(data.name)
        setCallerSignal(data.signal)
    })


  }





const callUser = (id) => {
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
    })
    peer.on("signal", (data) => {
        socket.emit("callUser", {
            userToCall: id,
            signalData: data,
            from: me,
            name: name
        })
    })
    peer.on("stream", (stream) => {
        
            userVideo.current.srcObject = stream
        
    })
    socket.on("callAccepted", (signal) => {
        setCallAccepted(true)
        peer.signal(signal)
    })

    connectionRef.current = peer
}

const answerCall =() =>  {
    setCallAccepted(true)
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
    })
    peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: caller })
    })
    peer.on("stream", (stream) => {
        userVideo.current.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
}

const leaveCall = () => {
    setCallEnded(true)
    connectionRef.current.destroy()
}



  return (<>
  <div>
      {/* <video 
        ref={myVideo}
        autoPlay
      /> */}
    </div>
    <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
    <div className="container">
        <div className="video-container">
            <div className="video">
                 <video   ref={myVideo} autoPlay  />
            </div>
            <div className="video">
                {callAccepted && !callEnded ?
                <video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
                null}
            </div>
        </div>
        <div className="myId">
            <TextField
                id="filled-basic"
                label="Name"
                variant="filled"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: "20px" }}
            />
            <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
                <Button variant="contained" color="primary" startIcon={<AccessAlarmsIcon fontSize="large" />}>
                    Copy ID
                </Button>
            </CopyToClipboard>

            <TextField
                id="filled-basic"
                label="ID to call"
                variant="filled"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
            />
            <div className="call-button">
                {callAccepted && !callEnded ? (
                    <Button variant="contained" color="secondary" onClick={leaveCall}>
                        End Call
                    </Button>
                ) : (
                    <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                        <AccessAlarmsIcon fontSize="large" />
                    </IconButton>
                )}
                {idToCall}
            </div>
        </div>
        <div>
            {receivingCall && !callAccepted ? (
                    <div className="caller">
                    <h1 >{name} is calling...</h1>
                    <Button variant="contained" color="primary" onClick={answerCall}>
                        Answer
                    </Button>
                </div>
            ) : null}
        </div>
    </div>
    </>
  )
}

export default vc;