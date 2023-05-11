import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["query","results", "search_path"]
    notePath = "http://localhost:3000/notes/"

    //connect() {}

    async sendQuery() {
        this.clear(false);
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
            let inputNoteDiv = this.generateNoteDiv(note)
            this.resultsTarget.append(inputNoteDiv)
        });
    }

    generateNoteDiv(note) {
        let noteId = `note${note.id}`
        let noteRadioElement = this.noteAsRadioInput(note, noteId)
        let noteLabelElement = this.noteAsLabel(note, noteId)
        let input_container = document.createElement("div")
        input_container.className = "note_input_container"
        input_container.append(noteLabelElement) 
        input_container.append(noteRadioElement)
        return input_container
    }

    clear(query) {
        while(this.resultsTarget.firstChild) {
            this.resultsTarget.removeChild(this.resultsTarget.lastChild)
        }
        if(query) { this.queryTarget.value = "" }
    }

    linkEvent(){
        let selectedNoteRadio = this.getSelectedRadio()
        if(!selectedNoteRadio) return

        let noteLinkHTML = this.getLinkFromLabel(selectedNoteRadio)
        const linkReq = new CustomEvent("linkReq", {
            detail: noteLinkHTML
        })
        window.dispatchEvent(linkReq)
    }


    getLinkFromLabel(selectedNoteRadio) {
        let noteName = selectedNoteRadio.getAttribute("value")
        let noteId = selectedNoteRadio.getAttribute("idNum")
        return this.generateEditorLink(noteName, noteId) 
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
        link.innerHTML = note_title
        return link
    }

    getSelectedRadio() {
        return document.querySelector('input[name="target_note"]:checked');
    }

    hideDiv(){
        let linkHelperDiv = document.getElementById("addition-container")
        linkHelperDiv.style = `display:'none'}` 
        this.clear(true)
    }

    showDiv() {
        let linkHelperDiv = document.getElementById("addition-container")
        linkHelperDiv.style = "display: block"
        this.clear(true)
    }
}