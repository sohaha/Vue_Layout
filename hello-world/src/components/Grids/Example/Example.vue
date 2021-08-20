<template>
  <div class="panel-view h-screen">
    <div
      id="tools"
      class=" bg-gradient-to-rb from-gray-600 to-gray-900 sticky top-0 w-full shadow-lg z-10"
    >
      <header class="text-white font-mono">
        <div
          class="container mx-auto flex flex-wrap p-2 flex-col md:flex-row items-center"
        >
          <a class="flex title-font font-medium items-center mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              class="w-10 h-10 text-white p-2 bg-gray-400 rounded-full"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
            <span class="ml-3 text-xl">Tailwind</span>
          </a>
          <nav
            d-class='{"hidden md:flex opacity-0":isCode()}'
            class="mb-4 md:mb-0 md:ml-auto flex flex-wrap items-center text-base justify-center text-white"
          >
            <!-- <a
              class="mr-5 cursor-pointer"
              :class="{ 'opacity-60': previewView != 'sm' }"
              @click="previewView = 'sm'"
            >
              <svg
                class="w-8 h-8"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </a>
            <a
              class="mr-5 cursor-pointer"
              :class="{ 'opacity-60': previewView != 'md' }"
              @click="previewView = 'md'"
            >
              <svg
                class="w-8 h-8"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </a>
            <a
              class="mr-5 cursor-pointer"
              :class="{ 'opacity-60': previewView != 'lg' }"
              @click="previewView = 'lg'"
            >
              <svg
                class="w-8 h-8"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <path d="M8 21h8m-4-4v4"/>
              </svg>
            </a> -->
          </nav>
          <div class="relative pl-28">
            <button
              :class="
                'left-0 opacity-80 hover:bg-green-500 hover:opacity-100 inline-flex items-center mr-1 py-1 px-3 border-0 bg-gray-600 focus:outline-none rounded ' +
                  (lock && 'bg-green-100 text-gray-600')
              "
              title="锁定"
              @click="lock = !lock"
            >
              {{ lock ? 'UnLock' : 'Lock' }}
            </button>
            <!-- <button v-show='isPreview' @click='view="code"'
                            class="left-0 opacity-80 hover:bg-green-500 hover:opacity-100 inline-flex items-center mr-1 py-1 px-3 border-0 bg-gray-500 focus:outline-none rounded"
                            title="隐藏代码界面">
                            Hide Code
                        </button>
                        <button v-show='!isPreview' @click='view="preview"'
                            class="left-0 opacity-80 hover:bg-green-500 hover:opacity-100 inline-flex items-center mr-1 py-1 px-3 border-0 bg-gray-600 focus:outline-none rounded"
                            title="显示代码界面">
                            View Code
                        </button>
                        <button @click='fullScreen'
                            class="inline-flex items-center bg-gray-600 border-0 py-1 px-3 mr-1 focus:outline-none hover:bg-green-500 rounded text-base" title="全屏显示">Full</button>
                        <a href="https://tailwind.docs.73zls.com/docs/configuration" target="_blank"
                            class="inline-flex text-gray-800 items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-green-500 hover:text-white rounded text-base"
                            title="中文文档">Docs
                            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                        </a> -->
          </div>
        </div>
      </header>
    </div>

    <div class="box bg-gray-100 w-full min-h-full">
      <panel
        :col-num="12"
        :row-height="30"
        :responsive="true"
        :lock="lock"
        :layout.sync="layout"
      />
      <!--    <div class='sticky left-0 w-[200px] bg-gray-100'>sticky</div>-->
      <!--    <div class='content flex-1'>-->
      <!--      <Layout ref='gridlayout' :layout.sync="layout" :col-num="colNum"  :row-height="rowHeight" >-->
      <!--        <Item v-for="item in layout" :key="item.i" :static="item.static" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :min-w="item.minW" :max-w="item.maxW" :min-x="item.minX" :max-x="item.maxX" :min-y="item.minY" :max-y="item.maxY" :float="item.float" :preserve-aspect-ratio="item.preserveAspectRatio">-->
      <!--          <div class="comp" :text="item.i" >-->
      <!--            {{ item.i }}-->
      <!--            <div v-if='item.i ==3'>333333333333333333333<br>333333333333333333333333333333333<br>333333333333333333333333333333333<br>333333333333333333333333333333333<br>333333333333-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </Item>-->
      <!--      </Layout>-->
      <!--    </div>-->
    </div>
  </div>
</template>

<script>
// import Vue from 'vue';
// import { plugin } from './components/Panel';
// Vue.use(plugin)

import Panel from '@/components/Grids';

const testLayout = [
  {
    i: '0',
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  // {
  //   x: 1,
  //   y: 0,
  //   w: 2,
  //   h: 2,
  //   i: '1',
  // },
  // {
  //   x: 3,
  //   y: 0,
  //   w: 3,
  //   h: 3,
  //   i: '2',
  //   float: false,
  // },
];
for (let i = 1; i < 10; i++) {
  testLayout.push({
    x: i,
    y: i,
    w: 1,
    h: 2,
    i: 'd' + i,
  });
  //   testLayout.push({
  //     x: i,
  //     y: 0,
  //     w: parseInt(i / 2, 10),
  //     h: parseInt(i / 2, 10),
  //     i: i,
  //     // float: false,
  //   });
}
export default {
  name: 'App',
  components: { Panel },
  data() {
    return {
      // colNum: 12,
      // rowHeight: 30,
      lock: false,
      layout: JSON.parse(JSON.stringify(testLayout)),
    };
  },
  methods: {},
};
</script>

<style scoped></style>
