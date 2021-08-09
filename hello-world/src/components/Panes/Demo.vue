<template>
  <div class="w-screen h-screen bg-gray-100">
    <div class="container h-full m-auto bg-white p-5 text-gray-500 text-center">
      <h3>Demo</h3>
      <div class="select-none py-5 text-sm">
        <span @click="add('left')">左边插入</span> |
        <span @click="add('right')">右边插入</span>
        <!-- <span @click="toggle('bottom')">切换底部</span> |
        <span @click="toggle('left')">切换左边</span> |
        <span @click="toggle('right')">切换右边</span> | -->
      </div>
      <idea-layout ref="layout" :layout.sync="layout" />
    </div>
  </div>
</template>

<script>
import IdeaLayout from './IdeaLayout';
export default {
  name: 'Demo',
  components: { IdeaLayout },
  data: () => ({
    layout: {
      right: [],
      left: [
        { name: '左边 0', component: 'demo-input', attrs: { val: '0' } },
        { name: '左边 1', component: 'demo-input', attrs: { val: '1' } },
        { name: '左边 2', component: 'demo-input' },
        { name: '左边 3', component: 'demo-input' },
      ],
    },
  }),
  methods: {
    toggle(key) {
      this.$refs.layout.toggle(key);
    },
    add(key) {
      this.layout[key].push({
        name: 'New',
        component: 'demo-input',
        attrs: { val: 'new' },
      });
    },
  },
};
</script>

<style scoped></style>
