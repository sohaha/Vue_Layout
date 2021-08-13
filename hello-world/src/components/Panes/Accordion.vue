<template>
  <div class="accotdion">
    <div
      v-for="(item, index) in items"
      :key="item._key"
      :class="boardClass(index)"
      :draggable="item.detach"
    >
      <div class="accotdion--title" @click="toggle(index)">
        <span class="accotdion--toggle">
          <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              d="M96.196 671.807l415.804-415.632 415.803 415.632-63.616 63.445-352.209-352.017-352.102 352.017z"
              p-id="1308"
            />
          </svg>
        </span>
        <div>{{ item.name }}</div>

        <span class="accotdion--delete" @click.stop="remove(index)">
          <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              d="M286.165333 798.165333L512 572.330667l225.834667 225.834666 60.330666-60.330666L572.330667 512l225.834666-225.834667-60.330666-60.330666L512 451.669333 286.165333 225.834667 225.834667 286.165333 451.669333 512l-225.834666 225.834667z"
              fill=""
              p-id="1346"
            />
          </svg>
        </span>
        <span class="accotdion--detach" @click.stop="detach(index)">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              d="M781.66217017 208.63562012H478.29779029c-9.29937744 0-17.25402856 3.29260253-23.84417701 9.87780761-6.6049807 6.60992408-9.89758325 14.53491211-9.89758325 23.84417701v303.36932398c0 9.29937744 3.29260253 17.21942138 9.89758325 23.82934546 6.59014916 6.56542945 14.54479957 9.88275171 23.84417701 9.8827517h303.36437988c9.3092649 0 17.25402856-3.31732154 23.82934618-9.87780762 6.61486816-6.61486816 9.90252662-14.53491211 9.90252662-23.83428955V242.35760474c0-9.31420898-3.28765845-17.23425293-9.89758325-23.84417701-6.58520508-6.58520508-14.52502465-9.87780761-23.83428955-9.87780761z m-404.50561476 337.05175805V444.5659182H242.35266137c-9.31915307 0-17.22930884 3.30743408-23.86395263 9.87780762-6.56048608 6.6049807-9.87780761 14.53491211-9.87780762 23.84417701v303.3594358c0 9.31420898 3.31237817 17.27380347 9.87780762 23.78485155 6.63464379 6.69396997 14.54479957 9.88769508 23.86395263 9.88769508H545.71704125c9.29937744 0 17.23425293-3.19372583 23.85406447-9.88769508 6.56542945-6.51104737 9.87780761-14.47064185 9.87780762-23.77990747v-134.82861303H478.31756592c-27.89318824 0-51.76208497-9.86792016-71.51275611-29.6235354-19.74572778-19.75067115-29.62353539-43.5849607-29.62353539-71.47814966l-0.01977564-0.03955054zM478.30273437 141.21142578h303.36437988c27.92285133 0 51.74725342 9.86792016 71.50286866 29.62353539 19.75561523 19.75561523 29.62353539 43.58990479 29.62353539 71.48803711v303.36437989c0 27.9327395-9.86792016 51.72253442-29.62353539 71.49792456-19.75561523 19.74572778-43.58001733 29.62353539-71.50286865 29.62353539h-134.81872559v134.8187256c0 27.9327395-9.88275171 51.72253442-29.62847876 71.49792456-19.75561523 19.77539086-43.60473633 29.66308594-71.50286866 29.66308594H242.34771729c-27.90307641 0-51.75714087-9.88769508-71.51275612-29.66308594C151.07934594 833.35009742 141.21142578 809.55535913 141.21142578 781.62261963V478.27307128c0-27.91296386 9.86792016-51.75714087 29.62353539-71.50286865 19.75561523-19.75561523 43.60968041-29.61859131 71.51275612-29.6185913h134.81378149V242.32299828c0-27.89813232 9.87780761-51.73242188 29.62353539-71.48803711C426.54064942 151.07934594 450.37493896 141.21142578 478.29779029 141.21142578z"
              p-id="1241"
            />
          </svg>
        </span>
      </div>
      <div v-show="item.open" class="accotdion--board">
        <component :is="item.component" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

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
  methods: {
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
};
</script>

<style lang="less" scoped>
@text-color: rgb(107, 114, 128);
.accotdion {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  user-select: none;
  overflow: auto;
}

.accotdion--title {
  overflow: hidden;
  transition: all 0.2s;
  background: #d8d4c4;
  font-size: 12px;
  padding: 2px;
  height: 22px;
  color: @text-color;
  position: relative;
  display: flex;

  & > div {
    flex: 1;
    text-align: left;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    width: 13px;
    height: 13px;
    fill: @text-color;
  }

  span {
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    font-size: 2em;
  }
}

.accotdion--board {
  height: 100%;
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
