<template>
  <section
    :is="$props.tagname"
    class="ps-container"
    @ps-scroll-y="scrollHandle"
    @ps-scroll-x="scrollHandle"
    @ps-scroll-up="scrollHandle"
    @ps-scroll-down="scrollHandle"
    @ps-scroll-left="scrollHandle"
    @ps-scroll-right="scrollHandle"
    @ps-y-reach-start="scrollHandle"
    @ps-y-reach-end="scrollHandle"
    @ps-x-reach-start="scrollHandle"
    @ps-x-reach-end="scrollHandle"
  >
    <slot />
  </section>
</template>
<script>
import PerfectScrollbar from 'perfect-scrollbar';

export default {
  name: 'Scrollbar',
  props: {
    settings: {
      default: null,
    },
    swicher: {
      type: Boolean,
      default: true,
    },
    tagname: {
      type: String,
      default: 'section',
    },
  },
  data() {
    return {
      ps: null,
    };
  },
  watch: {
    swicher(val) {
      if (val && !this._ps_inited) {
        this.__init();
      }
      if (!val && this._ps_inited) {
        this.__uninit();
      }
    },
    settings: {
      deep: true,
      handler() {
        this.__uninit();
        this.__init();
      },
    },
    $route() {
      this.update();
    },
  },
  mounted() {
    // for support ssr
    if (!this.$isServer) {
      this.__init();
    }
  },
  updated() {
    this.$nextTick(this.update);
  },
  activated() {
    this.__init();
  },
  deactivated() {
    this.__uninit();
  },
  beforeDestroy() {
    this.__uninit();
  },
  methods: {
    scrollHandle(evt) {
      this.$emit(evt.type, evt);
    },
    update() {
      if (this.ps) {
        this.ps.update();
      }
    },
    __init() {
      if (this.swicher) {
        if (!this._ps_inited) {
          this._ps_inited = true;
          this.ps = new PerfectScrollbar(this.$el, this.settings);
        } else {
          this.ps.update();
        }
      }
    },
    __uninit() {
      if (this.ps) {
        this.ps.destroy();
        this.ps = null;
        this._ps_inited = false;
      }
    },
  },
};
</script>

<style lang="less">
@import '~perfect-scrollbar/css/perfect-scrollbar.css';
.ps-container {
  position: relative;
}
</style>
