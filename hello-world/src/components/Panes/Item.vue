<template>
  <div
    class="splitpanes__pane"
    :style="style"
    @click="onPaneClick($event, _uid)"
  >
    <slot />
  </div>
</template>

<script>
import { toSize } from './utils';

export default {
  name: 'Item',
  inject: [
    'requestUpdate',
    'getCurrentSize',
    'onPaneAdd',
    'onPaneRemove',
    'onPaneClick',
  ],
  props: {
    size: { type: [Number, String], default: null },
    minSize: { type: [Number, String], default: 0 },
    maxSize: { type: [Number, String], default: 100 },
  },
  data: () => ({
    style: {},
  }),
  // computed: {
  //   sizeNumber() {
  //     return this.size || this.size === 0
  //       ? toSize(this.$parent, this.size)
  //       : null;
  //   },
  //   minSizeNumber() {
  //     return toSize(this.$parent, this.minSize);
  //   },
  //   maxSizeNumber() {
  //     // console.log(this.$parent);
  //     console.log(this.getCurrentSize().$el);
  //     return toSize(this.$parent, this.maxSize);
  //   },
  // },
  // watch: {
  //   sizeNumber(size) {
  //     this.requestUpdate({ target: this, size });
  //   },
  //   minSizeNumber(min) {
  //     this.requestUpdate({ target: this, min });
  //   },
  //   maxSizeNumber(max) {
  //     this.requestUpdate({ target: this, max });
  //   },
  // },
  mounted() {
    // console.log(this.$parent.$el);
    // this.$nextTick(() => {
    //   const size = toSize(this.$parent, this.minSize);
    //   if (size > 0) console.error(size, this.$parent, this.$parent.size);
    // });
    this.onPaneAdd(this);
  },
  beforeDestroy() {
    this.onPaneRemove(this);
  },
  methods: {
    getSize() {
      const size = this.$el[
        this.$parent.horizontal ? 'offsetHeight' : 'offsetWwidth'
      ];
      return toSize(this.$parent, size);
    },
    update(style) {
      this.style = style;
    },
  },
};
</script>
