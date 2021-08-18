import Vue from 'vue';

export default {};

const indComponent = [];

export function install(name, component) {
    let n = name;
    let c = component;
    if (!component) {
        if (!name.name) {
            console.warn('No component Name cannot be registered');
            return;
        }
        n = name.name;

        c = name;
    }
    if (indComponent.includes(n)) {
        console.warn('Existing components with the same');

        return;
    }
    Vue.component(n, c);
}
