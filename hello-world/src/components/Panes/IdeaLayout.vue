<template>
  <panes ref="panes" horizontal style="height: 500px">
    <item>
      <panes>
        <item
          v-if="state.left"
          :size="left.length === 0 ? 0 : 20"
          min-size="10"
          class="bg-gray-30"
        >
          <panes horizontal>
            <item
              v-for="(v, k) in left"
              :key="k"
              mxin-size="10px"
              :class="['bg-blue-' + k + '00', 'border']"
            >
              <div class="item-title">
                {{ v.name }}
                <span class="itme__delete" @click="remove('left', k)">X</span>
              </div>
              <component v-bind="v.attrs" :is="v.component" />
              <button class="text-sm px-2">
                删除
              </button>
            </item>
          </panes>
        </item>
        <item class="bg-green-100" rtl>
          中间
        </item>
        <item v-if="state.right" :size="right.length === 0 ? 0 : 20">
          <panes horizontal>
            <item
              v-for="(v, k) in right"
              :key="k"
              mxin-size="10px"
              :class="['bg-gray-' + k + '00', 'border']"
            >
              <div class="item-title">
                {{ v.name }}
                <span class="itme__delete" @click="remove('right', k)">X</span>
              </div>
              <component v-bind="v.attrs" :is="v.component" />
            </item>
          </panes>
        </item>
      </panes>
    </item>
    <item :size="state.bottom" class="bg-red-100">
      <div>底部</div>
      <demo-input
    /></item>
  </panes>
</template>

<script>
import Item from './Item';
import Panes from './Panes';
import DemoInput from './DemoInput';

export default {
  name: 'IdeaLayout',
  components: { Panes, Item, DemoInput },
  props: {
    layout: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    state: {
      bottom: 13,
      right: true,
      left: true,
    },
    history: {},
  }),
  computed: {
    left() {
      return this.layout['left'] || [];
    },
    right() {
      return this.layout['right'] || [];
    },
  },
  methods: {
    remove(key, index) {
      const layout = this.layout;
      layout[key].splice(index, 1);
      this.updateLayout(layout);
    },
    updateLayout(layout) {
      console.log(layout);
      this.$emit('update:layout', layout);
    },
    add(key) {},
    toggle(key) {
      if (typeof this.state[key] !== 'number') {
        return;
      }
      if (this.history[key]) {
        this.state[key] = this.history[key];
        this.history[key] = 0;
        return;
      }
      this.history[key] = this.state[key];
      this.state[key] = 0;
      console.log(this.$refs.panes);
      this.$refs.panes.updatePaneComponents();
    },
  },
};
</script>

<style lang="less">
.item-title {
  .itme__delete {
    display: none;
  }
  &:hover {
    .itme__delete {
      display: inline-block;
    }
  }
}
.splitpanes__splitter {
  position: relative;
}
.splitpanes__splitter:hover {
  background: rgba(0, 0, 0, 0.05);
}
.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 0;
  z-index: 1;
}
.splitpanes__splitter:hover:before {
  opacity: 1;
}
.splitpanes--vertical > .splitpanes__splitter:before {
  left: -2px;
  right: -2px;
  height: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -2px;
  bottom: -2px;
  width: 100%;
}
</style>
