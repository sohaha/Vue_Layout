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
    lastSize: 0,
  }),
  computed: {
    sizeNumber() {
      return this.size || this.size === 0 ? parseFloat(this.size) : null;
    },
    minSizeNumber() {
      return parseFloat(this.minSize);
    },
    maxSizeNumber() {
      return parseFloat(this.maxSize);
    },
  },
  watch: {
    sizeNumber(size) {
      this.requestUpdate({ target: this, size });
    },
    minSizeNumber(min) {
      this.requestUpdate({ target: this, min });
    },
    maxSizeNumber(max) {
      this.requestUpdate({ target: this, max });
    },
  },
  mounted() {
    this.onPaneAdd(this);
  },
  beforeDestroy() {
    this.onPaneRemove(this);
  },
  methods: {
    update(style) {
      console.log(style, this);
      this.style = style;
    },
  },
};
</script>
