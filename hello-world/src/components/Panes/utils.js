
export function isNum(size) {
    return ((size | 0) === size);
}

export function toSize(comp, size) {
    if (isNum(size) || !size) {
        return size;
    }
    return (parseFloat(size) / comp.$el[comp.horizontal ? 'offsetHeight' : 'offsetWwidth'] * 100);
};

export function getSize(comp, size) {
    console.log(comp, comp.container.offsetHeight);
};