<template>
  <div id="demo" class="w-screen h-screen bg-gray-100">
    <div class="container h-full m-auto bg-white p-5 text-gray-500 text-center">
      <h3>Demo</h3>
      <div class="select-none py-5 text-sm">
        <span @click="add('left')">左边插入</span> |
        <span @click="add('centre')">中间插入</span> |
        <span @click="add('right')">右边插入</span>
        <div class="select-none py-5 text-sm">
          <span @click="toggle('left')">左边切换</span> |
          <span @click="toggle('centre')">中间切换</span> |
          <span @click="toggle('right')">右边切换</span> |
        </div>
        <idea-layout ref="layout" :layout.sync="layout" />
      </div>
    </div>
  </div>
</template>

<script>
import IdeaLayout from './IdeaLayout';
import { install } from './index';

import DemoInput from './DemoInput';
import Full from './Example/Full';
import Add from './Example/Add';

install(DemoInput);
install(Full);
install(Add);

export default {
  name: 'Demo',
  components: { IdeaLayout },
  data() {
    return {
      layout: {},
    };
  },
  mounted() {
    const t = this;
    const layout = {
      right: {
        size: 15,
        minSize: 10,
        maxSize: 40,
        items: [{ name: '右边', component: 'demo-input' }],
      },
      centre: {
        size: 50,
        minSize: 30,
        items: [
          {
            name: '中间',
            component: 'full',
            open: true,
            props: { el: this.$refs.layout },
          },
          {
            name: '动态插入折叠',
            component: 'add',
            open: true,
            on: {
              tap({ name, index }) {
                t.add(name, index);
              },
            },
          },
        ],
      },
      left: {
        maxSize: 60,
        items: [
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
    };
    this.layout = layout;
  },
  methods: {
    toggle(key) {
      this.$refs.layout.toggle(key);
    },
    add(key, index) {
      const item = {
        name: 'New ' + Number(new Date()),
        component: 'demo-input',
        open: true,
        props: { val: '新建' + Number(new Date()) },
      };
      if (index !== undefined) {
        this.layout[key]['items'].splice(index, 0, item);
      } else {
        this.layout[key]['items'].push(item);
      }
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
