import {Controller} from "@hotwired/stimulus"
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import {TipTapLinkHelper} from "../helpers/tiptap_link_helper";
import {EditorWebSpeechHelper} from '../helpers/google_speech'

export default class extends Controller {
    possible_attrs = ["bold", "italic", "underline", "strike", 'link', "bulletList", "orderedList"]
    static targets = ["input"]
    editorEle = null;
    CustomLink = Link.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                id: {
                    default: null
                }
            }
        },
    })

    connect() {
        let context = this;
        this.editor = new Editor({
            element: this.element,
            extensions: [
                StarterKit,
                this.CustomLink,
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
                parent.insertBefore(context.editorEle, bottom_bar);
                context.tipTapLinkHelper = new TipTapLinkHelper(this, context.editorEle, context.data.get('notesUrl'));
            },
            editorProps: {
                handleDOMEvents: {
                    keydown: (view, e) => {
                        let keyId = e.which
                        if (!this.mutableKeyEventOnLink(keyId)) return;
                        let touchedNode = this.getNodeInCursor();
                        let nodeId = touchedNode.marks[0].attrs.id;
                        let nodeText = touchedNode.text;
                        let textCursorIdx = this.getNoteTextCursorIdx(nodeText);
                        this.tipTapLinkHelper.updateModifiedLink(keyId, nodeId, nodeText, textCursorIdx);
                    },
                    appendLink: (view, e) => {
                        let linkData = e.detail.note;
                        this.tipTapLinkHelper.addZkLink(linkData.title, linkData.url, linkData.id)
                    }
                }
            }
        });
    }

    async insertLinkInEditor(){
        await this.tipTapLinkHelper.dispatchZkLinkEventToEditor();
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
        return this.keyCodeEdits(eventKeyId) && this.focusedOnLink();
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

    linkNote() {
        let toolWindow = document.getElementById("linker-window");
        toolWindow.style.display = 'block';
    }
    async listenNote() {
        let editorText = this.editor.state.doc.textContent;
        EditorWebSpeechHelper.speak(editorText);
    }

    async fillNoteWithSpeech(){
        let textFromSpeech = await EditorWebSpeechHelper.getTextFromSpeech();
        this.editor.commands.insertContent(textFromSpeech + ' ');
    }

    // LINK HANDLERS
    focusedOnLink(){
        let node = this.getNodeInCursor();
        if(!node) return false;
        return node.marks.find((mark) => { return mark.type.name === 'link'; })
    }

    // GLOBAL METHODS

    populateInput() {
        this.inputTarget.value = this.editor.getHTML();
    }

    getNodeInCursor() {
        let resolvedPos = this.editor.state.selection.$head.parentOffset
        let posInNode = resolvedPos > 1 ? resolvedPos - 1 : 0
        return this.editor.state.selection.$head.parent.nodeAt(posInNode)
    }
}