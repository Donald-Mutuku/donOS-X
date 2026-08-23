const screen = document.querySelector('.screen');
const virtualCursor = document.getElementById('virtualCursor')

let isDragging = false;
let highestZIndex = 20;

function bringToFront(element){
    highestZIndex++
    element.style.zIndex = highestZIndex;
}

screen.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    
    const rect = screen.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    virtualCursor.style.left = `${x}px`;
    virtualCursor.style.top = `${y}px`;
});

screen.addEventListener('mouseenter', () =>{
    virtualCursor.style.display = 'block';
});

screen.addEventListener('mouseleave', () => {
    if (!isDragging) virtualCursor.style.display = 'none';
});


var windows = document.querySelectorAll(".window")
windows.forEach(function(winElement) {
    initWindow(winElement);
})

function initWindow(element) {
    
    element.addEventListener("mousedown", () => {
        bringToFront(element);
    });

    var openLink = document.getElementById(element.id + "open")
        if (openLink) {
            openLink.addEventListener("dblclick", function() {
                openWindow(element);
            });
        }
    var closeButton = document.getElementById(element.id + "close")
    if (closeButton) {
        closeButton.addEventListener("click", function() {
            closeWindow(element);
        });
    }

    var maxButton = document.getElementById(element.id + "max")
    if (maxButton) {
        maxButton.addEventListener("click", function() {
            maximizeWindow(element);
        });
    }

    var closeButtons = element.querySelectorAll("[data-action='close']");
    closeButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        closeWindow(element);
        });
    });

    dragElement(element);
};

function dragElement(element) {
    let startMouseX = 0, startMouseY = 0;
    let startWinLeft = 0, startWinTop = 0;
    let grabOffsetX = 0;
    let grabOffsetY = 0;

    // immediately the page loads, the window gets forced inside boundaroes
    clampPosition(element.offsetTop, element.offsetLeft);

    function clampPosition(targetTop, targetLeft) {
        const parent = element.parentElement;
        if (!parent) return;

        const minTop = 0;
        const minLeft = 0;
        const maxTop = parent.clientHeight - element.offsetHeight;
        const maxLeft = parent.clientWidth - element.offsetWidth;

        const clampedTop = Math.max(minTop, Math.min(targetTop, maxTop));
        const clampedLeft = Math.max(minLeft, Math.min(targetLeft, maxLeft));

        element.style.top = `${clampedTop}px`;
        element.style.left = `${clampedLeft}px`;

    }

    if (document.getElementById(element.id + "header")) {
        document.getElementById(element.id + "header").onmousedown = startDragging;
    }
    else {
        element.onmousedown = startDragging;
    }

    function startDragging(e) {
        e = e || window.event;
        e.preventDefault();

        isDragging = true;
        bringToFront(element);

        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startWinLeft = element.offsetLeft;
        startWinTop = element.offsetTop;

        // this gets the position where the user clicked inside the window, relative to the top-left of the window
        const winRect = element.getBoundingClientRect();
        grabOffsetX = e.clientX - winRect.left;
        grabOffsetY = e.clientY - winRect.top;

        document.onmouseup = stopDragging;
        document.onmousemove = stepDrag;
    }

    function stepDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // this calculates the change in position from the original click point, instead of from cumulative click points, therefore snapping is more accurate
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
        clampPosition(startWinTop + deltaY, startWinLeft + deltaX);

        const rect = screen.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        virtualCursor.style.left = `${x}px`;
        virtualCursor.style.top = `${y}px`;
    }

    function stopDragging () {
        // turns off this flag so that the cursor is free to move again
        isDragging = false;
        document.onmouseup = null;
        document.onmousemove = null;
    }

    window.addEventListener('resize', () => {
        clampPosition(element.offsetTop, element.offsetLeft);
    });
}


function closeWindow(element) {
    element.style.display = 'none'
    element.isOpen = false;
}

function openWindow(element) {
    if (element.isOpen === true) {
        return;
    }

    element.style.display = 'flex'
    bringToFront(element);
    element.isOpen = true;

    const parent = element.parentElement;
    if (parent) {
        const centerX = (parent.clientWidth - element.offsetWidth) / 2;
        const centerY = (parent.clientHeight - element.offsetHeight) /2;
        element.style.left = `${Math.max(0, centerX)}px`;
        element.style.top = `${Math.max(0, centerY)}px`
    }
}

function maximizeWindow(element) {
    if (element.isMax === true) {
        element.style.width = element.dataset.initWidth;
        element.style.height = element.dataset.initHeight;
        element.style.top = element.dataset.topCoords;
        element.style.left = element.dataset.leftCoords;
        element.isMax = false;
        return;
    }
    
    // save the window coordinates and window size before the window was maximized
    element.dataset.topCoords = element.style.top;
    element.dataset.leftCoords = element.style.left;
    element.dataset.initWidth = element.style.width;
    element.dataset.initHeight = element.style.height;

    element.style.width = '100%';
    element.style.height = '100%';
    element.style.placeSelf = 'center';
    element.style.inset = 0;
    element.isMax = true;
}

// Text formatting functions

const boldBtn = document.getElementById('boldBtn');
const italicsBtn = document.getElementById('italicsBtn');
const notesField = document.getElementById('notesField');

boldBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand('bold', false, null);
    updateState();
});

italicsBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand('italic', false, null);
    updateState();
});

// To update the text formatting buttons when they are clicked, or when content is bold/italic etc.
notesField.addEventListener('keyup', updateState);
notesField.addEventListener('keydown', updateState);

function updateState() {
    const isBold = document.queryCommandState('bold');
    const isItalics = document.queryCommandState('italic');

    boldBtn.classList.toggle('active', isBold);
    italicsBtn.classList.toggle('active', isItalics);
}

const icontainer = document.getElementById('icontainer');
const notes = document.getElementById('notes')
const fileNameDisplay = document.getElementById("fileNameDisplay");

let currentFile = null;

const saveBtn = document.getElementById('save-btn');
saveBtn.addEventListener('click', function(){
    if (currentFile) {
        localStorage.setItem(currentFile, notesField.innerHTML);
    }

    else {
        const empty = notesField.textContent.replace(/\u00a0/g, ' ').trim() === "";
        if (empty) {
            alert("You can't save an empty file >:(");
            return;
        }
        let fileName = prompt('Please enter a file name:');
        if (!fileName) {
            return;
        }
        if (!fileName.endsWith('.txt')) {
            fileName += '.txt';
        }
        localStorage.setItem(fileName, notesField.innerHTML);
        currentFile = fileName;
        fileNameDisplay.textContent = fileName;

        const div = document.createElement('div')
        div.classList.add('desktopIcon');
        div.innerHTML = `<img src=icons/notesicon.svg> <p>${fileName}</p>`;
        icontainer.appendChild(div);

        div.addEventListener('dblclick', function() {
            openWindow(notes);
            currentFile = fileName;
            var fetched = localStorage.getItem(fileName);
            notesField.innerHTML = fetched;
            var fileNameDisplay = document.getElementById("fileNameDisplay");
            fileNameDisplay.textContent = fileName;
        });
    }
});

const newBtn = document.getElementById("new-btn");
newBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    notesField.innerHTML = "";
    currentFile = null;
    fileNameDisplay.textContent = "";
});

// for some reason, if u pressed backspace when the notesField was empty, it messed with the padding of the entire window a bit
// to fix that:
notesField.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
        // first clean up break tags inserted by the browser, or white space that isn't visible
        const cleanUp = notesField.innerHTML.replace(/br\s*\?>/gi, '').trim();
        // then, if cleanUp is empty
        if (cleanUp === '') {
            // first, we tell the browser "yo, chill with the random <br> tags"
            e.preventDefault();
            // then we keep the container emptyy
            notesField.innerHTML = '';
        }
    }
});
