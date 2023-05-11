import { Controller } from "@hotwired/stimulus"
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

export default class extends Controller {
        possible_attrs = ["bold","italic","underline","strike",'link',"bulletList","orderedList"]
        static targets = ["input"]

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
            onTransaction: ({editor}) => {
              context.highlightSelectedButtons();
            },
            onBlur({ editor }) {
              context.populateInput();
            },
            onCreate({ editor }) {
              let parent = document.getElementById("editor-holder")
              let bottom_bar = document.getElementById("bottom-bar")
              let editor_box = document.getElementsByClassName("ProseMirror")[0]
              parent.insertBefore(editor_box, bottom_bar)
            }
          });
        }

        populateInput() {
          this.inputTarget.value = this.editor.getHTML();
        }

        getActiveAttributes(){
          return this.possible_attrs.filter(attr => this.editor.isActive(attr))
        }

        highlightSelectedButtons(){
          let attrs_to_mark = this.getActiveAttributes();
          let buttons = Array.from(document.getElementsByClassName("edit-style"))
            .map(btn_container => Array.from(btn_container.children)).flat();
          buttons.forEach(button => {
            let button_attr = button.id
            if(attrs_to_mark.some(attr => attr == button_attr)){ 
              button.classList.add("selected")
            } else { button.classList.remove("selected") }
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
          this.editor.commands.toggleLink({ href: 'https://youtube.com'})
        }

        addOl() {
            this.editor.chain().focus().toggleOrderedList().run();

        }

        addUl() {
          this.editor.chain().focus().toggleBulletList().run();
        }

        displayLinkHelper(){
          const showLinkHelper = new CustomEvent("showLinkHelper")
          window.dispatchEvent(showLinkHelper)
        }

        addNoteLink(event) {
          let noteLinkElement = event.detail
          noteLinkElement.className = "zk_link"
          let noteLinkHTML = noteLinkElement.outerHTML
          let editorLastPos = this.editor.view.state.selection.anchor
          this.editor.commands.insertContentAt(editorLastPos, ` ${noteLinkHTML} `, {
            updateSelection: true,
            parseOptions: {
              preserveWhitespace: 'full',
            }
          })
        }
        

}