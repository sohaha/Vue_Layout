<template>
  <div id="app">
    <example />
    <example2 />
  </div>
</template>

<script>
import Example2 from './components/Panes/Demo';
import Example from './components/SplitPane/Example';

export default {
  name: 'App',
  components: {
    Example,
    Example2,
  },
};
</script>

<style></style>
