export class EditorWebSpeechHelper {
    static message = new SpeechSynthesisUtterance();
    static voices = window.speechSynthesis.getVoices();
    static recognization = new webkitSpeechRecognition();
    static cancelBtn = document.getElementById('cancel-button');
    static recognizationBtn = document.getElementById('recognizationButton');
    static synthesisBtn = document.getElementById('speechToTextButton');

    static {
        this.message.voice = this.voices[7];
        this.message.lang = 'es-MX';
        const speechButton = document.getElementById('speechToTextButton');
        window.addEventListener("pagehide",()=>{
            window.speechSynthesis.cancel();
        })
        this.cancelBtn.addEventListener('click',() => {
            if(speechSynthesis.speaking){
                speechSynthesis.cancel();
            } else {
                this.recognization.abort();
            }
            this.arrangeButtonUI(false);
        })
        this.recognization.onstart = () => {
            this.arrangeButtonUI(true);
        }
        this.recognization.onend = () => {
            this.arrangeButtonUI(false);
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

    static arrangeButtonUI(isRunning) {
        if(!isRunning){
            this.recognizationBtn.style.display = 'block';
            this.synthesisBtn.style.display = 'block';
            this.cancelBtn.style.display = 'none';
        } else {
            this.recognizationBtn.style.display = 'none';
            this.synthesisBtn.style.display = 'none';
            this.cancelBtn.style.display = 'block';
        }
    }

    // Fixes speak API Bug that pauses speaker after 15 seconds
    static handleSpeaking(){
        this.arrangeButtonUI(true);
        return setInterval(() => {
            if (!speechSynthesis.speaking) {
                clearInterval(this.handleSpeaking());
                this.arrangeButtonUI(false);
            } else {
                speechSynthesis.pause();
                speechSynthesis.resume();
            }
        }, 14000);
    }


}
