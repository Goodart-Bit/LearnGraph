import { Controller } from "@hotwired/stimulus"
import cytoscape from "cytoscape"
import cola from "cytoscape-cola"

export default class extends Controller {
    static targets = [ "path", "notesUrl" ]

    connect(){
        cytoscape.use(cola)
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
        })
        this.cy.layout(this.getOptions()).run()
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

    getOptions() {
        // default layout options
        return {
            name: 'cola',
            animate: true, // whether to show the layout as it's running
            refresh: 1, // number of ticks per frame; higher is faster but more jerky
            maxSimulationTime: 4000, // max length in ms to run the layout
            ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
            fit: true, // on every layout reposition of nodes, fit the viewport
            padding: 30, // padding around the simulation
            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

            // layout event callbacks
            ready: function(){}, // on layoutready
            stop: function(){}, // on layoutstop

            // positioning options
            randomize: false, // use random node positions at beginning of layout
            avoidOverlap: true, // if true, prevents overlap of node bounding boxes
            handleDisconnected: true, // if true, avoids disconnected components from overlapping
            convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
            nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
            flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
            alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
            gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
            centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

            // different methods of specifying edge length
            // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
            edgeLength: undefined, // sets edge length directly in simulation
            edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
            edgeJaccardLength: undefined, // jaccard edge length in simulation

            // iterations of cola algorithm; uses default values on undefined
            unconstrIter: undefined, // unconstrained initial layout iterations
            userConstIter: undefined, // initial layout iterations with user-specified constraints
            allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
        };
    }

    async getNotes() {
        let url = this.notesUrlTarget.innerHTML
        let obj = await (await fetch(url)).json();
        return obj;
    }
}