<template>
  <div ref="item" class="panel-layout" :style="mergedStyle">
    <slot />
    <grid-item
      v-show="isDragging"
      class="panel-placeholder"
      :x="placeholder.x"
      :y="placeholder.y"
      :w="placeholder.w"
      :h="placeholder.h"
      :i="placeholder.i"
    />
  </div>
</template>
<script>
/* eslint-disable max-params */
/* eslint-disable max-nested-callbacks */

import Vue from 'vue';
import Item from './Item.vue';
import {
  bottom,
  cloneLayout,
  compact,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  validateLayout
} from './utils/utils';
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint
} from './utils/responsiveUtils';
import { addWindowEventListener, removeWindowEventListener } from './utils/DOM';

const elementResizeDetectorMaker = require('element-resize-detector');

export default {
  name: 'Layout',
  components: {
    GridItem: Item,
  },
  provide() {
    return {
      eventBus: null,
      layout: this,
    };
  },
  props: {
    autoSize: {
      type: Boolean,
      default: true,
    },
    colNum: {
      type: Number,
      default: 12,
    },
    rowHeight: {
      type: Number,
      default: 50,
    },
    maxRows: {
      type: Number,
      default: Infinity,
    },
    margin: {
      type: Array,
      default: function() {
        return [10, 10];
      },
    },
    isDraggable: {
      type: Boolean,
      default: true,
    },
    isResizable: {
      type: Boolean,
      default: true,
    },
    isMirrored: {
      type: Boolean,
      default: false,
    },
    useCssTransforms: {
      type: Boolean,
      default: true,
    },
    verticalCompact: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: Array,
      required: true,
    },
    responsive: {
      type: Boolean,
    },
    responsiveLayouts: {
      type: Object,
      default() {
        return {};
      },
    },
    breakpoints: {
      type: Object,
      default() {
        return { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
      },
    },
    cols: {
      type: Object,
      default() {
        return { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
      },
    },
    preventCollision: {
      type: Boolean,
      default: false,
    },
    useStyleCursor: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      width: null,
      mergedStyle: {},
      lastLayoutLength: 0,
      isDragging: false,
      placeholder: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        i: -1,
      },
      layouts: {}, // array to store all layouts from different breakpoints
      lastBreakpoint: null, // store last active breakpoint
      originalLayout: null, // store original Layout
    };
  },
  watch: {
    width(newval, oldval) {
      this.$nextTick(() => {
        this.eventBus.$emit('updateWidth', this.width);
        if (oldval === null) {
          this.$nextTick(() => {
            this.$emit('layout-ready', this.layout);
          });
        }
        this.updateHeight();
      });
    },
    layout: function() {
      this.layoutUpdate();
    },
    colNum: function(val) {
      this.eventBus.$emit('setColNum', val);
    },
    rowHeight: function() {
      this.eventBus.$emit('setRowHeight', this.rowHeight);
    },
    isDraggable: function() {
      this.eventBus.$emit('setDraggable', this.isDraggable);
    },
    isResizable: function() {
      this.eventBus.$emit('setResizable', this.isResizable);
    },
    responsive() {
      if (!this.responsive) {
        this.$emit('update:layout', this.originalLayout);
        this.eventBus.$emit('setColNum', this.colNum);
      }
      this.onWindowResize();
    },
    maxRows: function() {
      this.eventBus.$emit('setMaxRows', this.maxRows);
    },
    margin() {
      this.updateHeight();
    },
  },
  created() {
    this.resizeEventHandler = (eventType, i, x, y, h, w) => {
      this.resizeEvent(eventType, i, x, y, h, w);
    };

    this.dragEventHandler = (eventType, i, x, y, h, w) => {
      this.dragEvent(eventType, i, x, y, h, w);
    };

    this._provided.eventBus = new Vue();
    this.eventBus = this._provided.eventBus;
    this.eventBus.$on('resizeEvent', this.resizeEventHandler);
    this.eventBus.$on('dragEvent', this.dragEventHandler);
    this.$emit('layout-created', this.layout);
  },
  beforeDestroy() {
    this.eventBus.$off('resizeEvent', this.resizeEventHandler);
    this.eventBus.$off('dragEvent', this.dragEventHandler);
    this.eventBus.$destroy();
    removeWindowEventListener('resize', this.onWindowResize);
    if (this.erd) {
      this.erd.uninstall(this.$refs.item);
    }
  },
  beforeMount() {
    this.$emit('layout-before-mount', this.layout);
  },
  mounted() {
    this.$emit('layout-mounted', this.layout);
    this.$nextTick(() => {
      validateLayout(this.layout);
      this.originalLayout = this.layout;
      this.$nextTick(() => {
        this.onWindowResize();
        this.initResponsiveFeatures();
        addWindowEventListener('resize', this.onWindowResize);
        compact(this.layout, this.verticalCompact);
        this.$emit('layout-updated', this.layout);
        this.updateHeight();
        this.$nextTick(() => {
          this.erd = elementResizeDetectorMaker({
            strategy: 'scroll',
            // See https://github.com/wnr/element-resize-detector/issues/110 about callOnAdd.
            callOnAdd: false,
          });
          this.erd.listenTo(this.$refs.item, () => {
            this.onWindowResize();
          });
        });
      });
    });
  },
  methods: {
    layoutUpdate() {
      if (this.layout !== undefined && this.originalLayout !== null) {
        if (this.layout.length !== this.originalLayout.length) {
          const diff = this.findDifference(this.layout, this.originalLayout);
          if (diff.length > 0) {
            if (this.layout.length > this.originalLayout.length) {
              this.originalLayout = this.originalLayout.concat(diff);
            } else {
              this.originalLayout = this.originalLayout.filter(obj => {
                return !diff.some(obj2 => {
                  return obj.i === obj2.i;
                });
              });
            }
          }
          this.lastLayoutLength = this.layout.length;
          this.initResponsiveFeatures();
        }

        compact(this.layout, this.verticalCompact);
        this.eventBus.$emit('updateWidth', this.width);
        this.updateHeight();

        this.$emit('layout-updated', this.layout);
      }
    },
    updateHeight() {
      this.mergedStyle = {
        height: this.containerHeight(),
      };
    },
    onWindowResize() {
      if (
        this.$refs !== null &&
        this.$refs.item !== null &&
        this.$refs.item !== undefined
      ) {
        this.width = this.$refs.item.offsetWidth;
      }
      this.eventBus.$emit('resizeEvent');
    },
    containerHeight() {
      if (!this.autoSize) return;
      return (
        bottom(this.layout) * (this.rowHeight + this.margin[1]) +
        this.margin[1] +
        'px'
      );
    },
    dragEvent(eventName, id, x, y, h, w) {
      let l = getLayoutItem(this.layout, id);
      if (l === undefined || l === null) {
        l = { x: 0, y: 0 };
      }

      if (eventName === 'dragmove' || eventName === 'dragstart') {
        this.placeholder.i = id;
        this.placeholder.x = l.x;
        this.placeholder.y = l.y;
        this.placeholder.w = w;
        this.placeholder.h = h;
        this.$nextTick(() => {
          this.isDragging = true;
        });
        this.eventBus.$emit('updateWidth', this.width);
      } else {
        this.$nextTick(() => {
          this.isDragging = false;
        });
      }
      this.layout = moveElement(
        this.layout,
        l,
        x,
        y,
        true,
        this.preventCollision
      );
      compact(this.layout, this.verticalCompact);
      // if (!l.float) compact(this.layout, this.verticalCompact);
      this.eventBus.$emit('compact');
      this.updateHeight();
      if (eventName === 'dragend') this.$emit('layout-updated', this.layout);
    },
    resizeEvent(eventName, id, x, y, h, w) {
      let l = getLayoutItem(this.layout, id);
      if (l === undefined || l === null) {
        l = { h: 0, w: 0 };
      }

      let hasCollisions;
      if (this.preventCollision) {
        const collisions = getAllCollisions(this.layout, { ...l, w, h }).filter(
          layoutItem => layoutItem.i !== l.i
        );
        hasCollisions = collisions.length > 0;

        if (hasCollisions) {
          let leastX = Infinity;
          let leastY = Infinity;
          collisions.forEach(layoutItem => {
            if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
            if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
          });

          if (Number.isFinite(leastX)) l.w = leastX - l.x;
          if (Number.isFinite(leastY)) l.h = leastY - l.y;
        }
      }
      if (!hasCollisions) {
        l.w = w;
        l.h = h;
      }
      if (eventName === 'resizestart' || eventName === 'resizemove') {
        this.placeholder.i = id;
        this.placeholder.x = x;
        this.placeholder.y = y;
        this.placeholder.w = l.w;
        this.placeholder.h = l.h;
        this.$nextTick(() => {
          this.isDragging = true;
        });
        this.eventBus.$emit('updateWidth', this.width);
      } else {
        this.$nextTick(() => {
          this.isDragging = false;
        });
      }
      if (this.responsive) this.responsiveGridLayout();
      compact(this.layout, this.verticalCompact);
      this.eventBus.$emit('compact');
      this.updateHeight();
      if (eventName === 'resizeend') this.$emit('layout-updated', this.layout);
    },
    responsiveGridLayout() {
      const newBreakpoint = getBreakpointFromWidth(
        this.breakpoints,
        this.width
      );
      const newCols = getColsFromBreakpoint(newBreakpoint, this.cols);
      if (this.lastBreakpoint !== null && !this.layouts[this.lastBreakpoint])
        this.layouts[this.lastBreakpoint] = cloneLayout(this.layout);

      // console.log(newBreakpoint, newCols);
      const layout = findOrGenerateResponsiveLayout(
        this.originalLayout,
        this.layouts,
        this.breakpoints,
        newBreakpoint,
        this.lastBreakpoint,
        newCols,
        this.verticalCompact
      );
      this.layouts[newBreakpoint] = layout;
      if (this.lastBreakpoint !== newBreakpoint) {
        this.$emit('breakpoint-changed', newBreakpoint, layout);
      }
      this.$emit('update:layout', layout);
      this.lastBreakpoint = newBreakpoint;
      this.eventBus.$emit(
        'setColNum',
        getColsFromBreakpoint(newBreakpoint, this.cols)
      );
    },
    initResponsiveFeatures() {
      this.layouts = { ...this.responsiveLayouts };
    },
    findDifference(layout, originalLayout) {
      const uniqueResultOne = layout.filter(function(obj) {
        return !originalLayout.some(function(obj2) {
          return obj.i === obj2.i;
        });
      });
      const uniqueResultTwo = originalLayout.filter(function(obj) {
        return !layout.some(function(obj2) {
          return obj.i === obj2.i;
        });
      });
      return uniqueResultOne.concat(uniqueResultTwo);
    },
  },
};
</script>

<style lang="less">
.panel-layout {
  width: 100%;
  position: relative;
  transition: height 200ms ease;
  overflow: hidden;

  // ::-webkit-scrollbar {
  //   width: 0px;
  //   height: 5px;
  // }

  // ::-webkit-scrollbar {
  //   width: 0px;
  //   height: 6px;
  // }
  // ::-webkit-scrollbar-track {
  //   background-color: #fafafa;
  // }
  // ::-webkit-scrollbar-thumb {
  //   background-color: #cccccc;
  // }

  // ::-webkit-scrollbar-thumb:hover {
  //   background-color: #999999;
  // }

  // ::-webkit-scrollbar-thumb:active {
  //   background-color: #cccccc;
  // }
}
</style>
