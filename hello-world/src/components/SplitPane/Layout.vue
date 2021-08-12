<template>
  <div id="app">
    <pane height="500px" resizer-width="25px" :nested="true">
      <item init-height="400px">
        <pane split="horizontal" height="100%" resizer-width="25px">
          <item v-if="show">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Consectetur, excepturi in dolores accusantium praesentium quidem
            laborum neque ut ipsum veritatis ratione rem, esse totam voluptates
            ullam nesciunt tempora architecto laudantium!
          </item>
          <item>
            ddd
          </item>
          <item>
            333
          </item>
        </pane>
      </item>
      <item init-height="100px">100px</item>
    </pane>
  </div>
</template>
<script>
import Item from './Item';
import Pane from './Pane';
// import ExampleInput from './ExampleInput';

export default {
  name: 'Layout',
  components: {
    Pane,
    Item,
    //    ExampleInput
  },
  props: {
    layout: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({ show: true }),
  computed: {
    left() {
      return this.layout['left'] || [];
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
            h(
              'item',
              {
                props: {
                  nested: true,
                  split: 'horizontal',
                },
              },
              [
                createItem('left'),
                //   , createItem('centre'), createItem('right')
              ]
            )
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
                          //   Vue.set(v, 'open', !v.open);
                          // e.preventDefault();
                          const target = item.componentInstance;
                          console.log(target.getCurrentSize(target));
                          // t.requestUpdate({ target: t, size: '22px' });
                          console.log(
                            '收起来当前应该改成 22',
                            v,
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
                      h('span', {
                        class: {
                          'itme--toggle': true,
                          'itme--toggle__open': v.open,
                        },
                        on: {
                          click(target) {},
                        },
                      }),
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

            // itemChild.push(h('item'));
            itemParent = h(
              'item',
              {
                style: { height: '300px' },
                props: {
                  nested: true,
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
      'item',
      {
        ref: 'item',
        style: { height: '700px' },
        props: {
          nested: true,
        },
      },
      [
        createItem('content'),
        //   , createItem('bottom')
      ]
    );
    return layout;
  },
};
</script>

<style></style>
