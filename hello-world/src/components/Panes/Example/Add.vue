<template>
  <div class="p-5 cursor-pointer">
    <button class="border m-2 px-2 py-1" @click="tap('left', 0)">
      左边第一个位置插入
    </button>
    <button class="border m-2 px-2 py-1" @click="tap('left', 3)">
      左边第四个位置插入
    </button>
    <button class="border m-2 px-2 py-1" @click="tap('right', 1)">
      右边第二个位置插入
    </button>
  </div>
</template>

<script>
export default {
  name: 'Add',
  inject: ['addBlock', 'clickPane'],
  props: {},
  data: () => ({}),
  computed: {},
  methods: {
    tap(name, index) {
      const item = {
        name: 'New ' + Number(new Date()),
        component: 'other',
        open: true,
        props: { val: '新建' + Number(new Date()) },
      };
      this.addBlock(name, item, index);
    },
  },
};
</script>

<style></style>
