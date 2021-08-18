<template>
  <div
    id="demo"
    class="w-screen h-screen bg-gray-100 overflow-hidden text-gray-500 text-center bg-gray-100"
  >
    <!-- <div class="container h-full m-auto text-gray-500 text-center bg-gray-100">
      <div class="select-none py-2 text-sm">
        <div class="">
          <span @click="saveLayout">保存布局</span> |
          <span @click="recoverLayout">恢复布局</span>
        </div>
        <div class="">
          <span @click="add('left')">左边插入</span> |
          <span @click="add('centre')">中间插入</span> |
          <span @click="add('right')">右边插入</span>
        </div>
        <div class="mb-2">
          <span @click="toggle('left')">左边切换</span> |
          <span @click="toggle('centre')">中间切换</span> |
          <span @click="toggle('right')">右边切换</span> |
          <span @click="toggle('bottom')">底部切换</span>
        </div> -->
    <layout ref="layout" :height="height" :width="width" :layout="layout" />
    <!-- </div> -->
    <!-- </div> -->
  </div>
</template>

<script>
import Layout from '../Layout';
import { install } from '../index';

install('full', () => import('./Full'));
install('other', () => import('./Other'));
install('function', () => import('./Function'));

export default {
  name: 'Demo',
  components: { Layout },
  data: () => ({
    layout: {},
    height: '100vh',
    width: '100vw',
  }),
  mounted() {
    const layout = {
      right: {
        size: 15,
        minSize: 10,
        maxSize: 50,
        items: [{ name: '右边-', component: 'other' }],
      },
      centre: {
        size: 30,
        minSize: 30,
        items: [
          {
            name: '-中 间-',
            component: 'full',
            open: true,
            props: { el: this.$refs.layout },
          },
        ],
      },
      bottom: {
        size: 20,
        riseHeight: 60,
        name: '底部',
        component: 'function',
      },
      left: {
        maxSize: 60,
        items: [
          {
            name: '左边 0',
            component: 'other',
            props: { val: '0' },
          },
          {
            name: '左边 1',
            component: 'other',
            open: true,
            props: { val: '左边 1' },
          },
        ],
      },
    };
    this.layout = layout;
    this.$refs.layout.loadLayout(layout);
  },
  methods: {},
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
