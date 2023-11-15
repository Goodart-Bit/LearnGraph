import {Controller} from "@hotwired/stimulus"
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import {TipTapLinkHelper} from "../helpers/tiptap_link_helper";
import {EditorWebSpeechHelper} from '../helpers/google_speech'
import * as multimedia from "../helpers/multimedia_helper";

export default class extends Controller {
    possible_attrs = ["bold", "italic", "underline", "strike", 'link', "bulletList", "orderedList"]
    static targets = ["input"]
    editorEle;
    CustomLink = Link.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                id: {
                    default: null
                },
            }
        },
    })

    CustomImage = Image.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                checksum: {
                    default: null
                },
                contenteditable: {
                    default: true
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
                Underline,
                this.CustomImage,
            ],
            content: this.inputTarget.value,
            onTransaction() {
                context.highlightSelectedButtons();
            },
            onUpdate({editor}) {
                multimedia.getDeletedNode(editor);
                context.tipTapLinkHelper.deleteLinks()
                context.populateInput();
            },
            onCreate({editor}) {
                context.selectedNode = context.getNodeInCursor();
                multimedia.resetImgSrcs(context.editor);
                let parent = document.getElementById("editor-holder")
                let bottom_bar = document.getElementById("bottom-bar")
                context.editorEle = document.getElementsByClassName("ProseMirror")[0];
                parent.insertBefore(context.editorEle, bottom_bar);
                context.setUrlListener();
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
                    },
                    insertNewImage: (view, e) => {
                        let img = e.detail.img;
                        this.editor.commands.setImage({ src: img.src, checksum: img.checksum });
                    }
                }
            }
        });
    }

    setUrlListener(){
        let urlBox = document.getElementById('url-box');
        document.getElementById('link').addEventListener('click',() => {
            urlBox.style.display = 'block';
        })
        document.getElementById('set-url').addEventListener('click',() => {
            urlBox.style.display = 'none';
            let inputUrl = document.getElementById('url').value;
            let inputName = document.getElementById('url_name').value;
            this.setUrl(inputUrl, inputName);
        })
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

    setUrl(url, name){
        this.editor.commands.insertContent(`<a href=${url}>${name}</a> `);
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

    async addImage() {
        await multimedia.addImgInput();
        /*let img = multimedia.getLastUploadedImg();
        multimedia.appendToEditor(img, this.editor);*/
        multimedia.submitNewImage();
    }

    appendCachedImgToEditor(imgChecksum){
        multimedia.appendToEditor(imgChecksum);
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