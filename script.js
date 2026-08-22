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

        // if the window is being dragged, we glue the cursor to its grab position
        if (isDragging) {
            virtualCursor.style.left = `${clampedLeft + grabOffsetX}px`;
            virtualCursor.style.top = `${clampedTop + grabOffsetY}px`;
        }
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
    }

    function stopDragging () {
        // this makes sure the cursor snaps back to where it first grabbed the window
        virtualCursor.style.left = `${element.offsetLeft + grabOffsetX}px`;
        virtualCursor.style.top = `${element.offsetTop + grabOffsetY}px`;
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