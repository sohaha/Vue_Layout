const data = [];

function done() {
    console.log(JSON.stringify(data));
}

function run() {
    document.querySelectorAll('tr.el-table__row').forEach(e => {
        const d = [];
        e.querySelectorAll('.cell').forEach(e => {
            d.push(e.textContent.trim());
        });
        data.push(d);
    });
    const el = document.querySelector('.number.active ~ .number');
    if (!el) {
        done();
        return;
    }
    el.click();
    setTimeout(run, 2000);
}

run();
