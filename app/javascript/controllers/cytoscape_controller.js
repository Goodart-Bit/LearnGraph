import { Controller } from "@hotwired/stimulus"
import cytoscape from "cytoscape"

export default class extends Controller {
    static targets = [ "path", "notesUrl" ]

    connect(){
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.getNoteElements(),
            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': this.getRandColor(),
                        'label': 'data(name)',
                        'shape': 'roundrectangle',
                        height: '50px',
                        width: '45px'
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],

            layout: {
                name: 'grid',
                rows: 1
            }
        })
        this.addNodeListener()
        this.getNotes()
    }

    addNodeListener() {
        let notesUrl = this.pathTarget.innerHTML
        this.cy.on('tap', 'node', function(e){
            var node = e.target;
            let noteId = node.id()
            window.location.href = notesUrl + noteId + "/edit";
        });
    }

    private

    async getNoteElements() {
        let noteObjs = await this.getNotes();
        let elements = noteObjs.map(note => {
            return { data: { name: note.title, id: note.id }} //Cytoscape element => {id, source, target}
        });
        return elements;
    }

    getRandColor(){
        let colors = ["#fffa78","#f371f5","#94f571","#71cbf5"]
        return colors[Math.floor(Math.random() * colors.length)]
    }

    async getNotes() {
        let url = this.notesUrlTarget.innerHTML
        let obj = await (await fetch(url)).json();
        return obj;
    }
}