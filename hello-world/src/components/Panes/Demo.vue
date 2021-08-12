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
import { install } from './index';

import DemoInput from './DemoInput';

install(DemoInput);

export default {
  name: 'Demo',
  components: { IdeaLayout },
  data: () => ({
    layout: {
      right: [{ name: '右边', component: 'demo-input' }],
      centre: [{ name: '中间', component: 'demo-input', open: true }],
      left: [
        {
          name: '左边 0',
          component: 'demo-input',
          props: { val: '0' },
        },
        {
          name: '左边 1',
          component: 'demo-input',
          open: true,
          props: { val: '1' },
        },
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
        name: 'New ' + Number(new Date()),
        component: 'demo-input',
        attrs: { val: 'new' },
      });
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .item__bottom {
  background: rgba(255, 0, 0, 0.116);
}
/deep/ .item__content {
  background: rgba(144, 136, 224, 0.116);
}
/deep/ .item__left {
  background: rgba(144, 136, 224, 0.116);
}
/deep/ .item__centre {
  background: rgba(199, 187, 75, 0.116);
}
/deep/ .item__right {
  background: rgba(233, 218, 178, 0.116);
}
</style>
