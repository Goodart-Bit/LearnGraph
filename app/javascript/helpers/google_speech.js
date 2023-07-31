export class EditorWebSpeechHelper {
    static message = new SpeechSynthesisUtterance();
    static voices = window.speechSynthesis.getVoices();
    static recognization = new webkitSpeechRecognition();

    static {
        this.message.voice = this.voices[7];
        this.message.lang = 'es-MX';
        const speechButton = document.getElementById('speechToTextButton');
        const storedBtnTitle = speechButton.innerHTML;
        window.addEventListener("pagehide",()=>{
            window.speechSynthesis.cancel();
        })
        this.recognization.onstart = () => {
            speechButton.innerHTML = 'Listening...'
        }
        this.recognization.onspeechend = () => {
            speechButton.innerHTML = storedBtnTitle;
        }
    }

    static getTextFromSpeech(){
        let textPromise = new Promise((resolve, reject) => {
            this.recognization.onresult = (e) => {
                let textFromSpeech = e.results[0][0].transcript;
                return resolve(textFromSpeech);
            }
        }).then(text => { return text; })
        this.recognization.start();
        return textPromise;
    }

    static speak(text){
        this.message.text = text;
        speechSynthesis.cancel();
        window.speechSynthesis.speak(this.message);
        this.handleSpeaking();
    }

    // Fixes speak API Bug that pauses speaker after 15 seconds
    static handleSpeaking(){
        return setInterval(() => {
            if (!speechSynthesis.speaking) {
                clearInterval(this.handleSpeaking());
            } else {
                speechSynthesis.pause();
                speechSynthesis.resume();
            }
        }, 14000);
    }
}
