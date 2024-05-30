let mediaRecorder;
let audioChunks = [];
let audioBlob;

document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopButton').addEventListener('click', stopRecording);
document.getElementById('sendButton').addEventListener('click', sendAudioToESP32);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            document.getElementById('recordButton').disabled = true;
            document.getElementById('stopButton').disabled = false;

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = document.getElementById('audioPlayback');
                audio.src = audioUrl;

                audioChunks = [];
                document.getElementById('sendButton').disabled = false;
            };
        })
        .catch(error => console.error('Error al acceder al micrófono', error));
}

function stopRecording() {
    mediaRecorder.stop();

    document.getElementById('recordButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}

function sendAudioToESP32() {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    fetch('http://192.168.100.55/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log('Éxito:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
