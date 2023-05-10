import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["query","results", "search_path"]
    notePath = "http://localhost:3000/notes/"

    //connect() {}

    async sendQuery() {
        this.clear();
        let query = this.queryTarget.value
        let notes = await this.getNotes(query)
        if(notes){
            notes.length > 0 ? this.populateNotes(notes) : this.showNotFound()
        } else {
            // send error
        } 
    }

    async getNotes(query) {
        let url = this.search_pathTarget.innerHTML + query
        let notesJson = await (await fetch(url)).json();
        return notesJson;
    }

    populateNotes(noteArr) {
        noteArr.forEach(note => { //TODO: Prevent self-linking 
            let noteId = `note${note.id}`
            let noteRadioElement = this.noteAsRadioInput(note, noteId)
            let noteLabelElement = this.noteAsLabel(note, noteId)
            this.resultsTarget.append(noteLabelElement) 
            this.resultsTarget.append(noteRadioElement)
        });
    }

    clear() {
        while(this.resultsTarget.firstChild) {
            this.resultsTarget.removeChild(this.resultsTarget.lastChild)
        }
    }

    addLink(){
        let editor = document.getElementsByClassName("ProseMirror")[0]
        if(!editor) return
        
        let selectedNoteRadio = this.getSelectedRadio()
        let noteName = selectedNoteRadio.getAttribute("value")
        let noteId = selectedNoteRadio.getAttribute("idNum")
        let editorLink = this.generateEditorLink(noteName, noteId) 
        editor.append(editorLink)
    }
    
    showNotFound() {
        let errorElement = document.createElement("p")
        errorElement.innerHTML = "No se encontro la nota, inténtelo nuevamente"
        this.resultsTarget.append(errorElement)
    }

    private

    noteAsLabel(note, id) {
        let noteLabel = document.createElement("label")
        noteLabel.setAttribute("for",id)
        noteLabel.innerHTML = note.title
        return noteLabel;
    }

    noteAsRadioInput(note, id){
        let noteRadio = document.createElement("input")
        noteRadio.setAttribute("type","radio")
        noteRadio.setAttribute("id",id)
        noteRadio.setAttribute("idNum",note.id)
        noteRadio.setAttribute("name","target_note")
        noteRadio.setAttribute("value",note.title)
        return noteRadio;
    }

    generateEditorLink(note_title, note_id){
        let link = document.createElement('a')
        link.setAttribute('href',this.notePath+note_id+'/edit')
        link.className = 'zk_link'
        link.innerHTML = note_title
        return link
    }

    getSelectedRadio() {
        return document.querySelector('input[name="target_note"]:checked');
    }
}