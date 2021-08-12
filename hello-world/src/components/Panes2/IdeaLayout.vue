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
    remove(key, index) {
      const layout = this.layout;
      layout[key].splice(index, 1);
      this.updateLayout(layout);
    },
    updateLayout(layout) {
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
        default:
          if (this.layout[name] && this.layout[name].length > 0) {
            const itemChild = [];
            const keys = [];
            let itemParent = {};
            for (let index = 0; index < this.layout[name].length; index++) {
              const v = this.layout[name][index];
              let key = `${v.component}|${v.name || ''}`;
              if (keys.includes(key)) {
                console.warn(
                  `${v.name} is not the only unpredictable problem that can occur`
                );
                key = key + Number(new Date());
              }
              keys.push(key);
              const item = h(
                'item',
                {
                  key,
                },
                [
                  h(
                    'div',
                    {
                      class: ['item-title'],
                      on: {
                        click() {
                          // e.preventDefault();
                          const target = item.componentInstance;
                          console.log(target.getCurrentSize(target));
                          // t.requestUpdate({ target: t, size: '22px' });
                          console.log(
                            '收起来当前应该改成 22',
                            itemParent.elm.offsetHeight,
                            item.componentInstance.requestUpdate({
                              target: item.componentInstance,
                              size: (22 / itemParent.elm.offsetHeight) * 100,
                              last: target.$el.offsetHeight,
                            }),
                            this
                          );
                        },
                      },
                    },
                    [
                      v.name,
                      h(
                        'span',
                        {
                          class: ['itme__delete'],
                          on: {
                            click(target) {
                              target.stopPropagation();
                              t.remove(name, index);
                            },
                          },
                        },
                        ['X']
                      ),
                    ]
                  ),
                  h(v.component, { ...v.attr }),
                ]
              );
              itemChild.push(item);
            }
            itemParent = h(
              'panes',
              {
                props: {
                  horizontal: true,
                },
              },
              itemChild
            );
            child.push(itemParent);
          } else {
            return '';
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
        ref: 'panes',
        style: { height: '500px' },
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
.item-title {
  background: #d8d4c4;
  font-size: 12px;
  padding: 2px;
  height: 22px;
  position: relative;
  .itme__delete {
    position: absolute;
    right: 10px;
    cursor: pointer;
    font-weight: bold;
    visibility: hidden;
    padding: 0 10px;
  }
  &:hover {
    .itme__delete {
      visibility: visible;
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
