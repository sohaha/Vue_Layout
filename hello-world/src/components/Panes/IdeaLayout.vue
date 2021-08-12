<script>
import Item from './Item';
import Panes from './Panes';
// import Vue from 'vue';
import DemoInput from './DemoInput';
import Accordion from './Accordion';
// import { toSize } from './utils';
// Vue.Use(DemoInput);
export default {
  name: 'IdeaLayout',
  components: { Panes, Item, DemoInput, Accordion },
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
      const r = this.layout['right'] || [];
      if (r.length === 0 && this.$refs.right) {
        console.log('删除', this.$refs.right);
        // this.$refs.right && this.$refs.right.onPaneRemove(this.$refs.right);
      }
      return r;
    },
  },
  watch: {},
  methods: {
    remove(name, index) {
      const layout = this.layout;
      layout[name].splice(index, 1);
      this.updateLayout(layout);
    },
    updateLayout(layout) {
      this.$emit('update:layout', layout);
    },
  },
  render(h) {
    const t = this;
    const createItem = name => {
      const child = [];
      switch (name) {
        case 'bottom':
          break;
        case 'content':
          child.push(
            h('panes', {}, [
              createItem('left'),
              createItem('centre'),
              createItem('right'),
            ])
          );
          break;
        default: {
          const layout = this.layout[name] || [];
          if (layout && layout.length > 0) {
            for (const index in layout) {
              if (Object.hasOwnProperty.call(layout, index)) {
                const v = this.layout[name][index];
                if (!layout._key) {
                  const key = layout.key || v.name || Number(new Date());
                  this.layout[name][index]._key = `${v.component}|${key}`;
                }
              }
            }

            const accordion = h('accordion', {
              props: {
                items: this.layout[name],
              },
              on: {
                delete(index) {
                  t.remove(name, index);
                  console.log(index);
                },
              },
            });
            child.push(accordion);
          } else {
            return '';
          }
        }
      }

      return h(
        'item',
        {
          class: {
            [`item__${name}`]: true,
          },
        },
        child
      );
    };
    const layout = h(
      'panes',
      {
        class: 'layout',
        ref: 'panes',
        style: {
          height: '600px',
          // width: '500px',
        },
        props: {
          horizontal: true,
        },
      },
      [createItem('content'), createItem('bottom')]
    );
    return layout;
  },
};
</script>

<style lang="less">
.splitpanes--horizontal .splitpanes__splitter {
  min-height: 0;
}
.splitpanes--vertical .splitpanes__splitter {
  min-width: 0;
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

.splitpanes__pane {
  overflow: auto;
}
.layout {
  position: relative;
  box-shadow: 0 0 1px;

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: #fafafa;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #cccccc;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #999999;
  }

  ::-webkit-scrollbar-thumb:active {
    background-color: #cccccc;
  }
}
</style>
