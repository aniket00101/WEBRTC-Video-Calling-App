import React, {createContext} from 'react'
import { useContext } from 'react'
import { useMemo } from 'react'
import { io } from "socket.io-client"

const SocketContext = createContext(null)

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
    const socket = useMemo(() => io('https://webrtc-video-calling-app-7dze.onrender.com'),[]);
  return (
    <SocketContext.Provider value={socket}>
        {props.children}
    </SocketContext.Provider>
  )
}

