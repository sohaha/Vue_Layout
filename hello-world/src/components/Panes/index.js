
import Vue from 'vue';


export default {

};


const indComponent = [];

export function install(name, component) {
    let n = name;
    let c = component;
    if (!component) {
        n = name.name;
        c = name;
    }
    if (indComponent.includes(n)) return;
    Vue.component(n, c);
}
