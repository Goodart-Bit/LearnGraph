import { Controller } from "@hotwired/stimulus"
import cytoscape from "cytoscape"

export default class extends Controller {
    static targets = [ "note" ]

    connect(){
        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.getNoteElements(),
            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': this.getRandColor(),
                        'label': 'data(id)'
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
    }

    getNoteElements() {
        let elements = this.noteTargets.map(note => {
            return { data: { id: note.innerHTML }}
        });
        return elements;
    }

    getRandColor(){
        return "#723"
    }
}