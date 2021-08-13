export function isNum(size) {
    return (size | 0) === size;
}

export function direction(comp, y, x) {
    return comp.horizontal ? y : x;
}

export function toSize(comp, size) {
    if (isNum(size) || !size) {
        return size;
    }
    return (
        (parseFloat(size) /
            comp.$el[direction(comp, 'clientHeight', 'clientWidth')]) *
        100
    );
}

export function getSize(comp, size) { }

export function createSvg(h, paths) {
    const p = [];
    for (const key in paths) {
        if (Object.hasOwnProperty.call(paths, key)) {
            const d = paths[key];
            p.push(
                h('path', {
                    attrs: {
                        d,
                    },
                })
            );
        }
    }
    return h(
        'svg',
        {
            attrs: {
                width: 20,
                height: 20,
                viewBox: '0 0 1024 1024',
                xmlns: 'http://www.w3.org/2000/svg',
            },
        },
        p
    );
}

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
