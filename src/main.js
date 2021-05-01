/**
 * getElementByIdのショートカット
 * @param {string} id - idに指定している文字列
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * 現在のURLに含まれるハッシュからファイル名を取得する
 */
function getFilename() {
  let filename = location.hash;
  if (location.hash === "") {
    filename = "mandarart";
  }
  return filename;
}

/**
 * セル内でダブルクリックしたときのコールバック関数
 * @param {Event} e - ダブルクリック時のイベントオブジェクト 
 */
function handleDblclickAction (e) {
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
 * ダウンロードボタンをクリックしたときのコールバック関数
 * 保存しているJSONデータをダウンロードする
 * @param {Event} e - クリック時のイベントオブジェクト 
 */
function handleDownload(e) {
  const saveDataName = getFilename();
  const json = JSON.stringify(localStorage.getItem(saveDataName));
  const donwloadFileNmae = saveDataName + ".json"
  const downLoadLink = document.createElement("a");;

  log = json.replace(/\\/g, "").slice(1,-1); // 文字列を JSON に整形

  downLoadLink.download = decodeURI(donwloadFileNmae);
  downLoadLink.href = URL.createObjectURL(new Blob([log], {type: "application/octet-stream"}));
  downLoadLink.dataset.downloadurl = ["application/octet-stream", donwloadFileNmae, downLoadLink.href].join(":");
  downLoadLink.click();
}

/**
 * 編集中のマンダラートを保存する
 * @param {Event} e - 保存ボタンをクリックしたときのイベントオブジェクト
 */
function handleSave(e) {
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
  localStorage.setItem(getFilename(), JSON.stringify(jso));

  // 保存時アニメーション
  e.target.innerText = "Saved!💾";
  setTimeout(() => {
    e.target.innerText = "💾";
  }, 3000);
}

/**
 * 編集中のマンダラートを全削除する
 * @param {Event} e - 全削除ボタンをクリックしたときのイベントオブジェクト
 */
function handleRemoveAll(e) {
  // セルとなるDOMをリストアップ
  const cells = document.querySelectorAll(".cell");

  // セルのID、完了バッジの状態、目標のデータをJavascriptオブジェクト化
  const jso = [...cells].map((el) => {
    const child = el.lastChild;
    return {
      id: child.id,
      done: "false",
      text: ""
    };
  });

  load(JSON.stringify(jso));
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
 * ファイルをドロップしたとき、ドロップしたファイルを読み込んで画面に反映する
 * @param {Event} e - ドロップイベントオブジェクト
 */
function handleDropAction(e) {
  e.preventDefault();
  e.stopPropagation();

  const droppedFiles = e.dataTransfer.files; // the files that were dropped

  if (droppedFiles.length > 0) {
    const ajaxData = new FormData();
    const ajax = new XMLHttpRequest();
    const file = droppedFiles[0];

    ajaxData.append('file', file);
    ajax.open('GET', 'index.html');
    ajax.onload = (e) => {
      if (ajax.status >= 200 && ajax.status < 400) {
        const fr = new FileReader();
        fr.onload = () => {
          console.log("r", fr.result);
          load(fr.result);
        };
        fr.readAsText(file);
      }
    }
    ajax.send(ajaxData);    
  }
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
    cell.addEventListener("dblclick", handleDblclickAction);
  });

  $("save").addEventListener("click", handleSave);
  $("download").addEventListener("click", handleDownload);
  $("remove_all").addEventListener("click", handleRemoveAll);

  // 中央セルにファイルドロップイベント時のコールバック関数を登録する
  const target_cell = $("grand_theme_cell");
  ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(event => {
    target_cell.addEventListener(event, (e) => {
      // ブラウザデフォルトのイベント処理を停止
      e.preventDefault();
      e.stopPropagation();
    });
  });
  target_cell.addEventListener("drop", handleDropAction);

  // 保存データのロードを試みる
  load(localStorage.getItem(location.hash === "" ? "mandarart" : location.hash));
});
