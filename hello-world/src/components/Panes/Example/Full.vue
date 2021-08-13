<template>
  <div class="p-5 cursor-pointer" @click="tap">
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'Full',
  props: {
    el: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data: () => ({
    full: false,
  }),
  computed: {
    text() {
      return !this.full ? '点击面板最大化' : '点击面板恢复';
    },
  },
  methods: {
    tap() {
      this.full = !this.full;
      const el = this.el.$el;
      if (this.full) {
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.position = 'absolute';
      } else {
        el.style.width = '';
        el.style.height = '600px';
        el.style.position = '';
      }

      el.style.left = 0;
      el.style.top = 0;
      el.style.background = '#fff';
    },
  },
};
</script>

<style></style>
