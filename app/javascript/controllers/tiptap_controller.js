import {Controller} from "@hotwired/stimulus"
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

export default class extends Controller {
    possible_attrs = ["bold", "italic", "underline", "strike", 'link', "bulletList", "orderedList"]
    static targets = ["input"]
    editorEle = null;

    connect() {
        let context = this;
        this.editor = new Editor({
            element: this.element,
            extensions: [
                StarterKit,
                Link,
                Underline
            ],
            content: this.inputTarget.value,
            onTransaction() {
                context.highlightSelectedButtons();
            },
            onUpdate({editor}) {
                context.populateInput();
            },
            onCreate({editor}) {
                let parent = document.getElementById("editor-holder")
                let bottom_bar = document.getElementById("bottom-bar")
                context.editorEle = document.getElementsByClassName("ProseMirror")[0];
                parent.insertBefore(context.editorEle, bottom_bar)
            },
            editorProps: {
                handleDOMEvents: {
                    keydown: (view, e) => {
                        let keyId = e.which
                        this.updateModifiedLink(keyId)
                    },
                    appendLink: (view, e) => {
                        let linkData = e.detail.note;
                        this.addZkLink(linkData.title, linkData.url)
                    }
                }
            }
        });
    }

    updateModifiedLink(pressedKeyId){
        if (!this.mutableKeyEventOnLink(pressedKeyId)) return;
        if(pressedKeyId === 8) return this.deleteFocusLinkMark(true);
        let touchedNodeText = this.getNodeInCursor().text;
        let textCursorIdx = this.getNoteTextCursorIdx(touchedNodeText);
        let corruptingUpdate = textCursorIdx > 0 && textCursorIdx < touchedNodeText.length
        this.deleteFocusLinkMark(corruptingUpdate);
    }

    getNoteTextCursorIdx(textNodeStr) {
        let parentText = this.editor.state.selection.$head.parent.textContent
        let nodeCursorPos = this.editor.state.selection.$anchor.parentOffset
        let noteTextStartPos = this.findNestedStartPos(parentText, textNodeStr, nodeCursorPos)
        return nodeCursorPos - noteTextStartPos
    }

    findNestedStartPos(parentText, nodeText, parentCursorPos) {
        if(!parentText.includes(nodeText)) return -1;
        for(let idx = 0; parentText.length >= nodeText.length; idx++){
            if(parentText.slice(0, nodeText.length) === nodeText){
                let endIdx = idx + nodeText.length
                if(parentCursorPos >= idx && parentCursorPos <= endIdx) return idx; // The idx has to point to the correct cursor pos
            }
            parentText = parentText.slice(1, parentText.length);
        }
    }

    mutableKeyEventOnLink(eventKeyId){
        return this.keyCodeEdits(eventKeyId) && this.focusedOnLink(eventKeyId);
    }

    keyCodeEdits(keyId){
        let editKeyRanges = [[8,13],[32,32],[48, 90],[96, 111],[186, 222]]
        return editKeyRanges.some((range) => {
            return keyId >= range[0] && keyId <= range[1];
        });
    }

    getActiveAttributes() {
        return this.possible_attrs.filter(attr => this.editor.isActive(attr))
    }

    highlightSelectedButtons() {
        let attrs_to_mark = this.getActiveAttributes();
        let buttons = Array.from(document.getElementsByClassName("edit-style"))
            .map(btn_container => Array.from(btn_container.children)).flat();
        buttons.forEach(button => {
            let button_attr = button.id
            if (attrs_to_mark.some(attr => attr == button_attr)) {
                button.classList.add("selected")
            } else {
                button.classList.remove("selected")
            }
        })
    }

    logJSON() {
        console.log(this.editor.getJSON());
        alert("The editor output (JSON) was dumped to the browser's console")
    }

    //STYLE TOGGLERS

    bold() {
        this.editor.chain().focus().toggleBold().run()
    }

    italicize() {
        this.editor.chain().focus().toggleItalic().run()
    }

    strike() {
        this.editor.chain().focus().toggleStrike().run()
    }

    underline() {
        this.editor.chain().focus().toggleUnderline().run()
    }

    toggle_url() {
        this.editor.commands.toggleLink({href: 'https://youtube.com'})
    }

    addOl() {
        this.editor.chain().focus().toggleOrderedList().run();
    }

    addUl() {
        this.editor.chain().focus().toggleBulletList().run();
    }

    // LINK HANDLERS
    focusedOnLink(){
        let node = this.getNodeInCursor();
        if(!node) return false;
        return node.marks.find((mark) => { return mark.type.name === 'link'; })
    }

    addZkLink(name, url) {
        this.editor.commands.insertContent(`<a href=${url} class='zk_link'>${name}</a>`);
    }

    deleteFocusLinkMark(unsetNodeLink) {
        unsetNodeLink ? this.editor.commands.unsetLink() : this.editor.commands.unsetMark('link');
    }

    // GLOBAL METHODS

    populateInput() {
        this.inputTarget.value = this.editor.getHTML();
    }

    getNodeInCursor() {
        let resolvedPos = this.editor.state.selection.$head.parentOffset
        let posInNode = resolvedPos > 0 ? resolvedPos - 1 : 0
        return this.editor.state.selection.$head.parent.nodeAt(posInNode)
    }
}