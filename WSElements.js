
//-------------------------------------------------------------------------------------------------------------------------------------------
const templateWSRectangleElement = document.createElement('template');
templateWSRectangleElement.innerHTML = `
    <style>
        :host {
            display: block;
            background-color: #333;   /* Default background */
            position: absolute;min-width:100px;min-height:20px;border:1px solid black;
            border: 1px solid black;
        }

        .WSResizer       {position: absolute; /* border: 1px solid #1264df; */}
        .WSResizerSide   {z-index: 11;}
        .WSResizerCorner {z-index: 12;}

        .WSResizerSideTop           {top:-4px;left:0px;width:100%;height:8px;cursor:row-resize;}
        .WSResizerSideBottom        {bottom:-4px;left:0px;width:100%;height:8px;cursor:row-resize;}
        .WSResizerSideLeft          {top:0px;left:-4px;width:8px;height:100%;cursor:col-resize;}
        .WSResizerSideRight         {top:0px;right:-4px;width:8px;height:100%;cursor:col-resize;}

        .WSResizerCornerTopLeft     {top:-4px;left:-4px;width:12px;height:12px;cursor:nwse-resize;}
        .WSResizerCornerTopRight    {top:-4px;right:-4px;width:12px;height:12px;cursor:nesw-resize;}
        .WSResizerCornerBottomLeft  {bottom:-4px;left:-4px;width:12px;height:12px;cursor:nesw-resize;}
        .WSResizerCornerBottomRight {bottom:-4px;right:-4px;width:12px;height:12px;cursor:nwse-resize;}
    </style>
    
    <div class="WSResizer WSResizerSide WSResizerSideTop WSResizerTop"></div>
    <div class="WSResizer WSResizerSide WSResizerSideBottom WSResizerBottom"></div>
    <div class="WSResizer WSResizerSide WSResizerSideLeft WSResizerLeft"></div>
    <div class="WSResizer WSResizerSide WSResizerSideRight WSResizerRight"></div>
    <div class="WSResizer WSResizerCorner WSResizerCornerTopLeft WSResizerTop WSResizerLeft"></div>
    <div class="WSResizer WSResizerCorner WSResizerCornerTopRight WSResizerTop WSResizerRight"></div>
    <div class="WSResizer WSResizerCorner WSResizerCornerBottomLeft WSResizerBottom WSResizerLeft"></div>
    <div class="WSResizer WSResizerCorner WSResizerCornerBottomRight WSResizerBottom WSResizerRight"></div>
`;

class WSBaseElement extends HTMLElement {

    static lastZIndex = 0;

    formElement;

    #elementResizeId = null;
    #elementResizeStyle = null;
    #elementResizeTop;
    #elementResizeBottom;
    #elementResizeLeft;
    #elementResizeRight;

    #elementDragId = null;
    #elementDragStyle = null;
    #elementDragOffsetX;
    #elementDragOffsetY;

    #elementResizerMinWidth;
    #elementResizerMinHeight;

    constructor() {
        super();
        // this.root = this.attachShadow({ mode: 'open',delegatesFocus:true });  //closed
        this.root = this.attachShadow({ mode: 'closed'});  // Had to use a nested div addEventListener to instead of showdom

        const nestedDiv = document.createElement('div');
        nestedDiv.id = "WSFormElement";
        nestedDiv.style.position = "absolute";
        nestedDiv.style.top = 0;
        nestedDiv.style.left = 0;
        nestedDiv.style.width = "100%";
        nestedDiv.style.height = "100%";
        nestedDiv.style.border = "1px solid black";

        this.root.append(nestedDiv);
        this.formElement = nestedDiv;

        // shadowRoot shields the web component from external styling, mostly
        let clone = templateWSRectangleElement.content.cloneNode(true);
        nestedDiv.append(clone);

        // Initialize mouse-related variables
        this.isMouseDown = false;   // To handle ensure we only deal with the move and up from the component we started dragging and resizing.

        // Bind methods to 'this'
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleMouseDown   = this.handleMouseDown.bind(this);
        this.handleMouseUp     = this.handleMouseUp.bind(this);
        this.handleMouseMove   = this.handleMouseMove.bind(this);
    }

    //Web Components added or removed from page
    connectedCallback() {  // Added component to page
        this.formElement.addEventListener('dblclick',  this.handleDoubleClick);  // Since we are set at "closed", had to addEvent to the nested DIV.
        this.formElement.addEventListener('mousedown', this.handleMouseDown);    // Since we are set at "closed", had to addEvent to the nested DIV.
        document.addEventListener('mouseup',   this.handleMouseUp);              // Had to attach to document since the mouse will move outside the web component.
        document.addEventListener('mousemove', this.handleMouseMove);            // Had to attach to document since the mouse will move outside the web component.
    }

    disconnectedCallback() {  // Removed component from page
        // Clean up event listeners when the component is removed from the DOM
        this.formElement.removeEventListener('dblclick' , this.handleDoubleClick);
        this.formElement.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup',   this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    handleDoubleClick(Event) {
        WSRectangleElement.lastZIndex++;
        // console.log("DoubleClick",WSRectangleElement.lastZIndex);
        this.style.zIndex = WSRectangleElement.lastZIndex;
    }

    handleMouseDown(Event) {
        this.isMouseDown = true;
        // console.log('Mouse down at', Event.clientX, Event.clientY,Event.target.id,Event.target.classList);

        const classList = Event.target.classList;
        if (classList.contains("WSResizer")) {
            this.#elementResizeId = this.id; //Event.target.parentElement.id;
            this.#elementResizeStyle = this.style;

            this.#elementResizeTop    = classList.contains("WSResizerTop");
            this.#elementResizeBottom = classList.contains("WSResizerBottom");
            this.#elementResizeLeft   = classList.contains("WSResizerLeft");
            this.#elementResizeRight  = classList.contains("WSResizerRight");

            const elementStyle = window.getComputedStyle(this);

            this.#elementResizerMinWidth  = parseInt(elementStyle.getPropertyValue('min-width'),10);
            this.#elementResizerMinHeight = parseInt(elementStyle.getPropertyValue('min-height'),10);

        } else if (Event.target.id === "WSFormElement") {   //Clicked on the root container
            this.#elementDragId = this.id;  //Event.target.id;
            this.#elementDragStyle = this.style;
            this.#elementDragOffsetX = Event.clientX - this.offsetLeft;
            this.#elementDragOffsetY = Event.clientY - this.offsetTop;

        }

    }

    // Mouse up handler
    handleMouseUp(Event) {
        this.isMouseDown = false;
        // console.log('Mouse up at', Event.clientX, Event.clientY);

        this.#elementResizeId = null;
        this.#elementResizeStyle = null;

        this.#elementDragId = null;
        this.#elementDragStyle = null;
    }

    NormalizeForPx(xValue) {
        if (typeof xValue === "number") {return xValue+"px";} 
        else if (xValue.toLowerCase().includes('px')) {return xValue;}
        else if (xValue.toLowerCase().includes('%')) {return xValue;}
        else {return xValue+"px";}
    }

    // Mouse move handler
    handleMouseMove(Event) {
        if (this.isMouseDown) {
            // console.log('Mouse moving at', Event.clientX, Event.clientY);

            if (this.#elementResizeId !== null) {
                Event.stopPropagation();

                const windowFullHeight = window.innerHeight;
                const windowFullWidth  = window.innerWidth;

                let mouseHorizontal = Event.clientX;
                let mouseVertical   = Event.clientY;

                if (mouseHorizontal < 0) {
                    mouseHorizontal = 0;
                } else if (mouseHorizontal > windowFullWidth) { 
                    mouseHorizontal = windowFullWidth;
                }

                if (mouseVertical < 0) {
                    mouseVertical = 0;
                } else if (mouseVertical > windowFullHeight) { 
                    mouseVertical = windowFullHeight;
                }

                const elementResizeStyle = this.#elementResizeStyle;
                
                const currentTop    = parseInt(elementResizeStyle.top,10);
                const currentLeft   = parseInt(elementResizeStyle.left,10);
                const currentWidth  = parseInt(elementResizeStyle.width,10);
                const currentHeight = parseInt(elementResizeStyle.height,10);

                if (this.#elementResizeLeft) {
                    let newLeft = mouseHorizontal+1;
                    let currentRight = currentLeft+currentWidth;
                    let newWidth = currentRight - newLeft;
                    if (newWidth < this.#elementResizerMinWidth) {
                        newLeft = currentRight - this.#elementResizerMinWidth;
                    }
                    newWidth = currentRight-newLeft;
                    if (newLeft != currentLeft || newWidth != currentWidth) {
                        elementResizeStyle.width = newWidth+"px";
                        elementResizeStyle.left  = newLeft+"px";
                    }
                }

                if (this.#elementResizeRight) {
                    let newRight = mouseHorizontal-1;
                    let newWidth = newRight - currentLeft;
                    if (newWidth < this.#elementResizerMinWidth) {
                        newRight = currentLeft + this.#elementResizerMinWidth;
                    }
                    if (newWidth != currentWidth) {
                        elementResizeStyle.width = newWidth+"px";
                    }
                }

                if (this.#elementResizeTop) {
                    let newTop = mouseVertical-1;
                    let currentBottom = currentTop+currentHeight;
                    let newHeight = currentBottom - newTop;
                    if (newHeight < this.#elementResizerMinHeight) {
                        newTop = currentBottom - this.#elementResizerMinHeight;
                    }
                    newHeight = currentBottom-newTop;
                    if (newTop != currentTop || newHeight != currentHeight) {
                        elementResizeStyle.height = newHeight+"px";
                        elementResizeStyle.top    = newTop+"px";
                    }
                }

                if (this.#elementResizeBottom) {
                    let newBottom = mouseVertical+1;
                    let newHeight = newBottom - currentTop;
                    if (newHeight < this.#elementResizerMinHeight) {
                        newBottom = currentTop + this.#elementResizerMinHeight;
                        newHeight = this.#elementResizerMinHeight; //newBottom + currentTop;
                    }
                    if (newHeight != currentHeight) {
                        elementResizeStyle.height = newHeight+"px";
                    }
                }

            } else if (this.#elementDragId !== null) {
                Event.stopPropagation();
                this.#elementDragStyle.left = (Event.clientX - this.#elementDragOffsetX) +'px';
                this.#elementDragStyle.top = (Event.clientY - this.#elementDragOffsetY) +'px';
            }

        }
    }

    // Attributes and Properties...
    static get observedAttributes() {return ['top','left','width','height','color'];}

    get top()      {return this.getAttribute('top');}
    set top(value) {this.setAttribute('top', value);}

    get left()      {return this.getAttribute('left');}
    set left(value) {this.setAttribute('left', value);console.log("xxxxxx");}

    get width()      {return this.getAttribute('width');}
    set width(value) {this.setAttribute('width', value);}

    get height()      {return this.getAttribute('height');}
    set height(value) {this.setAttribute('height', value);}

    get color()       {return this.getAttribute('color');}
    set color(value)  {this.setAttribute('color', value);}

    attributeChangedCallback(attributeName, oldVal, newVal) {
        // To set properties to match attributes
        // console.log("attributeChangedCallback",attributeName,newVal);
        if      (attributeName.toLowerCase() === 'top')    {this.style.top = this.NormalizeForPx(newVal);}
        else if (attributeName.toLowerCase() === 'left')   {this.style.left = this.NormalizeForPx(newVal);}
        else if (attributeName.toLowerCase() === 'width')  {this.style.width = this.NormalizeForPx(newVal);}
        else if (attributeName.toLowerCase() === 'height') {this.style.height = this.NormalizeForPx(newVal);}
        else if (attributeName.toLowerCase() === 'color')  {this.style.backgroundColor = newVal;}
    }

    AddToFormElement(content) {
        this.formElement.append(content);
    }

}

//-------------------------------------------------------------------------------------------------------------------------------------------
class WSRectangleElement extends WSBaseElement {

    constructor() {
        super();
        //For now the Rectangle is the Base Element
    }

}
customElements.define('ws-rectangle', WSRectangleElement);
//-------------------------------------------------------------------------------------------------------------------------------------------
class WSLabelElement extends WSBaseElement {

    constructor() {
        super();
        const content = document.createElement('span');
        content.innerHTML = '<slot name="caption"><slot>'
        this.AddToFormElement(content);
    }

}

customElements.define('ws-label', WSLabelElement);
//-------------------------------------------------------------------------------------------------------------------------------------------
class WSComboBoxElement extends WSBaseElement {

    constructor() {
        super();
        const content = document.createElement('select');
        this.AddToFormElement(content);
    }

    connectedCallback() {  // Added component to page
        super.connectedCallback();
        let selectElement = this.formElement.querySelector('select');
        let newOption;

        newOption = document.createElement('option');
        newOption.value = 'strawberry';
        newOption.textContent = 'Strawberry';
        selectElement.appendChild(newOption);

        newOption = document.createElement('option');
        newOption.value = 'banana';
        newOption.textContent = 'Banana';
        selectElement.appendChild(newOption);
       
    }

}

customElements.define('ws-combobox', WSComboBoxElement);
//-------------------------------------------------------------------------------------------------------------------------------------------
