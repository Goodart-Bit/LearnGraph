export class CollectionHelper {
    constructor(cyGraph){
        this.cy = cyGraph;
    }

    validPath(dfs){
        return dfs.path && dfs.path.nodes();
    }

    newEdge(edge, edges){
        return !edges.find(elem => elem.data('id') === edge.id)
    }

    invalidEdge(edge, edges, distance){
        let newEdge = this.newEdge(edge, edges);
        let unlinkedNeighbor = newEdge && distance === 1;
        let pointedAt = newEdge && edges.find(elem => elem.data('id') === `${edge.target}-${edge.source}`);
        let redundantConn = newEdge && !pointedAt && edges.find(elem => elem.data('target') === edge.target);
        return unlinkedNeighbor || redundantConn || pointedAt;
    }

    getFilteredStruct(filterCollection){
        let cyEdges = this.cy.edges();
        return filterCollection.map(node => {
            let elemNeighbors = []
            filterCollection.forEach(neighbor => {
                if(node == neighbor) return;
                let noteId = node.data('id');
                let linkId = neighbor.data('id');
                let dfs = this.cy.elements().aStar({root: `#${noteId}`, goal: `#${linkId}`, directed: true});
                if(this.validPath(dfs)){
                    let edge = { id: `${noteId}-${linkId}`, source: noteId.toString(), target: linkId.toString() }
                    if(this.invalidEdge(edge, cyEdges, dfs.distance)) { return; }
                    dfs.path.select()
                    elemNeighbors.push(edge);
                }
            });
            return {data: node.data(), neighbors: elemNeighbors }
        });
    }
}