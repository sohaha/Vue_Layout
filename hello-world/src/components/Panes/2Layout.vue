<script>
import Item from './Item';
import Panes from './Panes';
// import Vue from 'vue';
import Accordion from './Accordion';
import Shrink from './Shrink';
import Bottom from './Bottom';
import Vue from 'vue';
// import { toSize } from './utils';
// Vue.Use(DemoInput);
export default {
  name: 'Layout',
  components: { Panes, Item, Accordion, Shrink, Bottom },
  props: {
    layout: {
      type: Object,
      default: () => ({}),
    },
    height: {
      type: String,
      default: '600px',
    },
    width: {
      type: String,
      default: '100%',
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
  // watch: {
  //   layout: {
  //     handler(layout) {

  //     },
  //     immediate: true,
  //     deep: true,
  //   },
  // },
  mounted() {
    this.loadLayout(this.layout);
  },
  methods: {
    getLayout2(removeAttr = ['props', 'on']) {
      const history = {};
      for (const key in this.history) {
        if (Object.hasOwnProperty.call(this.history, key)) {
          const l = this.history[key];
          const items = [];
          for (const key in l.items) {
            if (Object.hasOwnProperty.call(l.items, key)) {
              const item = {};
              Object.entries(l.items[key]).forEach(([key, value]) => {
                if (
                  key.slice(0, 1) !== '_' &&
                  !(removeAttr && removeAttr.includes(key))
                ) {
                  item[key] = value;
                }
              });
              items.push(item);
            }
          }
          history[key] = { ...l };
          history[key].items = items;
        }
      }
      return history;
    },
    addBlock(name, item, index) {
      if (index !== undefined) {
        this.history[name].splice(index, 0, item);
      } else {
        this.history[name]['items'].push(item);
      }
    },
    loadLayout(layout) {
      const history = {};
      for (const key in layout) {
        if (Object.hasOwnProperty.call(layout, key)) {
          const l = layout[key];
          const items = [];
          for (const key in l.items) {
            if (Object.hasOwnProperty.call(l.items, key)) {
              items.push({ ...l.items[key] });
            }
          }
          history[key] = { ...l };
          history[key].items = items;
        }
      }
      this.history = history;
    },
    toggle(name) {
      // this.state[name] = !this.state[name];
      // Vue.set(this.state, name, !this.state[name]);
      Vue.set(this.history[name], 'hidden', !this.history[name].hidden);
    },
    remove(name, index) {
      const layout = this.history[name];
      layout.items.splice(index, 1);
    },
    updateLayout(layout) {
      this.$emit('update:layout', layout);
    },
  },
  render(h) {
    const t = this;
    const createItem = name => {
      const layout = this.history[name] || {};
      const items = layout['items'];
      let state = layout['hidden'];
      if (state === undefined) {
        state = true;
        Vue.set(layout, 'hidden', state);
      }
      const size = layout.size;
      const minSize = layout.minSize || 0;
      const maxSize = layout.maxSize || 100;
      const child = [];
      switch (name) {
        default: {
          if (items && items.length > 0) {
            for (const index in items) {
              if (Object.hasOwnProperty.call(items, index)) {
                const v = items[index];
                if (!v._key) {
                  const key = v.key || v.name || Number(new Date());
                  this.history[name]['items'][
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
        : ['left', 'right'].includes(name)
        ? ''
        : '';
    };

    const bottomInfo = this.history['bottom'] || {};
    const bottom = !bottomInfo.hidden
      ? h(
          'item',
          {
            class: {
              [`item__bottom`]: true,
            },
            props: {
              size: bottomInfo.component ? bottomInfo.size : 0,
              maxSize: bottomInfo.maxSize || 100,
              minSize: bottomInfo.minSize || 0,
            },
          },
          [
            h(
              'Bottom',
              {
                props: {
                  name: bottomInfo.name,
                  riseHeight: bottomInfo.riseHeight,
                },
              },
              [h(bottomInfo.component)]
            ),
          ]
        )
      : '';

    const contentInfo = this.history['content'] || {};
    if (contentInfo.size === undefined) {
      this.history['content'] = {};
    }

    const content = h(
      'item',
      {
        class: {
          [`item__content`]: true,
        },
        props: {
          // size: this.history['content'].size,
          // maxSize: 100,
          // minSize: 0,
        },
      },
      [
        h(
          'panes',
          {
            props: {},
            on: {
              resize(e) {
                // console.log(e);
              },
            },
          },
          [createItem('left'), createItem('centre'), createItem('right')]
        ),
      ]
    );

    const layout = h(
      'panes',
      {
        class: 'layout',
        ref: 'panes',
        style: {
          height: this.height,
          width: this.width,
        },
        on: {
          resize(panes) {
            const sort = ['content', 'bottom'];
            panes.forEach((pane, index) => {
              const name = sort[index];
              if (name) {
                t.history[name].size = pane.size;
              }
            });
            console.log(panes);
          },
        },
        props: {
          horizontal: true,
        },
      },
      [content, bottom]
    );
    return layout;
  },
};
</script>

<style lang="less">
.panes--horizontal {
  .panes__splitter {
    min-height: 0;
  }
  > .panes__splitter:before {
    top: -2px;
    bottom: -2px;
    width: 100%;
  }
}
.panes--vertical {
  .panes__splitter {
    min-width: 0;
  }
  > .panes__splitter:before {
    left: -2px;
    right: -2px;
    height: 100%;
  }
}

.panes__splitter {
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    transition: opacity 0.4s;
    background-color: rgba(0, 0, 0, 0.05);
    opacity: 0;
    z-index: 1;
  }
  &:hover:before {
    opacity: 1;
  }
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
