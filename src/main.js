/**
 * getElementByIdのショートカット
 * @param {string} id - idに指定している文字列
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * セル内でダブルクリックしたときのコールバック関数
 * @param {Event} e - ダブルクリック時のイベントオブジェクト 
 */
function dblclickAction (e) {
    // バッジのオンオフを行う
    let target = e.currentTarget;
    if (target.dataset.done === undefined) {
        target = target.lastChild;
    }
    toggleBadge(target, target.dataset.done === "true" ? "false" : "true");
}

/**
 * バッジのオンオフを切り替える
 * @param {Element} e - dataset.doneを持つElement
 * @param {string} b - booleanを表す文字列
 */
function toggleBadge(e, b) {
    if (b === "true") {
        e.previousElementSibling.innerText = "⭐";
        e.dataset.done = true;    
    } else {
        e.previousElementSibling.innerText = "";
        e.dataset.done = false;
    }
}

/**
 * 編集中のマンダラートを保存する
 * @param {Event} e - 保存ボタンをクリックしたときのイベントオブジェクト
 */
function save(e) {
    // セルとなるDOMをリストアップ
    const cells = document.querySelectorAll(".cell");

    // セルのID、完了バッジの状態、目標のデータをJavascriptオブジェクト化
    const jso = [...cells].map((el) => {
        const child = el.lastChild;
        return {
            id: child.id,
            done: child.dataset.done,
            text: child.innerText
        };
    });

    // 画面の内容をJSONに変換し、URLにつけたハッシュをセーブスロットとしてlocalStroageに保存
    localStorage.setItem(location.hash, JSON.stringify(jso));

    // 保存時アニメーション
    e.target.innerText = "Saved!💾";
    setTimeout(() => {
        e.target.innerText = "💾";
    }, 3000);
}

/**
 * 前回保存したマンダラートを読み込む
 * @param {string} json - 全開保存したマンダラートを表すJSON
 */
function load(json) {
    // 保存データがないときは処理しない
    if (json === null) return;

    // JSONをjavascriptオブジェクトに展開
    const jso = JSON.parse(json);

    // JSONの内容を各セルに書き込む
    jso.forEach(e => {
        const elem = $(e.id);
        toggleBadge(elem, e.done);
        elem.innerText = e.text;
    });
}

/**
 * DOM読み込み完了時の動作
 * @param {function} loaded - DOM読み込み完了時に実行するコールバック関数
 */
function ready(loaded) {
	if (["interactive", "complete"].includes(document.readyState)) {
		loaded();
	} else {
		document.addEventListener("DOMContentLoaded", loaded);
	}
}

// DOMの読み込みより先にJavascriptが呼び出されても大丈夫なように、読み込み完了時に
// 動作する初期化処理をコールバック関数としてセットしておく
ready(() => {
    // セルとなるDOMをリストアップ    
    const cells = document.querySelectorAll(".cell");

    // すべてのセルにダブルクリック時のコールバック関数を登録する
    cells.forEach(cell => {
        cell.addEventListener("dblclick", e => dblclickAction(e));
    });

    // 保存ボタンをクリック時のコールバック関数を登録する
    $("save").addEventListener("click", e => save(e));

    // 保存データのロードを試みる
    load(localStorage.getItem(location.hash));
});
