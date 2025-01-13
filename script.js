
class WSFormDesigner {
    // Static variable to hold the single instance
    static instance = null;

    // Private constructor to prevent direct instantiation
    constructor() {
        if (WSFormDesigner.instance) {
            return WSFormDesigner.instance; // Return the existing instance
        }
        WSFormDesigner.instance = this;
    }

    AddFormElement(par_cId,par_nTop,par_nLeft,par_nWidth,par_nHeight,par_cColor) {
        const newElement = document.createElement('ws-rectangle');

        console.log(newElement);

        newElement.id = par_cId ; // 'element_' + Date.now(); // Using timestamp as a unique ID
        newElement.setAttribute("top",par_nTop+'px');
        newElement.setAttribute("left",par_nLeft+'px');
        newElement.setAttribute("width",par_nWidth+'px');
        newElement.setAttribute("height",par_nHeight+'px');

        // newElement.color = par_cColor;//    I thought the property color was link to its attribute via the set 
        newElement.setAttribute("color", par_cColor);

        // Append the new element to the container
        document.getElementById('FormDesigner').appendChild(newElement);

    }

}

const GlobalWSFormDesigner = new WSFormDesigner();

let box1Ref = document.getElementById("box1");
box1Ref.setAttribute("left","40px");

//Only once the custom component is loaded, will its properties be available.
document.addEventListener('DOMContentLoaded', () => {
    //HTML has loaded
    let box1Ref = document.getElementById("box1");
    console.log(box1Ref.id,box1Ref.left);
});


GlobalWSFormDesigner.AddFormElement('box4',450,30,300,40,"yellow");


// document.addEventListener('dblclick',function(){console.log("2click");});
document.addEventListener('click',function(){console.log('clicked');});

document.addEventListener('contextmenu',function(event){event.preventDefault(); console.log('contextmenu');});
//monitorEvents(document,'contextmenu');


