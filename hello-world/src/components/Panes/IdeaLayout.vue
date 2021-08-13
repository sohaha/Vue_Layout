<script>
import Item from './Item';
import Panes from './Panes';
// import Vue from 'vue';
import DemoInput from './DemoInput';
import Accordion from './Accordion';
import Vue from 'vue';
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
    layoutSize: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    state: {
      right: true,
      left: true,
    },
    history: {},
  }),
  computed: {},
  watch: {},
  methods: {
    toggle(name) {
      this.state[name] = !this.state[name];
    },
    remove(name, index) {
      const layout = this.getLayout(name);
      layout.items.splice(index, 1);
    },
    updateLayout(layout) {
      this.$emit('update:layout', layout);
    },
    getLayout(name) {
      return this.layout[name] || {};
    },
  },
  render(h) {
    const t = this;
    const createItem = name => {
      const layout = this.getLayout(name);
      const items = layout['items'];
      let state = this.state[name];
      if (state === undefined) {
        state = true;
        Vue.set(this.state, name, state);
      }
      let size = layout.size;
      const minSize = layout.minSize || 0;
      const maxSize = layout.maxSize || 100;
      const child = [];
      switch (name) {
        case 'bottom':
          size = 10;
          return h(
            'item',
            {
              class: {
                [`item__${name}`]: true,
              },
              props: {
                size: size,
                maxSize: maxSize,
                minSize: minSize,
              },
            },
            ['底部']
          );
        case 'content':
          child.push(
            h(
              'panes',
              {
                props: {},
              },
              [createItem('left'), createItem('centre'), createItem('right')]
            )
          );
          break;
        default: {
          if (items && items.length > 0) {
            for (const index in items) {
              if (Object.hasOwnProperty.call(items, index)) {
                const v = items[index];
                if (!v._key) {
                  const key = v.key || v.name || Number(new Date());
                  this.layout[name]['items'][
                    index
                  ]._key = `${v.component}|${key}`;
                }
              }
            }

            const accordion = h('accordion', {
              props: {
                items,
              },
              on: {
                remove(index) {
                  t.remove(name, index);
                },
              },
            });
            child.push(accordion);
          } else {
            return '';
          }
        }
      }

      return state
        ? h(
            'item',
            {
              class: {
                [`item__${name}`]: true,
              },
              props: {
                size: size,
                maxSize: maxSize,
                minSize: minSize,
              },
            },
            child
          )
        : '';
    };
    const layout = h(
      'panes',
      {
        class: 'layout',
        ref: 'panes',
        style: {
          height: '600px',
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
.panes--horizontal .panes__splitter {
  min-height: 0;
}
.panes--vertical .panes__splitter {
  min-width: 0;
}

.panes__splitter:hover {
  background: rgba(0, 0, 0, 0.05);
}

.panes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 0;
  z-index: 1;
}

.panes__splitter:hover:before {
  opacity: 1;
}

.panes--vertical > .panes__splitter:before {
  left: -2px;
  right: -2px;
  height: 100%;
}
.panes--horizontal > .panes__splitter:before {
  top: -2px;
  bottom: -2px;
  width: 100%;
}

// .panes__pane {
//   overflow: auto;
// }

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
