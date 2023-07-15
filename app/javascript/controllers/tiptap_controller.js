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
                        if (keyId !== 8) return;
                        let modifiedNode = this.getNodeInCursor()
                        if (modifiedNode) this.removeLinkMark(modifiedNode);
                    },
                    appendLink: (view, e) => {
                        let linkData = e.detail.note;
                        this.addZkLink(linkData.title, linkData.url)
                    }
                },
            }
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
    addZkLink(name, url) {
        let space = ' '
        this.editor.commands.insertContent(space + `<a href=${url} class='zk_link'>${name}</a>` + space);
    }

    removeLinkMark(node) {
        node.marks = node.marks.filter((mark) => {
            return mark.type.name !== 'link'
        })
    }

    // GLOBAL METHODS

    populateInput() {
        this.inputTarget.value = this.editor.getHTML();
    }

    getNodeInCursor() {
        let resolvedPos = this.editor.state.selection.$head
        let posInNode = resolvedPos.parentOffset - 1
        if (posInNode < 0) return null;
        return this.editor.state.selection.$head.parent.nodeAt(posInNode)
    }
}