<template>
  <div class="p-5">
    <div class="cursor-pointer" @click="tap">{{ text }}</div>
  </div>
</template>

<script>
export default {
  name: 'Full',
  inject: ['toggleFull'],
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
      this.toggleFull();
    },
  },
};
</script>

<style></style>
