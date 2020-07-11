function $(id) {
    return document.getElementById(id);
}

function dblclickAction (e) {
    // 子要素でイベントが起きた時は処理をしない
    if (e.target !== e.currentTarget) return;

    const elem = $(e.target.lastChild.id);
    setBadge(elem, elem.dataset.done === "true" ? "false" : "true");
}

function setBadge(e, b) {
    if (b === "true") {
        e.previousElementSibling.innerText = "⭐";
        e.dataset.done = true;    
    } else {
        e.previousElementSibling.innerText = "";
        e.dataset.done = false;
    }
}

function save(e) {
    // 画面の内容を localStroage に保存
    const cells = document.querySelectorAll(".cell");
    const jso = [...cells].map((el) => {
        const child = el.lastChild;
        return {
            id: child.id,
            done: child.dataset.done,
            text: child.innerText
        };
    });
    localStorage.setItem(location.hash, JSON.stringify(jso));

    // 保存時アニメーション
    e.target.innerText = "Saved!💾";
    setTimeout(() => {
        e.target.innerText = "💾";
    }, 3000);
}

function load(json) {
    // 保存データがないときは処理しない
    if (json === null) return;

    const jso = JSON.parse(json);

    jso.forEach(e => {
        const elem = $(e.id);
        setBadge(elem, e.done);
        elem.innerText = e.text;
    });
}

function ready(loaded) {
	if (["interactive", "complete"].includes(document.readyState)) {
		loaded();
	} else {
		document.addEventListener("DOMContentLoaded", loaded);
	}
}

ready(() => {
    const cells = document.querySelectorAll(":scope .cell");

    cells.forEach(cell => {
        cell.addEventListener("dblclick", e => dblclickAction(e));
    });
    $("save").addEventListener("click", e => save(e));

    // 保存データのロード
    load(localStorage.getItem(location.hash));
});
