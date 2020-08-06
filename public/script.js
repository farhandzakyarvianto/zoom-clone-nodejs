const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

let myVideoStream;
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, myVideoStream);

        peer.on("call", (call) => {
            call.answer(myVideoStream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connecToNewUser(userId, myVideoStream);
        });

        let text = $("input");

        $("html").keydown((e) => {
            if (e.which == 13 && text.val().length !== 0) {
                socket.emit("message", text.val());
                text.val("");
            }
        });

        socket.on("createMessage", (message) => {
            $(".main__messages").append(
                `<li class="message"><b>User</b><br />${message}</li>`
            );
            scrollToBottom();
        });
    });

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
};

const scrollToBottom = () => {
    let d = $(".main__chatWindow");
    d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnMuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector('.main__muteButton').innerHTML = html;
}

setUnMuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__muteButton').innerHTML = html;
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    } else {
        setStopButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

setStopButton = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__videoButton').innerHTML = html;
}

setPlayButton = () => {
    const html = `
    <i class="fas fa-video-slash stop"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__videoButton').innerHTML = html;
}