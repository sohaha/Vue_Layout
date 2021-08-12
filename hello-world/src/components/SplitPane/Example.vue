<template>
  <div id="demo" class="w-screen h-screen bg-gray-100">
    <div class="container h-full m-auto bg-white p-5 text-gray-500 text-center">
      <h3>Demo</h3>
      <div class="select-none py-5 text-sm">
        <span @click="add('left')">左边插入</span> |
        <span @click="add('centre')">中间插入</span> |
        <span @click="add('right')">右边插入</span>
      </div>
      <layout ref="layout" :layout.sync="layout" />
    </div>
  </div>
</template>

<script>
import Layout from './Layout';

export default {
  name: 'Example',
  components: { Layout },
  data: () => ({
    layout: {
      right: [],
      centre: [{ name: '中间', component: 'example-input' }],
      left: [
        {
          name: '左边 0',
          key: 'key0',
          component: 'example-input',
          open: true,
          attr: { props: { val: '0' } },
        },
        {
          name: '左边 1',
          key: 'key1',
          component: 'example-input',
          attr: { props: { val: '1' } },
        },
        { name: '左边 2', key: 'key2', component: 'example-input' },
        { name: '左边 3', key: 'key3', component: 'example-input' },
      ],
    },
  }),
  methods: {
    toggle(key) {
      this.$refs.layout.toggle(key);
    },
    add(key) {
      this.layout[key].push({
        name: 'New ' + Number(new Date()),
        // name: 'New' + Number(new Date()),
        component: 'example-input',
        attrs: { val: 'new' },
      });
    },
  },
};
</script>

<style>
.v-pane {
  background: rgba(165, 42, 42, 0.199);
}
</style>
