import Item from './Item.vue';
import Layout from './Layout.vue';
import Panel from './Panel.vue';

const component = {
  Panel,
  Layout,
  Item,
};

export default Panel;
export { Layout, Item };

export function install (Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.keys(component).forEach(name => {
    Vue.component(name, Panel[name]);
  });
}

export const plugin = {
  install,
};
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}