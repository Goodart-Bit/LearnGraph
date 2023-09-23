import { Controller } from "@hotwired/stimulus"
import cytoscape from "cytoscape"
import cola from "cytoscape-cola"

export default class extends Controller {
    static targets = [ "path", "notesUrl", "edgesUrl" ]
    cyElements = {nodes: [], edges: []}
    connect(){
        cytoscape.use(cola)
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.getElements(),
            layout: this.getLayout(),
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
                        'line-color': '#040709',
                        'target-arrow-color': '#040709',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
        })
        this.addWindowListener();
        this.addNodeListener();
    }

    addWindowListener(){
        window.addEventListener("pageshow", async (event) => {
            if(this.cy != null){
                this.flushCyElements();
                this.cy.elements().remove();
                let updatedElements = await this.getElements();
                let resetLayout = this.getLayout();
                this.cy.json({
                    elements: updatedElements
                }).layout(resetLayout).run();
            }
        });
    }

    addNodeListener() {
        let notesUrl = this.pathTarget.innerHTML
        this.cy.on('tap', 'node', function(e){
            var node = e.target;
            let noteId = node.id()
            window.location.assign(notesUrl + noteId + "/edit");
        });
    }

    async getElements(){
        await this.initNoteElements();
        return this.cyElements.nodes.concat(this.cyElements.edges);
    }

    async initNoteElements() {
        let fetchNotes = await this.getNotes();
        let fetchEdges = await this.getEdges();
        fetchNotes.forEach(note => {
            let noteData = { name: note.title, id: note.id, body: note.body }
            let noteEdges = fetchEdges.filter(edge => edge[0] === note.id);
            noteEdges = this.getNoteEdgesData(note.id, noteEdges);
            this.initCyNode(noteData, noteEdges);
        });
    }

    flushCyElements(){
        this.cyElements = {nodes: [], edges: []};
    }

    getRandColor(){
        let colors = ["#fffa78","#f371f5","#94f571","#71cbf5"]
        return colors[Math.floor(Math.random() * colors.length)]
    }

    initCyNode(nodeData, neighbors) {
        this.cyElements.nodes.push({ data: nodeData });
        neighbors.forEach(neighbor => {
          this.cyElements.edges.push({data: neighbor});
        });
    }

    getNoteEdgesData(noteId, noteEdges) {
        const initialArray = [];
        return noteEdges.reduce((linkIds, edge) => {
            let linkId = edge.find(id => id !== noteId);
            if(linkId > -1) {
                linkIds.push({ id: `${noteId}-${linkId}`,
                    source: noteId.toString(), target: linkId.toString() });
            }
            return linkIds;
        }, initialArray);
    }

    getLayout() {
        // default layout options
        return {
            name: 'cola',
            animate: true, // whether to show the layout as it's running
            refresh: 1, // number of ticks per frame; higher is faster but more jerky
            maxSimulationTime: 4000, // max length in ms to run the layout
            ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
            fit: false, // on every layout reposition of nodes, fit the viewport
            padding: 20, // padding around the simulation
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
            nodeSpacing: function( node ){ return 80; }, // extra spacing around nodes
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
        return await (await fetch(url)).json();
    }

    async getEdges(){
        return await (await fetch(this.edgesUrlTarget.innerHTML)).json();
    }
}