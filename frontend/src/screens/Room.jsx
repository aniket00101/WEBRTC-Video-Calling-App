import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import peer from '../service/peer'
import { Video, VideoOff, Phone, PhoneOff, Send } from 'lucide-react'

const Room = () => {
    const socket = useSocket();
    const [remotesocketid, setremotesocketid] = useState(null);
    const [mystream, setMyStream] = useState(null)
    const [remotestream, setRemoteStream] = useState();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const handleuserjoin = useCallback(({ email, id }) => {
        console.log(`email joined ${email}`)
        setremotesocketid(id)
    }, [])

    const handlecalluser = useCallback( async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const offer = await peer.getoffer();
        socket.emit("user:call", {to: remotesocketid, offer})
        setMyStream(stream)
        setIsVideoEnabled(true)
    }, [remotesocketid, socket])

    const handleIncommingcall = useCallback(async ({from, offer}) => {
        setremotesocketid(from)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream)
        setIsVideoEnabled(true)
        console.log(from, offer);
        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted', {to:from, ans})
    },[socket])

    const sendStreams = useCallback(() => {
        for(const track of mystream.getTracks()){
            peer.peer.addTrack(track, mystream)
        }
    },[mystream])

    const toggleVideo = useCallback(() => {
        if (mystream) {
            const videoTrack = mystream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, [mystream]);

    const handlecallAccepted = useCallback(({from, ans}) => {
        peer.setLocalDescription(ans);
        console.log('call acceped');
        sendStreams()
    }, [sendStreams])

    const handleNegoneeded = useCallback(async () => {
            const offer = await peer.getoffer();
            socket.emit('peer:nego:needed', {offer, to: remotesocketid})
            
        },[remotesocketid, socket])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoneeded)
        return () => {
                peer.peer.removeEventListener("negotiationneeded", handleNegoneeded);
            }
    })
    
    const handlenegoneedIncoming = useCallback(async ({from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to: from, ans})
    }, [socket])

    const handlenegoneedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans)
    },[])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream[0])
        })
    })

    useEffect(() => {
        socket.on('user:joined', handleuserjoin);
        socket.on('incomming:call', handleIncommingcall)
        socket.on('call:accepted', handlecallAccepted)
        socket.on('peer:nego:needed', handlenegoneedIncoming)
        socket.on('peer:nego:final', handlenegoneedFinal)
        return () => {
            socket.off('user:joined', handleuserjoin)
            socket.off('incomming:call', handleIncommingcall)
            socket.off('call:accepted', handlecallAccepted)
            socket.off('peer:nego:needed', handlenegoneedIncoming)
            socket.off('peer:nego:final', handlenegoneedFinal)
        };
    }, [socket, handleuserjoin, handleIncommingcall, handlecallAccepted, handlenegoneedIncoming, handlenegoneedFinal]);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Video Call Room
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${remotesocketid ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <p className="text-xs sm:text-sm text-gray-300">
                            {remotesocketid ? 'Connected to peer' : 'Waiting for someone to join...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                {/* Control Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 justify-center">
                    {remotesocketid && (
                        <button 
                            onClick={handlecalluser}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <Phone size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Start Call</span>
                            <span className="sm:hidden">Call</span>
                        </button>
                    )}
                    {mystream && (
                        <>
                            <button 
                                onClick={sendStreams}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <Send size={18} className="sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Send Stream</span>
                                <span className="sm:hidden">Send</span>
                            </button>
                            <button 
                                onClick={toggleVideo}
                                className={`flex items-center gap-2 ${isVideoEnabled ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'} px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105`}
                            >
                                {isVideoEnabled ? <VideoOff size={18} className="sm:w-5 sm:h-5" /> : <Video size={18} className="sm:w-5 sm:h-5" />}
                                <span className="hidden sm:inline">{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
                                <span className="sm:hidden">{isVideoEnabled ? 'Stop' : 'Start'}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* My Stream */}
                    {mystream && (
                        <div className="bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                                <Video size={16} className="sm:w-5 sm:h-5 text-blue-400" />
                                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">Your Video</h2>
                            </div>
                            <div className="relative aspect-video bg-black">
                                <video 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover"
                                    ref={(video) => {
                                        if (video) video.srcObject = mystream;
                                    }}
                                />
                                {!isVideoEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                        <div className="text-center">
                                            <VideoOff size={48} className="mx-auto text-gray-500 mb-2" />
                                            <p className="text-gray-400 text-sm">Video is off</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Remote Stream */}
                    {remotestream && (
                        <div className="bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                            <div className="bg-gradient-to-r from-purple-700 to-purple-800 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                                <Video size={16} className="sm:w-5 sm:h-5 text-purple-300" />
                                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">Remote Video</h2>
                            </div>
                            <div className="relative aspect-video bg-black">
                                <video 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                    ref={(video) => {
                                        if (video) video.srcObject = remotestream;
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {!mystream && !remotestream && (
                    <div className="text-center py-12 sm:py-16 lg:py-20">
                        <VideoOff size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-600 mb-3 sm:mb-4" />
                        <p className="text-gray-400 text-base sm:text-lg">No active video streams</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">Start a call to begin streaming</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Room