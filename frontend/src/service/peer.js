class PeerService {
    constructor(){
        if (!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                            "stun:stun1.l.google.com:19302",
                            "stun:stun2.l.google.com:19302",
                            "stun:stun3.l.google.com:19302",
                            "stun:stun4.l.google.com:19302",
                        ]
                    }
                ]
            })
        }
    }
    
    async getAnswer(offer){
        if(this.peer){
            try {
                // Make sure offer is an RTCSessionDescriptionInit
                if (offer && typeof offer === 'object') {
                    const remoteDesc = new RTCSessionDescription(offer);
                    await this.peer.setRemoteDescription(remoteDesc);
                }
                
                const ans = await this.peer.createAnswer();
                const localDesc = new RTCSessionDescription(ans);
                await this.peer.setLocalDescription(localDesc);
                return ans;
            } catch (error) {
                console.error('Error getting answer:', error);
                throw error;
            }
        }    
    }

    async getoffer(){
        if(this.peer){
            try {
                const offer = await this.peer.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });
                const localDesc = new RTCSessionDescription(offer);
                await this.peer.setLocalDescription(localDesc);
                return offer;
            } catch (error) {
                console.error('Error getting offer:', error);
                throw error;
            }
        }
    }

    async setLocalDescription(ans){
        if(this.peer){
            try {
                if (ans && typeof ans === 'object') {
                    const remoteDesc = new RTCSessionDescription(ans);
                    await this.peer.setRemoteDescription(remoteDesc);
                }
            } catch (error) {
                console.error('Error setting local description:', error);
                throw error;
            }
        }
    }
}

export default new PeerService();
