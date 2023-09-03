const imageInputField = document.getElementById('new-image-input');
const imgDataTransfer = new DataTransfer();
const newSubmitBtn = document.getElementById('new-img-submit');
const _URL = window.webkitURL;
let lastUploadedImg;

export function addImgInput() {
    imageInputField.click();
    return new Promise((resolve, reject) => {
        imageInputField.onchange = (e) => {
            let file = e.target.files[0];
            resolve(file);
        }
    }).then((file) => {
        //imgFile.relativePath = _URL.createObjectURL(imgFile);
        imgDataTransfer.items.add(file);
        imageInputField.files = imgDataTransfer.files;
    });
}

// Most recently uploaded images are at the end of the files of the input[type="file"]
export function getLastUploadedImg(){
    lastUploadedImg = imageInputField.files[imageInputField.files.length - 1];
    let img = new Image();
    img.src = _URL.createObjectURL(lastUploadedImg);
    return img;
}

export function appendToEditor(checksum){
    let img = getLastUploadedImg();
    img.checksum = checksum;
    img.onload = (e) => {
        const appendImgRequest  = new CustomEvent('insertNewImage',
            { detail: {img: img}});
        const editorEle = document.getElementsByClassName("ProseMirror")[0];
        editorEle.dispatchEvent(appendImgRequest);
    }
}

export function submitNewImage(){
    newSubmitBtn.click();
}

export function deleteFormImage(fileUrl){
    throw "URL image deletion has not been implemented";
}





