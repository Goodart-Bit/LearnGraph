// Manages Zettelkasten links aggregation and deletion within the application, by manipulating HTML elements,
// requests and events
export class TipTapLinkHelper {
    constructor(editor, editorEle, notesUrl){
        this.editor = editor;
        this.editorEle = editorEle;
        this.notesUrl = notesUrl;
    }

    // FUNCTIONS SOLELY ORIENTED TO UPDATING EDITOR
    updateModifiedLink(pressedKeyId, nodeId, nodeText, nodeTextCursorIdx){
        if(pressedKeyId === 8){
            this.deleteFocusLinkMark(true, nodeId);
            return;
        }
        let corruptingUpdate = nodeTextCursorIdx > 0 && nodeTextCursorIdx < nodeText.length
        this.deleteFocusLinkMark(corruptingUpdate, nodeId);
    }

    deleteFocusLinkMark(unsetNodeLink, nodeId) {
        if(!unsetNodeLink) return this.editor.commands.unsetMark('link');
        this.deleteLinkOnForm(nodeId);
        this.editor.commands.unsetLink();
    }

    addZkLink(name, url, id) {
        this.editor.commands.insertContent(`<a href=${url} class='zk_link' id=${id}>${name}</a>`);
    }

    // FORM MANIPULATION TRIGGERS
    deleteLinkOnForm(nodeId) {
        let edgeFormElem = document.getElementById('pointer-edges')
        let edgeFormChildren = Array.from(edgeFormElem.children)
        for(let idx = 0; idx < edgeFormChildren.length; idx++){
            let edgeSubForm = edgeFormChildren[idx]
            let targetId = edgeSubForm.children[1].value
            if (targetId != nodeId) continue;
            if (this.setDestroyInPointer(edgeSubForm, idx)) return;
        }
    }

    // If two or more links to the same note are deleted, the deleteLinkOnForm() method can't only
    // place the input on the first edgeSubForm match
    setDestroyInPointer(pointerFormElem, pointerIdx){
        let destroyInput = `<input value="true" autocomplete="off" type="hidden" ` +
            `name="note[pointers_attributes][${pointerIdx}][_destroy]" id="note_pointers_attributes_${pointerIdx}__destroy">`
        let pointerInputs = Array.from(pointerFormElem.children)
        let destroyIsSet = pointerInputs.some((input) => { return input.outerHTML === destroyInput });
        if(destroyIsSet) return false;
        pointerFormElem.insertAdjacentHTML('beforeend', destroyInput);
        return true;
    }

    async dispatchZkLinkEventToEditor(){
        const selectedNoteId = this.getFormLinkNoteId();
        if(selectedNoteId < 0) return;
        const noteUrl = `${this.notesUrl}/${selectedNoteId}`
        const targetNote = await this.fetchNote(noteUrl);
        const appendRequest  = new CustomEvent('appendLink', { detail: {note: targetNote}});
        this.editorEle.dispatchEvent(appendRequest);
    }

    getFormLinkNoteId(){
        let linkNoteInputs = Array.from(document.getElementById('link-select-form').children)
        let checkedRadio = linkNoteInputs.find((input) => input.checked)
        return checkedRadio ? checkedRadio.value : -1;
    }

    // FETCHERS & EXTRA HELPERS
    async fetchNote(noteUrl) {
        const noteResponse = await fetch(noteUrl)
        let note = await noteResponse.json();
        note.url = noteUrl
        return note;
    }
}