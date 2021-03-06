<script>
import Item from './Item';
import Panes from './Panes';
import Accordion from './Accordion';
import Shrink from './Shrink';
import Bottom from './Bottom';
import { padItem, toSize } from './utils';
import '@interactjs/auto-start';
import '@interactjs/actions/drag';
import '@interactjs/actions/drop';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';
import interact from '@interactjs/interact';

export default {
  name: 'Layout',
  components: { Panes, Item, Accordion, Shrink, Bottom },
  provide() {
    return {
      addBlock: this.addBlock,
      removeBlock: this.removeBlock,
      getLayout: this.getLayout,
      loadLayout: this.loadLayout,
      togglePane: this.togglePane,
      toggleFull: this.toggleFull,
      layoutRef: this.layoutRef,
    };
  },
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
    full: false,
    history: {},
    bind: {},
    widthPX: 0,
    heightPX: 0,
    maxIndex: 1000, // todo 后期通过排序优先掉该属性
  }),
  computed: {
    emptyLayout() {
      return Object.keys(this.history).length === 0;
    },
  },
  beforeDestroy() {
    this.release();
  },
  mounted() {
    this.loadLayout(this.layout);

    setTimeout(() => {
      console.log(
        toSize(this.$refs.contentPanes, 200),
        this.$refs.contentPanes.$el.clientWidth
      );
    }, 1222);
  },
  methods: {
    layoutRef() {
      return this;
    },
    init() {
      setTimeout(() => {
        for (const name in this.bind) {
          if (Object.hasOwnProperty.call(this.bind, name)) {
            const obj = interact(this.$refs[name].$el);
            this.bind[name] = obj;
          }
        }
      }, 22);
    },
    release() {
      for (const name in this.bind) {
        if (Object.hasOwnProperty.call(this.bind, name)) {
          if (!this.bind[name]) {
            continue;
          }
          this.bind[name].unset();
          this.bind[name] = null;
        }
      }
    },
    getLayout(removeAttr = ['on', 'props']) {
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
          if (items.length) history[key].items = items;
        }
      }
      return history;
    },
    addBlock(name, item, index) {
      const exist = typeof this.history[name] === 'object';
      if (!exist) {
        console.warn('There is no defined groups');
        return;
      }
      if (index !== undefined) {
        this.history[name]['items'].splice(index, 0, padItem(item));
      } else {
        this.history[name]['items'].push(padItem(item));
      }
    },
    toggleFull() {
      this.full = !this.full;
      const el = this.$el;
      if (this.full) {
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.position = 'absolute';
      } else {
        el.style.width = '';
        el.style.height = '600px';
        el.style.position = '';
      }

      el.style.left = 0;
      el.style.top = 0;
      el.style.background = '#fff';
    },
    loadLayout(layout) {
      this.release();
      this.history = {};
      const history = {};
      for (const key in layout) {
        if (Object.hasOwnProperty.call(layout, key)) {
          const l = layout[key];
          const items = [];
          for (const key in l.items) {
            if (Object.hasOwnProperty.call(l.items, key)) {
              items.push(padItem(l.items[key]));
            }
          }
          history[key] = { ...l };
          history[key].items = items;
        }
      }
      this.$nextTick(() => {
        this.history = history;
        setTimeout(() => {
          this.init();
          this.$refs.contentPanes.initSize();
        });
      });
    },
    togglePane(name) {
      this.$set(this.history[name], 'hidden', !this.history[name].hidden);
      setTimeout(() => {
        this.$refs.contentPanes.initSize();
      });
    },
    toggleBottom() {
      this.$set(this.history['bottom'], 'size', '10');
    },
    removeBlock(name, index) {
      const layout = this.history[name];
      layout.items.splice(index, 1);
    },
    updateLayout(layout) {
      this.$emit('update:layout', layout);
    },
    saveSize(sort, panes) {
      panes.forEach((pane, index) => {
        const name = sort[index];
        if (name) {
          this.history[name].size = pane.size;
        }
      });
    },
    createItem(h, name) {
      const t = this;
      const layout = this.history[name] || {};
      const items = layout['items'];
      let state = layout['hidden'];
      if (state === undefined) {
        state = false;
        this.$set(layout, 'hidden', state);
      }
      const size = layout.size;
      const minSize = layout.minSize || 0;
      const maxSize = layout.maxSize || 100;
      const child = [];
      const cacheKeys = [];
      switch (name) {
        default: {
          if (items && items.length > 0) {
            for (const index in items) {
              if (Object.hasOwnProperty.call(items, index)) {
                const v = items[index];
                let key = `${v.component}|${v.key ||
                  v.name ||
                  Number(new Date())}`;
                if (!v._key) {
                  // eslint-disable-next-line max-depth
                  if (cacheKeys.includes(key)) {
                    key = key + Number(new Date());
                  }
                  this.history[name]['items'][index]._key = key;
                } else if (cacheKeys.includes(v._key)) {
                  this.history[name]['items'][index]._key =
                    v._key + Number(new Date());
                }
                cacheKeys.push(v._key);
              }
            }

            const accordion = h('accordion', {
              props: {
                items,
              },
              on: {
                remove(index) {
                  t.removeBlock(name, index);
                },
              },
            });
            child.push(accordion);
          } else {
            return '';
          }
        }
      }
      if (this.bind[name] === undefined) {
        this.bind[name] = null;
      }
      return !state
        ? h(
            'item',
            {
              ref: name,
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
    },
  },
  render(h) {
    const t = this;
    if (this.emptyLayout) return '';
    const bottomInfo = this.history['bottom'] || {};
    const bottom =
      bottomInfo.component && !bottomInfo.hidden
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

    const contentPanes = h(
      'panes',
      {
        ref: 'contentPanes',
        props: {},
        on: {
          resize(panes) {
            t.saveSize(['left', 'centre', 'right'], panes);
          },
        },
      },
      [
        this.createItem(h, 'left'),
        this.createItem(h, 'centre'),
        this.createItem(h, 'right'),
      ]
    );

    const content = h(
      'item',
      {
        class: {
          [`item__content`]: true,
        },
        props: {
          size: bottomInfo.size ? 100 - bottomInfo.size : null,
        },
      },
      [contentPanes]
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
            t.saveSize(['', 'bottom'], panes);
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
