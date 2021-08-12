<template>
  <div id="demo" class="w-screen h-screen bg-gray-100">
    <div class="container h-full m-auto bg-white p-5 text-gray-500 text-center">
      <h3>Demo</h3>
      <div class="select-none py-5 text-sm">
        <span @click="add('left')">左边插入</span> |
        <span @click="add('centre')">中间插入</span> |
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
      centre: [{ name: '中间', component: 'demo-input' }],
      left: [
        {
          name: '左边 0',
          key: 'key0',
          component: 'demo-input',
          attr: { props: { val: '0' } },
        },
        {
          name: '左边 1',
          key: 'key1',
          component: 'demo-input',
          attr: { props: { val: '1' } },
        },
        { name: '左边 2', key: 'key2', component: 'demo-input' },
        { name: '左边 3', key: 'key3', component: 'demo-input' },
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
        component: 'demo-input',
        attrs: { val: 'new' },
      });
    },
  },
};
</script>

<style lang="less" scoped>
// @colorArr: #374151, #6b7280, #9ca3af, #d1d5db, #e5e7eb, #f3f4f6;
// @len: length(@colorArr);
// .Loop(@index) when(@index<@len) {
//   .splitpanes__pane:nth-child(@{index}n) {
//     background: extract(@colorArr, @index);
//   }
//   .Loop(@index+1);
// }

/deep/ .item__bottom {
  background: rgba(255, 0, 0, 0.116);
}
/deep/ .item__content {
  background: rgba(144, 136, 224, 0.116);
}
/deep/ .item__left {
  background: rgba(144, 136, 224, 0.116);
  // .splitpanes__pane:nth-child(1n) {
  //   background: #9ca3af;
  // }
  // .splitpanes__pane:nth-child(2n) {
  //   background: #e5e7eb;
  // }
}
/deep/ .item__centre {
  background: rgba(199, 187, 75, 0.116);
}
/deep/ .item__right {
  background: rgba(233, 218, 178, 0.116);
}
// /deep/ .splitpanes__pane {
//   border: 1px solid;
// }
</style>
