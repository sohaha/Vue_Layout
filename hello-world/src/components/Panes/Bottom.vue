<script>
import { createSvg, svgs } from './utils';

export default {
  name: 'Bottom',
  props: {
    name: {
      type: String,
      default: '',
    },
    riseHeight: {
      type: Number | String,
      default: '80',
    },
    rise: {
      type: Boolean,
    },
  },
  data() {
    return {
      state: this.rise,
    };
  },
  computed: {
    height() {
      let h = this.riseHeight;
      if (!h) {
        h = 80;
      }
      return this.state ? `${parseFloat(h)}%` : '100%';
    },
  },
  render(h) {
    const t = this;
    return h(
      'div',
      {
        class: { 'bottom-box': true, rise: this.state },
      },
      [
        this.state
          ? h('div', {
              class: 'mask--layer',
              on: {
                click(event) {
                  event.stopPropagation();
                  t.state = false;
                },
              },
            })
          : '',
        h(
          'div',
          {
            class: 'bottom-board',
            style: {
              height: this.height,
            },
          },
          [
            h(
              'div',
              {
                class: 'bottom--title',
              },
              [
                h(
                  'span',
                  {
                    class: '',
                    on: {
                      click(event) {
                        event.stopPropagation();
                        t.state = !t.state;
                      },
                    },
                  },
                  [createSvg(h, svgs.dot)]
                ),
                h('div', {}, this.name),
                h(
                  'span',
                  {
                    class: 'bottom--toggle',
                    on: {
                      click(event) {
                        event.stopPropagation();
                        t.state = !t.state;
                      },
                    },
                  },
                  [createSvg(h, svgs.arrows)]
                ),
              ]
            ),
            this.$slots.default,
          ]
        ),
      ]
    );
  },
};
</script>

<style lang="less" scoped>
@import './utils.less';

.bottom-box {
  height: 100%;
  width: 100%;

  &.rise {
    top: 0;
    position: absolute;

    .bottom--toggle {
      visibility: visible;
      transform: rotate(180deg);
    }

    .bottom-board {
      bottom: 0;
      left: 0;
      position: absolute;
    }
  }
}

.bottom-board {
  width: 100%;
  height: 100%;
  background: #fff;
}

.bottom--title {
  .title();

  .bottom--toggle {
    visibility: hidden;
    &:hover {
      svg {
        fill: #111;
      }
    }
  }

  &:hover {
    .bottom--toggle {
      visibility: visible;
    }
  }
}
</style>
