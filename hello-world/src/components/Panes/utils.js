
export function isNum(size) {
    return ((size | 0) === size);
}

export function direction(comp, y, x) {
    return comp.horizontal ? y : x;
}

export function toSize(comp, size) {
    if (isNum(size) || !size) {
        return size;
    }
    return (parseFloat(size) / comp.$el[direction(comp, 'clientHeight', 'clientWidth')] * 100);
};

export function getSize(comp, size) {
};


export function sumPrevPanesSize(panes, splitterIndex) {
    return panes.reduce(
        (total, pane, i) => total + (i < splitterIndex ? pane.size : 0),
        0
    );
}

export function sumNextPanesSize(panes, splitterIndex) {
    return panes.reduce(
        (total, pane, i) => total + (i > splitterIndex + 1 ? pane.size : 0),
        0
    );
}
