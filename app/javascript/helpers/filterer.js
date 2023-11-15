export class Filterer {
    titleInput = document.getElementById('name-input');
    bodyInput = document.getElementById('body-input');
    selectorDiv = document.getElementById("selectors");
    selectorDict = { "filter-name": "name-holder", "filter-text": "body-holder", "filter-tags": "tag-holder"}

    constructor(cyGraph){
        this.cy = cyGraph;
        this.initializeSelectors();
    }

    initializeSelectors(){
        let checkboxes = this.selectorDiv.getElementsByTagName('input');
        Array.from(checkboxes).forEach(elem => {
            elem.addEventListener('change',(e) => {
              let holderId = this.selectorDict[e.target.id];
              let inputDiv = document.getElementById(holderId);
              inputDiv.style.display = inputDiv.style.display !== 'none' ? 'none' : 'block';
            });
        });
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
        return filterCollection.map(node => {
            let elemNeighbors = []
            filterCollection.forEach(neighbor => {
                if(node === neighbor) return;
                let noteId = node.data('id');
                let linkId = neighbor.data('id');
                let dfs = this.cy.elements().aStar({root: `#${noteId}`, goal: `#${linkId}`, directed: true});
                if(this.validPath(dfs)){
                    let edge = { id: `${noteId}-${linkId}`, source: noteId.toString(), target: linkId.toString() }
                    if(this.invalidEdge(edge, this.cy.edges(), dfs.distance)) { return; }
                    dfs.path.select()
                    elemNeighbors.push(edge);
                }
            });
            return {data: node.data(), neighbors: elemNeighbors }
        });
    }

    filterNodes(){
        return this.cy.nodes().filter((elem) => {
            return this.validTitle(elem.data('name'))  ||
                this.validBody(elem.data('body')) ||
                    this.validTags(elem.data('tags'));
        })
    }

    validTitle(noteTitle) {
        let input = this.titleInput.value.toLowerCase();
        if(!document.getElementById("filter-name").checked
            || input.length === 0) { return false; }

        return noteTitle.toLowerCase().includes(input);
    }

    validBody(noteText) {
        let input = this.bodyInput.value.toLowerCase();
        if(!document.getElementById("filter-text").checked
            || !noteText || this.bodyInput.length === 0) { return false; }

        return noteText.includes(input);
    }

    validTags(noteTags) {
        if(!document.getElementById('filter-tags').checked || noteTags.length === 0)
        { return false; }
        /*for (const tag of this.getSelectedTags()){
            if(!noteTags.includes(tag)) { return false; }
        }*/
        for (const title of this.getSelectedTags()){
            for(const tag of noteTags){
                if(tag.title === title) { return true; }
            }
        }
        return false;
    }

    getSelectedTags(){
        let tags = document.getElementById('tag-holder')
            .getElementsByTagName('input');
        return Array.from(tags).filter(tagCheck => tagCheck.checked)
            .map(checked => checked.id)
    }
}