const imageInputField = document.getElementById('new-image-input');
const sessionImages = document.getElementById('added-images');
const imgDataTransfer = new DataTransfer();
const newSubmitBtn = document.getElementById('new-img-submit');
const _URL = window.webkitURL;
let persistedImgs;
if(document.getElementById("persisted-images")){
    persistedImgs = Array.from(document.getElementById("persisted-images").children);
}
let imgNodes = [];

export function addImgInput() {
    imageInputField.click();
    return new Promise((resolve, reject) => {
        imageInputField.onchange = (e) => {
            let file = e.target.files[0];
            resolve(file);
        }
    }).then((file) => {
        imgDataTransfer.items.add(file);
    });
}

// Most recently uploaded images are at the end of the files of the input[type="file"]
export function getLastUploadedImg() {
    let lastUploadedImg = imageInputField.files[imageInputField.files.length - 1];
    let img = new Image();
    img.src = _URL.createObjectURL(lastUploadedImg);
    return img;
}

// processing of a new image consists of two steps
// 1. storing the image input in the added images div to be sent to the controller
// 2. appending such image in the editor
// 3. cleaning the image
export function processNewImage(checksum) {
    let form_button = document.getElementById("new-image-input")
    let fileInput = form_button.closest("input").cloneNode(true);
    fileInput.removeAttribute("id");
    fileInput.setAttribute("checksum", checksum);
    fileInput.setAttribute("name", "note[images][]");
    sessionImages.append(fileInput);
    appendToEditor(checksum);
}

export function appendToEditor(checksum) {
    let img = getLastUploadedImg();
    img.checksum = checksum;
    img.onload = (e) => {
        const appendImgRequest = new CustomEvent('insertNewImage',
            {detail: {img: img}});
        const editorEle = document.getElementsByClassName("ProseMirror")[0];
        editorEle.dispatchEvent(appendImgRequest);
    }
}

export function submitNewImage() {
    newSubmitBtn.click();
}

export function getDeletedNode(editor) {
    if (imgNodes.length === 0) imgNodes = getImgNodes(editor);
    let currentImgNodes = getImgNodes(editor);
    let deletedChecksums = imgNodes.filter((node) => !currentImgNodes.includes(node))
    deletedChecksums.forEach((checksum) => addDeleteInput(checksum));
    imgNodes = currentImgNodes;
}

export function addDeleteInput(checksum){
    let deleteInput = document.createElement('input');
    deleteInput.setAttribute('value', checksum);
    deleteInput.setAttribute('name', 'note[destroy_images][]');
    deleteInput.setAttribute('hidden', true);
    sessionImages.append(deleteInput);
}


export function getImgNodes(editor) {
    let currentNodes = [];
    editor.state.doc.forEach((node) => {
        if (node.type.name !== 'image') return;
        currentNodes.push(node.attrs.checksum);
    });
    return currentNodes;
}

export function deleteFormImage(node) {
    console.log(node)
}

export function resetImgSrcs(editor) {
    editor.commands.command(({tr}) => {
        tr.doc.descendants((node, pos) => {
            if (node.type.name === 'image') { // SI HAY IMAGENES
                let sourceImg = persistedImgs.find(img => {
                    return img.id === `${node.attrs.checksum}`
                })
                try {
                    tr.setNodeMarkup(pos, node.type, {
                        src: sourceImg.src, checksum: sourceImg.id, //COMPRUEBE SU CHECKSUM Y EL ENLACE
                    })// AL QUE PERTENECEN EN S3
                } catch {
                    console.log(`Could not set node with id ${node.attrs.checksum} src\nimg is ${sourceImg}`)
                }
            }
        })
        return true
    });
}





