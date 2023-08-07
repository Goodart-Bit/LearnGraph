const imageInputField = document.getElementById('new-image-field');
const imgDataTransfer = new DataTransfer();
const _URL = window.webkitURL;

export function addToImgInput() {
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
export function getLastInputImg(){
    let lastUploadedImg = imgDataTransfer.files[imgDataTransfer.files.length - 1];
    let img = new Image();
    img.src = _URL.createObjectURL(lastUploadedImg);
    return img;
}

export function appendToEditor(img, editor){
    img.onload = (e) => {
        editor.commands.setImage({ src: img.src });
    }
}

export function deleteFormImage(fileUrl){
    throw "URL image deletion has not been implemented";
}





