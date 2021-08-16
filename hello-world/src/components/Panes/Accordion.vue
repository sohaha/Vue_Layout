<script>
import Vue from 'vue';
import '@interactjs/auto-start';
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';
import '@interactjs/dev-tools';
import interact from '@interactjs/interact';
import { createSvg } from './utils';

export default {
  name: 'Accordion',
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data: () => ({}),
  mounted() {
    this.$nextTick(() => {
      this.items.forEach((_, index) => {
        this.bindBoard(index);
      });
    });
  },
  beforeDestroy() {
    this.items.forEach(item => {
      if (!item._bindBoard) return;
      item._bindBoard.unset();
      item._bindBoard = null;
    });
  },
  methods: {
    bindBoard(index, e) {
      if (this.items[index]._bindBoard) {
        return;
      }
      const t = this;
      const name = 'board_' + index;
      this.items[index]._bindBoard = true;
      setTimeout(() => {
        const el = this.$refs[name];
        const board = el.querySelector('.accotdion--board > div');
        const interactObj = interact(board);
        // interactObj.draggable({
        //   listeners: {
        //     move(event) {
        //       console.log(event.pageX, event.pageY);
        //     },
        //   },
        // });
        interactObj.resizable({
          edges: { bottom: true },
          modifiers: [
            interact.modifiers.aspectRatio({
              ratio: 'preserve',
            }),
          ],
          listeners: {
            move(event) {
              event.stopPropagation();
              Object.assign(event.target.style, {
                height: `${event.rect.height}px`,
              });
            },
            end(event) {
              if (event.rect.height === 0) {
                t.items[index].open = false;
              } else {
                t.items[index].open = true;

                t.items[index].height = board.clientHeight + 'px';
              }
            },
          },
        });
        this.items[index]._bindBoard = interactObj;
        const height = board.clientHeight;
        if (height > 0) {
          this.items[index].height = height + 'px';
        }
      }, 10);
    },
    boardClass(num) {
      return {
        board: true,
        open: this.items[num].open,
        detach: this.items[num].detach,
      };
    },
    detach(num) {
      const detach = !this.items[num].detach;
      Vue.set(this.items[num], 'detach', detach);
      if (detach) {
        Vue.set(this.items[num], 'open', true);
      }
    },
    remove(num) {
      this.$emit('remove', num);
    },
    toggle(num) {
      if (this.items[num].detach) return;
      Vue.set(this.items[num], 'open', !this.items[num].open);
    },
  },
  render(h) {
    const items = [];
    const t = this;
    for (const index in this.items) {
      if (Object.hasOwnProperty.call(this.items, index)) {
        const item = this.items[index];
        const children = [
          h(
            'div',
            {
              class: 'accotdion--title',
              on: {
                click() {
                  t.toggle(index);
                },
              },
            },
            [
              h('span', { class: 'accotdion--toggle' }, [
                createSvg(h, [
                  'M96.196 671.807l415.804-415.632 415.803 415.632-63.616 63.445-352.209-352.017-352.102 352.017z',
                ]),
              ]),
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
                [
                  createSvg(h, [
                    'M286.165333 798.165333L512 572.330667l225.834667 225.834666 60.330666-60.330666L572.330667 512l225.834666-225.834667-60.330666-60.330666L512 451.669333 286.165333 225.834667 225.834667 286.165333 451.669333 512l-225.834666 225.834667z',
                  ]),
                ]
              ),
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
                [
                  createSvg(h, [
                    'M781.66217017 208.63562012H478.29779029c-9.29937744 0-17.25402856 3.29260253-23.84417701 9.87780761-6.6049807 6.60992408-9.89758325 14.53491211-9.89758325 23.84417701v303.36932398c0 9.29937744 3.29260253 17.21942138 9.89758325 23.82934546 6.59014916 6.56542945 14.54479957 9.88275171 23.84417701 9.8827517h303.36437988c9.3092649 0 17.25402856-3.31732154 23.82934618-9.87780762 6.61486816-6.61486816 9.90252662-14.53491211 9.90252662-23.83428955V242.35760474c0-9.31420898-3.28765845-17.23425293-9.89758325-23.84417701-6.58520508-6.58520508-14.52502465-9.87780761-23.83428955-9.87780761z m-404.50561476 337.05175805V444.5659182H242.35266137c-9.31915307 0-17.22930884 3.30743408-23.86395263 9.87780762-6.56048608 6.6049807-9.87780761 14.53491211-9.87780762 23.84417701v303.3594358c0 9.31420898 3.31237817 17.27380347 9.87780762 23.78485155 6.63464379 6.69396997 14.54479957 9.88769508 23.86395263 9.88769508H545.71704125c9.29937744 0 17.23425293-3.19372583 23.85406447-9.88769508 6.56542945-6.51104737 9.87780761-14.47064185 9.87780762-23.77990747v-134.82861303H478.31756592c-27.89318824 0-51.76208497-9.86792016-71.51275611-29.6235354-19.74572778-19.75067115-29.62353539-43.5849607-29.62353539-71.47814966l-0.01977564-0.03955054zM478.30273437 141.21142578h303.36437988c27.92285133 0 51.74725342 9.86792016 71.50286866 29.62353539 19.75561523 19.75561523 29.62353539 43.58990479 29.62353539 71.48803711v303.36437989c0 27.9327395-9.86792016 51.72253442-29.62353539 71.49792456-19.75561523 19.74572778-43.58001733 29.62353539-71.50286865 29.62353539h-134.81872559v134.8187256c0 27.9327395-9.88275171 51.72253442-29.62847876 71.49792456-19.75561523 19.77539086-43.60473633 29.66308594-71.50286866 29.66308594H242.34771729c-27.90307641 0-51.75714087-9.88769508-71.51275612-29.66308594C151.07934594 833.35009742 141.21142578 809.55535913 141.21142578 781.62261963V478.27307128c0-27.91296386 9.86792016-51.75714087 29.62353539-71.50286865 19.75561523-19.75561523 43.60968041-29.61859131 71.51275612-29.6185913h134.81378149V242.32299828c0-27.89813232 9.87780761-51.73242188 29.62353539-71.48803711C426.54064942 151.07934594 450.37493896 141.21142578 478.29779029 141.21142578z',
                  ]),
                ]
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
                  style: {
                    height: item.open
                      ? item.height
                        ? item.height
                        : 'calc(100% - 22px)'
                      : 0,
                  },
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
              attrs: {
                draggable: item.detach,
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
  height: calc(100% - 22px);
  & > div {
    position: relative;
    &:hover:after {
      opacity: 1;
    }
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      transition: opacity 0.4s;
      background-color: rgba(0, 0, 0, 0.05);
      opacity: 0;
      z-index: 1;
    }
  }
}
.board {
  background: #fff;
  &.open {
    .accotdion--toggle {
      transform: rotate(180deg);
    }
  }
  &.detach {
    position: absolute;
    z-index: 1;
    // box-shadow: 1px 1px 3px #878d9a, -1px -1px 3px #878d9a;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    .accotdion--toggle,
    .accotdion--delete {
      visibility: hidden !important;
    }
  }
  &:hover {
    .accotdion--detach,
    .accotdion--delete {
      visibility: visible;
    }
  }
  .accotdion--delete,
  .accotdion--detach {
    visibility: hidden;
    &:hover {
      svg {
        fill: #111;
      }
    }
  }
  .accotdion--toggle {
    transform: rotate(90deg);
  }
}
</style>
