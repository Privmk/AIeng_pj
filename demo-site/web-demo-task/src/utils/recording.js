import { 
    AUDIO_CHECK,
    AUDIO_CONTAINER, 
    RECORDING_INDICATOR, 
    START_RECORD, 
    STOP_RECORD 
} from "../dom";

export class Recording {
    static mediaRecorder;
    static audioChunks = [];
    static stream;
    async startRecording() {
        try {
            Recording.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            Recording.mediaRecorder = new MediaRecorder(Recording.stream);

            Recording.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    Recording.audioChunks.push(event.data);
                }
            };

            Recording.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(Recording.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                // Hiển thị audio player
                AUDIO_CONTAINER.style.display = 'flex';
                AUDIO_CHECK.src = audioUrl;
                
                // Reset biến
                Recording.audioChunks = [];
                RECORDING_INDICATOR.style.display = 'none';
            };

            AUDIO_CONTAINER.style.display = 'none';
            Recording.mediaRecorder.start();
            START_RECORD.disabled = true;
            STOP_RECORD.disabled = false;
            RECORDING_INDICATOR.style.display = 'flex';
        } catch (err) {
            alert('Lỗi khi truy cập microphone: ' + err.message);
        }
    }

    stopRecording() {
        Recording.mediaRecorder.stop();
        Recording.stream.getTracks().forEach(track => track.stop());
        START_RECORD.disabled = false;
        STOP_RECORD.disabled = true;
    }

   
}
