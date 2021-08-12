<template>
  <div class="w-2/3 m-auto">
    <input v-model="data" class="w-full px-2 border border-red-300" >
  </div>
</template>

<script>
export default {
  name: 'DemoInput',
  props: {
    val: {
      type: String,
      default: '',
    },
  },
  data() {
    return { data: this.val };
  },
    watch:{data(v){

    }},
  methods: {},
};
</script>

<style scoped></style>
