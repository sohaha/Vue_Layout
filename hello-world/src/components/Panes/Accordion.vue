<script>
import Vue from 'vue';
import interact from '@interactjs/interact';
import { createSvg, svgs } from './utils';

export default {
  name: 'Accordion',
  inject: ['layoutRef'],
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data: () => ({
    // todo 后期通过排序优先掉该属性
    maxIndex: 100,
  }),
  watch: {
    items() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.items.forEach(item => {
      if (!item._bindBoard) return;
      item._bindBoard.unset();
      item._bindBoard = null;
    });
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.items.forEach((_, index) => {
          this.bindBoard(index);
        });
      });
    },
    layoutSize() {
      const el = this.layoutRef().$el;
      return { width: el.clientWidth, height: el.clientHeight };
    },
    bindBoard(index) {
      if (this.items[index]._bindBoard) {
        return;
      }
      const t = this;
      const name = 'board_' + index;
      this.items[index]._bindBoard = true;
      setTimeout(() => {
        const el = this.$refs[name];
        const board = el;
        const interactObj = interact(board);
        let x;
        let y;
        const item = t.items[index];
        interactObj.draggable({
          preventDefault: 'always',
          allowFrom: '.accotdion--title',
          enabled: t.items[index].detach,
          listeners: {
            start(event) {
              x = item.x || 0;
              y = item.y || 0;
              if (item.zIndex <= t.maxIndex) {
                item.zIndex = t.maxIndex + 1;
              }
            },
            move(event) {
              x = (parseFloat(x) || 0) + event.dx;
              y = (parseFloat(y) || 0) + event.dy;
              event.target.style.transform = `translate(${x}px, ${y}px)`;
            },
            end(event) {
              item.x = x;
              item.y = y;
              t.maxIndex = item.zIndex;
            },
          },
        });

        interactObj.resizable({
          ...this.resizableOptions(index),
          allowFrom: '.accotdion--board',
          listeners: {
            start(event) {
              x = item.x || 0;
              y = item.y || 0;
            },
            move(event) {
              event.stopPropagation();
              const v = { height: `${event.rect.height}px` };
              if (item.detach) {
                x = (parseFloat(x) || 0) + event.deltaRect.left;
                y = (parseFloat(y) || 0) + event.deltaRect.top;
                v['width'] = `${event.rect.width}px`;
                v['transform'] = `translate(${x}px, ${y}px)`;
              }
              Object.assign(event.target.style, v);
            },
            end(event) {
              item.x = x;
              item.y = y;
              if (event.rect.height <= 22) {
                item.open = false;
              } else {
                item.open = true;
                if (item.detach) {
                  item.height = board.offsetHeight + 'px';
                  item.width = board.offsetWidth + 'px';
                } else {
                  item.size = board.offsetHeight + 'px';
                }
              }
            },
          },
        });

        this.items[index]._bindBoard = interactObj;
        this.initArrt(board, index);
      }, 10);
    },
    initArrt(board, index) {
      const { x, y, detach } = this.items[index];
      if ((x !== null || y !== null) && detach) {
        Object.assign(board.style, {
          transform: `translate(${x || 0}px, ${y || 0}px)`,
        });
      }
    },
    boardClass(index) {
      return {
        board: true,
        open: this.items[index].open,
        full: this.items[index].full,
        detach: this.items[index].detach,
      };
    },
    movePlace(index, place) {
      const item = this.items[index];
      const len = this.items.length;
      const next = Number(index) + Number(place);
      if (next > len || next < 0) {
        return;
      }
      const tmpItem = this.items[next];
      this.$set(this.items, next, item);
      this.$set(this.items, index, tmpItem);
    },
    detachStyle(index) {
      const {
        detach,
        width,
        height,
        open,
        size,
        zIndex,
        full,
        x,
        y,
      } = this.items[index];
      const style = {
        width,
        height: open ? height : '22px',
        zIndex: full ? this.maxIndex + 1 : zIndex,
        transform: `translate(${x || 0}px, ${y || 0}px)`,
      };
      if (!detach) {
        style.width = 'auto';
        style.transform = 'none';
        style.height = open ? size || 'auto' : '22px';
      }
      return style;
    },
    resizableOptions(index) {
      const options = {
        edges: { bottom: true, top: false, left: false, right: false },
        modifiers: [],
      };
      if (this.items[index].detach) {
        options.edges = { bottom: true, top: false, left: true, right: true };
        options.modifiers = [
          interact.modifiers.restrictSize({
            min: { width: 50, height: 26 },
            // max: { ...this.layoutSize() },
          }),
        ];
      }
      return options;
    },
    full(index) {
      const full = !this.items[index].full;
      Vue.set(this.items[index], 'full', full);
      if (full) {
        Vue.set(this.items[index], 'open', true);
      }
    },
    detach(index) {
      const detach = !this.items[index].detach;
      Vue.set(this.items[index], 'detach', detach);
      const board = this.items[index]._bindBoard;
      if (detach) {
        Vue.set(this.items[index], 'open', true);
      }
      board.resizable({
        ...this.resizableOptions(index),
      });
      board.options.drag.enabled = detach;
    },
    remove(index) {
      this.$emit('remove', index);
    },
    toggle(index) {
      if (this.items[index].full) return;
      Vue.set(this.items[index], 'open', !this.items[index].open);
      if (this.items[index].height === '0px') {
        this.items[index].height = null;
      }
    },
  },
  render(h) {
    const items = [];
    const t = this;
    const len = Object.keys(this.items).length - 1;
    for (const index in this.items) {
      if (Object.hasOwnProperty.call(this.items, index)) {
        const item = this.items[index];
        const clickToggle = event => {
          event.stopPropagation();
          t.toggle(index);
        };
        const upOrDown =
          item.full || item.detach
            ? []
            : [
                index === '0'
                  ? ''
                  : h(
                      'span',
                      {
                        class: 'accotdion--up',
                        on: {
                          click(event) {
                            event.stopPropagation();
                            t.movePlace(index, -1);
                          },
                        },
                      },
                      [createSvg(h, svgs.up)]
                    ),
                Number(index) === len
                  ? ''
                  : h(
                      'span',
                      {
                        class: 'accotdion--down',
                        on: {
                          click(event) {
                            event.stopPropagation();
                            t.movePlace(index, 1);
                          },
                        },
                      },
                      [createSvg(h, svgs.up)]
                    ),
              ];
        const children = [
          h(
            'div',
            {
              class: 'accotdion--title',
              on: {
                click(event) {
                  if (item.detach) return;
                  clickToggle(event);
                },
              },
            },
            [
              h(
                'span',
                {
                  class: 'accotdion--toggle',
                  on: {
                    click: clickToggle,
                  },
                },
                [
                  createSvg(
                    h,
                    item.full || item.detach ? svgs.dot : svgs.arrows
                  ),
                ]
              ),
              h('div', item.name),
              h(
                'span',
                {
                  class: 'accotdion--delete',
                  on: {
                    click(event) {
                      event.stopPropagation();
                      t.remove(index);
                    },
                  },
                },
                [createSvg(h, svgs.delete)]
              ),
              ...upOrDown,
              h(
                'span',
                {
                  class: 'accotdion--detach',
                  on: {
                    click(event) {
                      event.stopPropagation();
                      t.detach(index);
                    },
                  },
                },
                [createSvg(h, svgs.detach)]
              ),
              h(
                'span',
                {
                  class: 'accotdion--full',
                  on: {
                    click(event) {
                      event.stopPropagation();
                      t.full(index);
                    },
                  },
                },
                [createSvg(h, svgs.full)]
              ),
            ]
          ),
          h(
            'div',
            {
              class: 'accotdion--board',
            },
            [
              h(
                'div',
                {
                  style: {},
                },
                [
                  h(item.component, {
                    props: item.props || {},
                    on: item.on || {},
                  }),
                ]
              ),
            ]
          ),
        ];

        items.push(
          h(
            'div',
            {
              ref: 'board_' + index,
              key: item._key || index,
              class: this.boardClass(index),
              style: this.detachStyle(index),
              attrs: {
                draggable: item.full,
              },
            },
            children
          )
        );
      }
    }
    return h(
      'div',
      {
        class: 'accotdion',
      },
      items
    );
  },
};
</script>

<style lang="less" scoped>
@import './utils.less';
@titleHeight: 22px;

.accotdion {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  user-select: none;
  overflow: auto;
  touch-action: none;
}

.accotdion--title {
  .title();
}

.accotdion--board {
  overflow: auto;
  height: calc(100% - @titleHeight);
  & > div {
    position: relative;
    &[style*='ns-resize']:after {
      opacity: 1;
    }
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4px;
      transition: opacity 0.4s;
      background-color: rgba(0, 0, 0, 0.05);
      opacity: 0;
      z-index: 100;
    }
  }
}

.board {
  background: #fff;
  height: @titleHeight;
  &.open {
    height: auto;
    .accotdion--toggle {
      transform: rotate(180deg);
    }
  }
  &.full {
    position: absolute;
    z-index: 1000;
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
    border: 0 !important;
    box-shadow: 1px 1px 3px #484545;
    .accotdion--detach,
    .accotdion--delete {
      visibility: hidden !important;
    }
  }
  &.detach {
    position: absolute;
    z-index: 100;
    left: 0;
    top: 0;
    box-shadow: 1px 1px 3px #484545;
    border: 1px solid #ddd;
    .accotdion--delete {
      visibility: hidden !important;
    }
  }
  &:hover {
    .accotdion--down,
    .accotdion--up,
    .accotdion--full,
    .accotdion--detach,
    .accotdion--delete {
      visibility: visible;
    }
  }
  .accotdion--down,
  .accotdion--up,
  .accotdion--delete,
  .accotdion--detach,
  .accotdion--full {
    visibility: hidden;
    &:hover {
      svg {
        fill: #111;
      }
    }
  }
  .accotdion--down {
    transform: rotate(180deg);
  }
  .accotdion--toggle {
    transform: rotate(90deg);
  }
}
</style>
