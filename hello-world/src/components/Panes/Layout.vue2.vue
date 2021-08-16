<script>
import Item from './Item';
import Panes from './Panes';
import Accordion from './Accordion';
import Vue from 'vue';

export default {
  name: 'Layout',
  components: { Panes, Item, Accordion },
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
  mounted() {
    this.loadLayout(this.layout);
  },
  methods: {
    get(removeAttr = ['on', 'props']) {
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
      if (this.getLayout(name).length === 0) {
        return;
      }
      console.log(name, this.history[name], this.history[name].hidden);
      Vue.set(this.history[name], 'hidden', !this.history[name].hidden);
    },
    remove(name, index) {
      this.getLayout(name).items.splice(index, 1);
    },
    updateLayout(layout) {
      this.$emit('update:layout', layout);
    },
    getLayout(name) {
      return this.history[name] || { items: [] };
    },
  },
  // eslint-disable-next-line complexity
  render(h) {
    const t = this;

    const contentChildren = [];
    for (const name of ['left', 'centre', 'right']) {
      const layout = this.history[name] || [];
      const items = layout['items'];
      if (layout.hidden === undefined) {
        layout.hidden = false;
      }
      const size = layout.size;
      const minSize = layout.minSize || 0;
      const maxSize = layout.maxSize || 100;
      const child = [];
      if (items && items.length > 0) {
        for (const index in items) {
          if (Object.hasOwnProperty.call(items, index)) {
            const v = items[index];
            if (!v._key) {
              const key = v.key || v.name || Number(new Date());
              this.history[name]['items'][index]._key = `${v.component}|${key}`;
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
      }

      if (!layout.hidden) {
        console.log(name, size === undefined ? null : size);
        contentChildren.push(
          h(
            'item',
            {
              class: {
                [`item__${name}`]: true,
              },
              props: {
                size: size === undefined ? null : size,
                maxSize: maxSize,
                minSize: minSize,
              },
            },
            child
          )
        );
      }
    }
    console.log(contentChildren.length);

    const contentInfo = this.history['content'] || { items: [] };
    const content = h(
      'item',
      {
        class: {
          [`item__content`]: true,
        },
        props: {
          size: contentInfo.size === undefined ? null : contentInfo.size,
          maxSize: contentInfo.maxSize || 100,
          minSize: contentInfo.minSize || 0,
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
          contentChildren
        ),
      ]
    );

    const bottomInfo = this.history['bottom'] || {};
    const bottom = h(
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
      [h(bottomInfo.component)]
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
          resize(e) {
            console.log(e);
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
