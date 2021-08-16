<template>
  <div class="py-5">
    <div>测试组件</div>
    <input v-model="data" class="w-2/3 m-auto px-2 border border-red-300" >
  </div>
</template>

<script>
export default {
  name: 'Other',
  props: {
    val: {
      type: String,
      default: '',
    },
  },
  data() {
    return { data: this.val };
  },
  methods: {},
};
</script>

<style scoped></style>
