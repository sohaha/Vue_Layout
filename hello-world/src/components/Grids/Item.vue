<template>
  <div ref="item" :class="classObj" :style="style">
    <scrollbar class="scrollbar" :settings="settings">
      <div><slot /></div>
    </scrollbar>
    <span
      v-if="resizableAndNotStatic"
      ref="handle"
      :class="resizableHandleClass"
      @click="resizableRtl(false)"
    />
  </div>
</template>

<script>
import {
  setTopLeft,
  setTopRight,
  setTransformRtl,
  setTransform
} from './utils/utils';
import { getControlPosition, createCoreData } from './utils/draggableUtils';
import { getColsFromBreakpoint } from './utils/responsiveUtils';
import { getDocumentDir } from './utils/DOM';
import '@interactjs/auto-start';
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';
import '@interactjs/auto-scroll';
import '@interactjs/dev-tools';
import interact from '@interactjs/interact';
import Scrollbar from '@/components/Scrollbar';

export default {
  name: 'Item',
  components: { Scrollbar },
  inject: ['eventBus', 'layout'],
  props: {
    isDraggable: {
      type: Boolean,
      required: false,
      default: null,
    },
    isResizable: {
      type: Boolean,
      required: false,
      default: null,
    },
    //  是否浮层
    float: {
      type: Boolean,
      default: false,
    },
    static: {
      type: Boolean,
      default: false,
    },
    minH: {
      type: Number,
      default: 1,
    },
    minW: {
      type: Number,
      default: 1,
    },
    maxH: {
      type: Number,
      required: false,
      default: Infinity,
    },
    maxW: {
      type: Number,
      required: false,
      default: Infinity,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    w: {
      type: Number,
      default: 2,
    },
    h: {
      type: Number,
      default: 2,
    },
    i: {
      required: true,
    },
    dragIgnoreFrom: {
      type: String,
      required: false,
      default: 'a, button',
    },
    dragAllowFrom: {
      type: String,
      required: false,
      default: null,
    },
    resizeIgnoreFrom: {
      type: String,
      required: false,
      default: 'a, button',
    },
    // 是否保持纵横比
    preserveAspectRatio: {
      type: Boolean,
      required: false,
      default: false,
    },
    dragOption: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    resizeOption: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      settings: {
        suppressScrollY: false,
        suppressScrollX: false,
        wheelPropagation: false,
      },
      cols: 1,
      containerWidth: 100,
      rowHeight: 30,
      margin: [10, 10],
      maxRows: Infinity,
      draggable: null,
      resizable: null,
      useCssTransforms: true,
      useStyleCursor: true,
      isDragging: false,
      dragging: null,
      isResizing: false,
      resizing: null,
      lastX: NaN,
      lastY: NaN,
      lastW: NaN,
      lastH: NaN,
      style: {},
      rtl: false,
      resizableRtlState: false,
      dragEventSet: false,
      resizeEventSet: false,
      previousW: null,
      previousH: null,
      previousX: null,
      previousY: null,
      innerX: this.x,
      innerY: this.y,
      innerW: this.w,
      innerH: this.h,
    };
  },
  computed: {
    classObj() {
      return {
        'panel-item': true,
        resizable: this.resizableAndNotStatic,
        static: this.static,
        float: this.float,
        resizing: this.isResizing,
        'draggable-dragging': this.isDragging,
        cssTransforms: this.useCssTransforms,
        'render-rtl': this.renderRtl,
        'disable-userselect': this.isDragging,
        'no-touch': this.isAndroid && this.draggableOrResizableAndNotStatic,
      };
    },
    resizableAndNotStatic() {
      return this.resizable && !this.static;
    },
    draggableOrResizableAndNotStatic() {
      return (this.draggable || this.resizable) && !this.static;
    },
    isAndroid() {
      return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
    },
    renderRtl() {
      return this.layout.isMirrored ? !this.rtl : this.rtl;
    },
    resizableHandleClass() {
      if (this.renderRtl) {
        return 'resizable-handle rtl-resizable-handle';
      } else {
        return 'resizable-handle';
      }
    },
  },
  watch: {
    isDraggable() {
      this.draggable = this.isDraggable;
    },
    static() {
      this.tryMakeDraggable();
      this.tryMakeResizable();
    },
    draggable() {
      this.tryMakeDraggable();
    },
    isResizable() {
      this.resizable = this.isResizable;
    },
    resizable() {
      this.tryMakeResizable();
    },
    rowHeight() {
      this.createStyle();
      this.emitContainerResized();
    },
    cols() {
      this.tryMakeResizable();
      this.createStyle();
      this.emitContainerResized();
    },
    containerWidth() {
      this.tryMakeResizable();
      this.createStyle();
      this.emitContainerResized();
    },
    x(newVal) {
      this.innerX = newVal;
      this.createStyle();
    },
    y(newVal) {
      this.innerY = newVal;
      this.createStyle();
    },
    h(newVal) {
      this.innerH = newVal;
      this.createStyle();
    },
    w(newVal) {
      this.innerW = newVal;
      this.createStyle();
    },
    renderRtl() {
      this.tryMakeResizable();
      this.createStyle();
      this.resizableRtlState = this.renderRtl;
    },
    minH() {
      this.tryMakeResizable();
    },
    maxH() {
      this.tryMakeResizable();
    },
    minW() {
      this.tryMakeResizable();
    },
    maxW() {
      this.tryMakeResizable();
    },
    '$parent.margin'(margin) {
      if (
        !margin ||
        (parseInt(margin[0], 10) === parseInt(this.margin[0], 10) &&
          parseInt(margin[1], 10) === parseInt(this.margin[1], 10))
      ) {
        return;
      }
      this.margin = margin.map(m => Number(m));
      this.createStyle();
      this.emitContainerResized();
    },
  },
  created() {
    this.updateWidthHandler = width => {
      this.updateWidth(width);
    };

    this.compactHandler = layout => {
      this.compact(layout);
    };

    this.setDraggableHandler = isDraggable => {
      if (this.isDraggable === null) {
        this.draggable = isDraggable;
      }
    };

    this.setResizableHandler = isResizable => {
      if (this.isResizable === null) {
        this.resizable = isResizable;
      }
    };

    this.setRowHeightHandler = rowHeight => {
      this.rowHeight = rowHeight;
    };

    this.setMaxRowsHandler = maxRows => {
      this.maxRows = maxRows;
    };

    this.directionchangeHandler = () => {
      this.rtl = getDocumentDir() === 'rtl';
      this.compact();
    };

    this.setColNum = colNum => {
      this.cols = parseInt(colNum, 10);
    };

    this.eventBus.$on('updateWidth', this.updateWidthHandler);
    this.eventBus.$on('compact', this.compactHandler);
    this.eventBus.$on('setDraggable', this.setDraggableHandler);
    this.eventBus.$on('setResizable', this.setResizableHandler);
    this.eventBus.$on('setRowHeight', this.setRowHeightHandler);
    this.eventBus.$on('setMaxRows', this.setMaxRowsHandler);
    this.eventBus.$on('directionchange', this.directionchangeHandler);
    this.eventBus.$on('setColNum', this.setColNum);

    this.rtl = getDocumentDir() === 'rtl';
  },
  beforeDestroy() {
    this.eventBus.$off('updateWidth', this.updateWidthHandler);
    this.eventBus.$off('compact', this.compactHandler);
    this.eventBus.$off('setDraggable', this.setDraggableHandler);
    this.eventBus.$off('setResizable', this.setResizableHandler);
    this.eventBus.$off('setRowHeight', this.setRowHeightHandler);
    this.eventBus.$off('setMaxRows', this.setMaxRowsHandler);
    this.eventBus.$off('directionchange', this.directionchangeHandler);
    this.eventBus.$off('setColNum', this.setColNum);
    if (this.interactObj) {
      this.interactObj.unset();
    }
  },
  mounted() {
    if (this.layout.responsive && this.layout.lastBreakpoint) {
      this.cols = getColsFromBreakpoint(
        this.layout.lastBreakpoint,
        this.layout.cols
      );
    } else {
      this.cols = this.layout.colNum;
    }
    this.rowHeight = this.layout.rowHeight;
    this.containerWidth = this.layout.width !== null ? this.layout.width : 100;
    this.margin =
      this.layout.margin !== undefined ? this.layout.margin : [10, 10];
    this.maxRows = this.layout.maxRows;

    if (this.isDraggable === null) {
      this.draggable = this.layout.isDraggable;
    } else {
      this.draggable = this.isDraggable;
    }
    if (this.isResizable === null) {
      this.resizable = this.layout.isResizable;
    } else {
      this.resizable = this.isResizable;
    }
    this.useCssTransforms = this.layout.useCssTransforms;
    this.useStyleCursor = this.layout.useStyleCursor;
    this.createStyle();
  },
  methods: {
    createStyle() {
      if (this.x + this.w > this.cols) {
        this.innerX = 0;
        this.innerW = this.w > this.cols ? this.cols : this.w;
      } else {
        this.innerX = this.x;
        this.innerW = this.w;
      }
      const pos = this.calcPosition({
        x: this.innerX,
        y: this.innerY,
        w: this.innerW,
        h: this.innerH,
      });

      if (this.isDragging) {
        pos.top = this.dragging.top;
        //                    Add rtl support
        if (this.renderRtl) {
          pos.right = this.dragging.left;
        } else {
          pos.left = this.dragging.left;
        }
      }
      if (this.isResizing) {
        pos.width = this.resizing.width;
        pos.height = this.resizing.height;
      }

      let style;
      // CSS Transforms support (default)
      if (this.useCssTransforms) {
        //                    Add rtl support
        if (this.renderRtl) {
          style = setTransformRtl(pos);
        } else {
          style = setTransform(pos);
        }
      } else {
        // top,left (slow)
        //                    Add rtl support
        if (this.renderRtl) {
          style = setTopRight(pos);
        } else {
          style = setTopLeft(pos);
        }
      }
      this.style = style;
    },
    emitContainerResized() {
      // this.style has width and height with trailing 'px'. The
      // resized event is without them
      const styleProps = {};
      for (const prop of ['width', 'height']) {
        const val = this.style[prop];
        const matches = val.match(/^(\d+)px$/);
        if (!matches) return;
        styleProps[prop] = matches[1];
      }
      this.$emit(
        'container-resized',
        this.i,
        this.h,
        this.w,
        styleProps.height,
        styleProps.width
      );
    },
    handleResize(event) {
      if (this.static) return;
      const position = getControlPosition(event);
      if (position === null) return;
      const { x, y } = position;
      const newSize = { width: 0, height: 0 };
      let pos;
      switch (event.type) {
        case 'resizestart': {
          this.previousW = this.innerW;
          this.previousH = this.innerH;
          pos = this.calcPosition({
            x: this.innerX,
            y: this.innerY,
            w: this.innerW,
            h: this.innerH,
          });
          newSize.width = pos.width;
          newSize.height = pos.height;
          this.resizing = newSize;
          this.isResizing = true;
          break;
        }
        case 'resizemove': {
          const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
          if (this.renderRtl) {
            newSize.width = this.resizing.width - coreEvent.deltaX;
          } else {
            newSize.width = this.resizing.width + coreEvent.deltaX;
          }
          newSize.height = this.resizing.height + coreEvent.deltaY;
          this.resizing = newSize;
          break;
        }
        case 'resizeend': {
          pos = this.calcPosition({
            x: this.innerX,
            y: this.innerY,
            w: this.innerW,
            h: this.innerH,
          });
          newSize.width = pos.width;
          newSize.height = pos.height;
          this.resizing = null;
          this.isResizing = false;
          break;
        }
      }

      pos = this.calcWH(newSize.height, newSize.width);
      if (pos.w < this.minW) {
        pos.w = this.minW;
      }
      if (pos.w > this.maxW) {
        pos.w = this.maxW;
      }
      if (pos.h < this.minH) {
        pos.h = this.minH;
      }
      if (pos.h > this.maxH) {
        pos.h = this.maxH;
      }

      if (pos.h < 1) {
        pos.h = 1;
      }
      if (pos.w < 1) {
        pos.w = 1;
      }

      this.lastW = x;
      this.lastH = y;

      if (this.innerW !== pos.w || this.innerH !== pos.h) {
        this.$emit(
          'resize',
          this.i,
          pos.h,
          pos.w,
          newSize.height,
          newSize.width
        );
      }
      if (
        event.type === 'resizeend' &&
        (this.previousW !== this.innerW || this.previousH !== this.innerH)
      ) {
        this.$emit(
          'resized',
          this.i,
          pos.h,
          pos.w,
          newSize.height,
          newSize.width
        );
      }
      this.eventBus.$emit(
        'resizeEvent',
        event.type,
        this.i,
        this.innerX,
        this.innerY,
        pos.h,
        pos.w
      );
    },
    resizableRtl(e) {
      this.resizableRtlState = e;
      console.log(e);
    },
    handleDrag(event) {
      if (this.static) return;
      if (this.isResizing) return;

      const position = getControlPosition(event);

      // Get the current drag point from the event. This is used as the offset.
      if (position === null) return; // not possible but satisfies flow
      const { x, y } = position;

      // let shouldUpdate = false;
      const newPosition = { top: 0, left: 0 };
      switch (event.type) {
        case 'dragstart': {
          this.previousX = this.innerX;
          this.previousY = this.innerY;

          const parentRect = event.target.offsetParent.getBoundingClientRect();
          const clientRect = event.target.getBoundingClientRect();
          if (this.renderRtl) {
            newPosition.left = (clientRect.right - parentRect.right) * -1;
          } else {
            newPosition.left = clientRect.left - parentRect.left;
          }
          newPosition.top = clientRect.top - parentRect.top;
          this.dragging = newPosition;
          this.isDragging = true;
          break;
        }
        case 'dragend': {
          if (!this.isDragging) return;
          const parentRect = event.target.offsetParent.getBoundingClientRect();
          const clientRect = event.target.getBoundingClientRect();
          //                        Add rtl support
          if (this.renderRtl) {
            newPosition.left = (clientRect.right - parentRect.right) * -1;
          } else {
            newPosition.left = clientRect.left - parentRect.left;
          }
          newPosition.top = clientRect.top - parentRect.top;
          //                        console.log("### drag end => " + JSON.stringify(newPosition));
          //                        console.log("### DROP: " + JSON.stringify(newPosition));
          this.dragging = null;
          this.isDragging = false;
          // shouldUpdate = true;
          break;
        }
        case 'dragmove': {
          const coreEvent = createCoreData(this.lastX, this.lastY, x, y);
          //                        Add rtl support
          if (this.renderRtl) {
            newPosition.left = this.dragging.left - coreEvent.deltaX;
          } else {
            newPosition.left = this.dragging.left + coreEvent.deltaX;
          }
          newPosition.top = this.dragging.top + coreEvent.deltaY;
          //                        console.log("### drag => " + event.type + ", x=" + x + ", y=" + y);
          //                        console.log("### drag => " + event.type + ", deltaX=" + coreEvent.deltaX + ", deltaY=" + coreEvent.deltaY);
          //                        console.log("### drag end => " + JSON.stringify(newPosition));
          this.dragging = newPosition;
          break;
        }
      }

      // Get new XY
      let pos;
      if (this.renderRtl) {
        pos = this.calcXY(newPosition.top, newPosition.left);
      } else {
        pos = this.calcXY(newPosition.top, newPosition.left);
      }

      this.lastX = x;
      this.lastY = y;

      if (this.innerX !== pos.x || this.innerY !== pos.y) {
        this.$emit('move', this.i, pos.x, pos.y);
      }
      if (
        event.type === 'dragend' &&
        (this.previousX !== this.innerX || this.previousY !== this.innerY)
      ) {
        this.$emit('moved', this.i, pos.x, pos.y);
      }
      this.eventBus.$emit(
        'dragEvent',
        event.type,
        this.i,
        pos.x,
        pos.y,
        this.innerH,
        this.innerW
      );
    },
    calcPosition({ x, y, w, h }) {
      const colWidth = this.calcColWidth();
      // add rtl support
      let out;
      if (this.renderRtl) {
        out = {
          right: Math.round(colWidth * x + (x + 1) * this.margin[0]),
          top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
          // 0 * Infinity === NaN, which causes problems with resize constriants;
          // Fix this if it occurs.
          // Note we do it here rather than later because Math.round(Infinity) causes deopt
          width:
            w === Infinity
              ? w
              : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
          height:
            h === Infinity
              ? h
              : Math.round(
                  this.rowHeight * h + Math.max(0, h - 1) * this.margin[1]
                ),
        };
      } else {
        out = {
          left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
          top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
          // 0 * Infinity === NaN, which causes problems with resize constriants;
          // Fix this if it occurs.
          // Note we do it here rather than later because Math.round(Infinity) causes deopt
          width:
            w === Infinity
              ? w
              : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
          height:
            h === Infinity
              ? h
              : Math.round(
                  this.rowHeight * h + Math.max(0, h - 1) * this.margin[1]
                ),
        };
      }

      return out;
    },
    /**
     * Translate x and y coordinates from pixels to grid units.
     * @param  {Number} top  Top position (relative to parent) in pixels.
     * @param  {Number} left Left position (relative to parent) in pixels.
     * @return {Object} x and y in grid units.
     */
    // TODO check if this function needs change in order to support rtl.
    calcXY(top, left) {
      const colWidth = this.calcColWidth();

      // left = colWidth * x + margin * (x + 1)
      // l = cx + m(x+1)
      // l = cx + mx + m
      // l - m = cx + mx
      // l - m = x(c + m)
      // (l - m) / (c + m) = x
      // x = (left - margin) / (coldWidth + margin)
      let x = Math.round((left - this.margin[0]) / (colWidth + this.margin[0]));
      let y = Math.round(
        (top - this.margin[1]) / (this.rowHeight + this.margin[1])
      );

      // Capping
      x = Math.max(Math.min(x, this.cols - this.innerW), 0);
      y = Math.max(Math.min(y, this.maxRows - this.innerH), 0);

      return { x, y };
    },
    calcColWidth() {
      const colWidth =
        (this.containerWidth - this.margin[0] * (this.cols + 1)) / this.cols;
      return colWidth;
    },
    calcWH(height, width, autoSizeFlag = false) {
      const colWidth = this.calcColWidth();
      let w = Math.round(
        (width + this.margin[0]) / (colWidth + this.margin[0])
      );
      let h = 0;
      if (!autoSizeFlag) {
        h = Math.round(
          (height + this.margin[1]) / (this.rowHeight + this.margin[1])
        );
      } else {
        h = Math.ceil(
          (height + this.margin[1]) / (this.rowHeight + this.margin[1])
        );
      }

      w = Math.max(Math.min(w, this.cols - this.innerX), 0);
      h = Math.max(Math.min(h, this.maxRows - this.innerY), 0);
      return { w, h };
    },
    updateWidth(width, colNum) {
      this.containerWidth = width;
      if (colNum !== undefined && colNum !== null) {
        this.cols = colNum;
      }
    },
    compact() {
      this.createStyle();
    },
    tryMakeDraggable() {
      if (this.interactObj === null || this.interactObj === undefined) {
        this.interactObj = interact(this.$refs.item);
        if (!this.useStyleCursor) {
          this.interactObj.styleCursor(false);
        }
      }
      if (this.draggable && !this.static) {
        const opts = {
          ignoreFrom: this.dragIgnoreFrom,
          allowFrom: this.dragAllowFrom,
          ...this.dragOption,
        };
        // 设置为可拖拽
        this.interactObj.draggable(opts);
        if (!this.dragEventSet) {
          this.dragEventSet = true;
          this.interactObj.on('dragstart dragmove dragend', event => {
            this.handleDrag(event);
          });
        }
      } else {
        this.interactObj.draggable({
          enabled: false,
        });
      }
    },
    tryMakeResizable() {
      if (this.interactObj === null || this.interactObj === undefined) {
        this.interactObj = interact(this.$refs.item);
        if (!this.useStyleCursor) {
          this.interactObj.styleCursor(false);
        }
      }
      if (this.resizable && !this.static) {
        const maximum = this.calcPosition({
          x: 0,
          y: 0,
          w: this.maxW,
          h: this.maxH,
        });
        const minimum = this.calcPosition({
          x: 0,
          y: 0,
          w: this.minW,
          h: this.minH,
        });
        const opts = {
          edges: {
            left: true,
            // right: '.' + this.resizableHandleClass.trim().replace(' ', '.'),
            right: true,
            bottom: true,
            // bottom: '.' + this.resizableHandleClass.trim().replace(' ', '.'),
            top: false,
          },
          ignoreFrom: this.resizeIgnoreFrom,
          restrictSize: {
            min: {
              height: minimum.height,
              width: minimum.width,
            },
            max: {
              height: maximum.height,
              width: maximum.width,
            },
            ...this.resizeOption,
          },
        };

        if (this.preserveAspectRatio) {
          opts.modifiers = [
            interact.modifiers.aspectRatio({
              ratio: 'preserve',
            }),
          ];
        }

        this.interactObj.resizable(opts);
        if (!this.resizeEventSet) {
          this.resizeEventSet = true;
          this.interactObj.on('resizestart resizemove resizeend', event => {
            // console.log(event);
            this.handleResize(event);
          });
        }
      } else {
        this.interactObj.resizable({
          enabled: false,
        });
      }
    },
    autoSize() {
      this.previousW = this.innerW;
      this.previousH = this.innerH;

      const newSize = this.$slots.default[0].elm.getBoundingClientRect();
      const pos = this.calcWH(newSize.height, newSize.width, true);
      if (pos.w < this.minW) {
        pos.w = this.minW;
      }
      if (pos.w > this.maxW) {
        pos.w = this.maxW;
      }
      if (pos.h < this.minH) {
        pos.h = this.minH;
      }
      if (pos.h > this.maxH) {
        pos.h = this.maxH;
      }

      if (pos.h < 1) {
        pos.h = 1;
      }
      if (pos.w < 1) {
        pos.w = 1;
      }
      if (this.innerW !== pos.w || this.innerH !== pos.h) {
        this.$emit(
          'resize',
          this.i,
          pos.h,
          pos.w,
          newSize.height,
          newSize.width
        );
      }
      if (this.previousW !== pos.w || this.previousH !== pos.h) {
        this.$emit(
          'resized',
          this.i,
          pos.h,
          pos.w,
          newSize.height,
          newSize.width
        );
        this.eventBus.$emit(
          'resizeEvent',
          'resizeend',
          this.i,
          this.innerX,
          this.innerY,
          pos.h,
          pos.w
        );
      }
    },
  },
};
</script>
<style>
.scrollbar {
  height: 100%;
}
.panel-item {
  touch-action: none;
  transition: all 200ms ease;
  transition-property: left, top, right;
}

.panel-item.no-touch {
  -ms-touch-action: none;
  touch-action: none;
}

.panel-item.cssTransforms {
  transition-property: transform;
  left: 0;
  right: auto;
}

.panel-item.cssTransforms.render-rtl {
  left: auto;
  right: 0;
}

.panel-item.resizing {
  opacity: 0.6;
  z-index: 3;
}

.panel-item.draggable-dragging {
  transition: none;
  z-index: 3;
}

.panel-item.panel-placeholder {
  background: #f5a1a1;
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.panel-item > .resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  padding: 0 3px 3px 0;
  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=')
    no-repeat bottom right;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}

.panel-item > .rtl-resizable-handle {
  bottom: 0;
  left: 0;
  background-position: bottom right;
  cursor: sw-resize;
  transform: rotateY(180deg);
}

.panel-item.disable-userselect {
  user-select: none;
}

.panel-item.float {
  z-index: 1;
}
</style>
