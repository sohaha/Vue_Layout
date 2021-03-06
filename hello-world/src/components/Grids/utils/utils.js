/* eslint-disable */

export function bottom(layout) {
  let max = 0; let bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

export function cloneLayout(layout) {
  const newLayout = Array(layout.length);
  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }
  return newLayout;
}

export function cloneLayoutItem(layoutItem) {
  return JSON.parse(JSON.stringify(layoutItem));
}

/**
* Given two layoutitems, check if they collide.
*
* @return {Boolean}   True if colliding.
*/
export function collides(l1, l2) {
  if (l1 === l2) return false; // same element
  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
  return true; // boxes overlap
}

/**
* Given a layout, compact it. This involves going down each y coordinate and removing gaps
* between items.
*
* @param  {Array} layout Layout.
* @param  {Boolean} verticalCompact Whether or not to compact the layout
*   vertically.
* @return {Array}       Compacted Layout.
*/
export function compact(layout, verticalCompact) {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We go through the items by row and column.
  const sorted = sortLayoutItemsByRowCol(layout);
  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i];

    if (!l.static) {
      // if (!l.static && !l.float) {
      l = compactItem(compareWith, l, verticalCompact);
      compareWith.push(l);
    }
    out[layout.indexOf(l)] = l;
    l.moved = false;
  }

  return out;
}

/**
* Compact an item in the layout.
*/
export function compactItem(compareWith, l, verticalCompact) {
  if (verticalCompact) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while ((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h;
  }
  return l;
}

/**
* Given a layout, make sure all elements fit within its bounds.
*
* @param  {Array} layout Layout array.
* @param  {Number} bounds Number of columns.
*/
export function correctBounds(layout, bounds = { cols: number }) {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) collidesWith.push(l);
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

/**
* Get a layout item by ID. Used so we can override later on if necessary.
*
* @param  {Array}  layout Layout array.
* @param  {String} id     ID
* @return {LayoutItem}    Item at ID.
*/
export function getLayoutItem(layout, id) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
}

/**
* Returns the first item this layout collides with.
* It doesn't appear to matter which order we approach this from, although
* perhaps that is the wrong thing to do.
*
* @param  {Object} layoutItem Layout item.
* @return {Object|undefined}  A colliding layout item, or undefined.
*/
export function getFirstCollision(layout, layoutItem) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

export function getAllCollisions(layout, layoutItem) {
  return layout.filter((l) => collides(l, layoutItem));
}

/**
* Get all static elements.
* @param  {Array} layout Array of layout objects.
* @return {Array}        Array of static layout items..
*/
export function getStatics(layout) {
  // return [];
  return layout.filter((l) => l.static);
}

export function moveElement(layout, l, x, y, isUserAction = false, preventCollision = false) {
  if (l.static) return layout;
  const oldX = l.x;
  const oldY = l.y;

  const movingUp = y && l.y > y;
  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;
  l.moved = true;

  // if (l.float) return layout;
  let sorted = sortLayoutItemsByRowCol(layout);
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);

  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    if (collision.moved) continue;

    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
      // layout = collision.float ? layout : moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }

  return layout;
}


export function moveElementAwayFromCollision(layout, collidesWith,
  itemToMove, isUserAction = false) {

  const preventCollision = false;
  if (isUserAction) {
    const fakeItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1',
    };
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y, preventCollision);
    }
  }

  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1, preventCollision);
}


export function perc(num) {
  return num * 100 + '%';
}

export function setTransform({ top, left, width, height }) {
  const translate = 'translate3d(' + left + 'px,' + top + 'px, 0)';
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: width + 'px',
    height: height + 'px',
    position: 'absolute',
  };
}

export function setTransformRtl({ top, right, width, height }) {
  const translate = 'translate3d(' + right * -1 + 'px,' + top + 'px, 0)';
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: width + 'px',
    height: height + 'px',
    position: 'absolute',
  };
}

export function setTopLeft({ top, left, width, height }) {
  return {
    top: top + 'px',
    left: left + 'px',
    width: width + 'px',
    height: height + 'px',
    position: 'absolute',
  };
}


export function setTopRight({ top, right, width, height }) {
  return {
    top: top + 'px',
    right: right + 'px',
    width: width + 'px',
    height: height + 'px',
    position: 'absolute',
  };
}

/**
* Get layout items sorted from top left to right and down.
*
* @return {Array} Array of layout objects.
* @return {Array}        Layout, sorted static items first.
*/
export function sortLayoutItemsByRowCol(layout) {
  return [].concat(layout).sort(function (a, b) {
    if (a.y === b.y && a.x === b.x) {
      return 0;
    }

    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }

    return -1;
  });
}

export function validateLayout(layout, n) {
  const contextName = n || 'Layout';
  const subProps = ['x', 'y', 'w', 'h'];
  const keyArr = [];
  if (!Array.isArray(layout)) throw new Error(contextName + ' must be an array!');
  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];
    // console.log(item.i, item.y, item);
    for (let j = 0; j < subProps.length; j++) {
      let s = item[subProps[j]];
      if (typeof s === 'undefined') {
        layout[i][subProps[j]] = 1;
        continue;
      }
      if (typeof s !== 'number') {
        throw new Error('VueGridLayout: ' + contextName + '[' + i + '].' + subProps[j] + ' must be a number!');
      }
    }

    if (item.i === undefined || item.i === null) {
      throw new Error('VueGridLayout: ' + contextName + '[' + i + '].i cannot be null!');
    }

    if (typeof item.i !== 'number' && typeof item.i !== 'string') {
      throw new Error('VueGridLayout: ' + contextName + '[' + i + '].i must be a string or number!');
    }

    if (keyArr.indexOf(item.i) >= 0) {
      throw new Error('VueGridLayout: ' + contextName + '[' + i + '].i must be unique!');
    }
    keyArr.push(item.i);

    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error('VueGridLayout: ' + contextName + '[' + i + '].static must be a boolean!');
    }
  }
}

export function autoBindHandlers(el, fns) {
  fns.forEach((key) => {
    el[key] = el[key].bind(el);
  });
}

/**
* Convert a JS object to CSS string. Similar to React's output of CSS.
* @param obj
* @returns {string}
*/
export function createMarkup(obj) {
  const keys = Object.keys(obj);
  if (!keys.length) return '';
  let i; const len = keys.length;
  let result = '';

  for (i = 0; i < len; i++) {
    const key = keys[i];
    const val = obj[key];
    result += hyphenate(key) + ':' + addPx(key, val) + ';';
  }

  return result;
}

export const IS_UNITLESS = {
  animationIterationCount: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridColumn: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  stopOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true,
};

export function addPx(name, value) {
  if (typeof value === 'number' && !IS_UNITLESS[name]) {
    return value + 'px';
  } else {
    return value;
  }
}

export const hyphenateRE = /([a-z\d])([A-Z])/g;

export function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

export function findItemInArray(array, property, value) {
  for (let i = 0; i < array.length; i++)
    if (array[i][property] === value)
      return true;

  return false;
}

export function findAndRemove(array, property, value) {
  array.forEach(function (result, index) {
    if (result[property] === value) {
      array.splice(index, 1);
    }
  });
}
