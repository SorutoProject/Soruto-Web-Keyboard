/*
	Soruto Web IME
	ウェブブラウザで使える、独自IME。
*/

var webKeyboard = {};
var using = false; //IMEの要素がページに追加されているかどうか
var keyBoardHTML = {};
var nowEdit = null;
var onEnter = [];
var placeholderText = [];
var nowArrayNum = 0;
var nowEditNum = null;
var imeMode = null; //日本語/英語
var shift = false; //大文字/小文字
keyBoardHTML.default = '<div id="webime-ja"><button class="webime-key">あ</button><button class="webime-key">か</button><button class="webime-key">さ</button><button class="webime-key">た</button><button class="webime-key">な</button><button class="webime-key">は</button><button class="webime-key">ま</button><button class="webime-key">や</button><button class="webime-key">ら</button><button class="webime-key">わ</button><br><button class="webime-key">い</button><button class="webime-key">き</button><button class="webime-key">し</button><button class="webime-key">ち</button><button class="webime-key">に</button><button class="webime-key">ひ</button><button class="webime-key">み</button><button class="webime-key">ゆ</button><button class="webime-key">り</button><button class="webime-key">を</button><br><button class="webime-key">う</button><button class="webime-key">く</button><button class="webime-key">す</button><button class="webime-key">つ</button><button class="webime-key">ぬ</button><button class="webime-key">ふ</button><button class="webime-key">む</button><button class="webime-key">よ</button><button class="webime-key">る</button><button class="webime-key">ん</button><br><button class="webime-key">え</button><button class="webime-key">け</button><button class="webime-key">せ</button><button class="webime-key">て</button><button class="webime-key">ね</button><button class="webime-key">へ</button><button class="webime-key">め</button><button id="webime-key-d">゛</button><button class="webime-key">れ</button><button class="webime-key">ー</button><br><button class="webime-key">お</button><button class="webime-key">こ</button><button class="webime-key">そ</button><button class="webime-key">と</button><button class="webime-key">の</button><button class="webime-key">ほ</button><button class="webime-key">も</button><button id="webime-key-hd">゜</button><button class="webime-key">ろ</button><button id="webime-ls" title="普通⇔小書き">あぁ</button></div><div id="webime-en"><button class="webime-key">a</button><button class="webime-key">b</button><button class="webime-key">c</button><button class="webime-key">d</button><button class="webime-key">e</button><button class="webime-key">f</button><button class="webime-key">g</button><button class="webime-key">h</button><button class="webime-key">i</button><button class="webime-key">j</button><br><button class="webime-key">k</button><button class="webime-key">l</button><button class="webime-key">m</button><button class="webime-key">n</button><button class="webime-key">o</button><button class="webime-key">p</button><button class="webime-key">q</button><button class="webime-key">r</button><button class="webime-key">s</button><button class="webime-key">t</button><br><button class="webime-key">u</button><button class="webime-key">v</button><button class="webime-key">w</button><button class="webime-key">x</button><button class="webime-key">y</button><button class="webime-key">z</button><button id="webime-shift">Shift</button></div><br><button id="webime-continue">OK</button><button id="webime-cancel" title="変更内容をテキストボックスに適用せずにこの画面を閉じる">戻る</button>　<button id="webime-key-bs" title="最後の一文字を削除">←</button><button id="webime-key-delete" title="すべて削除">×</button><button id="webime-je" title="日本語/英語を切り替え">あA</button>';

webKeyboard.add = function (elemQuery, option) {
	var elem = document.querySelectorAll(elemQuery);
	//webKeyboard.addが初めて実行されたときに、IMEの要素をページに追加
	if (using === false) {
		var main = document.createElement("div"); //IMEベース要素
		main.id = "webime-base";
		main.className = "close";
		var userInput = document.createElement("div"); //ユーザーの入力を表示する要素
		userInput.id = "webime-userinput";
		userInput.innerHTML = '<span id="webime-userinput-cursor"></span>'
		/*var candidacy = document.createElement("div");
		candidacy.id = "webime-candidacy";*/
		var keyboard = document.createElement("div");
		keyboard.innerHTML = keyBoardHTML.default;
		keyboard.id = "webime-keyboard";
		var placeholder = document.createElement("div");
		placeholder.id = "webime-placeholder";

		main.appendChild(userInput);
		main.appendChild(keyboard);
		main.appendChild(placeholder);
		document.body.appendChild(main);

		//各キーにイベントを追加
		var keyboardKeys = document.querySelectorAll("#webime-keyboard .webime-key");
		for (var i = 0; i < keyboardKeys.length; i++) {
			keyboardKeys[i].addEventListener("click", function (e) {
				webKeyboard.input(e);
			});
		}
		//完了キー
		var continueKey = document.getElementById("webime-continue");
		continueKey.addEventListener("click", function () {
			webKeyboard.continue();
		});
		//キャンセルキー
		var cancelKey = document.getElementById("webime-cancel");
		cancelKey.addEventListener("click", function () {
			document.getElementById("webime-base").className = "close";
			webKeyboard.removeKeyboardEvent();

		});
		//BSキー
		var bsKey = document.getElementById("webime-key-bs");
		bsKey.addEventListener("click", function () {
			webKeyboard.backSpace();
		});
		//すべて削除キー
		var deleteKey = document.getElementById("webime-key-delete");
		deleteKey.addEventListener("click", function (e) {
			document.getElementById("webime-userinput").innerHTML = '<span id="webime-userinput-cursor"></span>';
			webKeyboard.csPlaceholder();
		});
		//日本語・英語キー
		var jeKey = document.getElementById("webime-je");
		jeKey.addEventListener("click", function () {
			webKeyboard.changeJE();
		});
		//Shiftキー
		var shiftKey = document.getElementById("webime-shift");
		shiftKey.addEventListener("click", function () {
			webKeyboard.changeShift();
		});
		//濁点(゛)キー
		var dKey = document.getElementById("webime-key-d");
		dKey.addEventListener("click", function () {
			var lastStr = document.getElementById("webime-userinput").textContent.slice(-1);

			var dakutenMozi = null;
			switch (lastStr) {
				case "か":
					var dakutenMozi = "が";
					break;
				case "き":
					var dakutenMozi = "ぎ";
					break;
				case "く":
					var dakutenMozi = "ぐ";
					break;
				case "け":
					var dakutenMozi = "げ";
					break;
				case "こ":
					var dakutenMozi = "ご";
					break;
				case "さ":
					var dakutenMozi = "ざ";
					break;
				case "し":
					var dakutenMozi = "じ";
					break;
				case "す":
					var dakutenMozi = "ず";
					break;
				case "せ":
					var dakutenMozi = "ぜ";
					break;
				case "そ":
					var dakutenMozi = "ぞ";
					break;
				case "た":
					var dakutenMozi = "だ";
					break;
				case "ち":
					var dakutenMozi = "ぢ";
					break;
				case "つ":
					var dakutenMozi = "づ";
					break;
				case "て":
					var dakutenMozi = "で";
					break;
				case "と":
					var dakutenMozi = "ど";
					break;
				case "は":
					var dakutenMozi = "ば";
					break;
				case "ひ":
					var dakutenMozi = "び";
					break;
				case "ふ":
					var dakutenMozi = "ぶ";
					break;
				case "へ":
					var dakutenMozi = "べ";
					break;
				case "ほ":
					var dakutenMozi = "ぼ";
					break;
				case "ぱ":
					var dakutenMozi = "ば";
					break;
				case "ぴ":
					var dakutenMozi = "び";
					break;
				case "ぷ":
					var dakutenMozi = "ぶ";
					break;
				case "ぺ":
					var dakutenMozi = "べ";
					break;
				case "ぽ":
					var dakutenMozi = "ぼ";
					break;
					//濁点→普通
				case "が":
					var dakutenMozi = "か";
					break;
				case "ぎ":
					var dakutenMozi = "き";
					break;
				case "ぐ":
					var dakutenMozi = "く";
					break;
				case "げ":
					var dakutenMozi = "け";
					break;
				case "ご":
					var dakutenMozi = "こ";
					break;
				case "ざ":
					var dakutenMozi = "さ";
					break;
				case "じ":
					var dakutenMozi = "し";
					break;
				case "ず":
					var dakutenMozi = "す";
					break;
				case "ぜ":
					var dakutenMozi = "せ";
					break;
				case "ぞ":
					var dakutenMozi = "そ";
					break;
				case "だ":
					var dakutenMozi = "た";
					break;
				case "ぢ":
					var dakutenMozi = "ち";
					break;
				case "づ":
					var dakutenMozi = "つ";
					break;
				case "で":
					var dakutenMozi = "て";
					break;
				case "ど":
					var dakutenMozi = "と";
					break;
				case "ば":
					var dakutenMozi = "は";
					break;
				case "び":
					var dakutenMozi = "ひ";
					break;
				case "ぶ":
					var dakutenMozi = "ふ";
					break;
				case "べ":
					var dakutenMozi = "へ";
					break;
				case "ぼ":
					var dakutenMozi = "ほ";
					break;
			}

			if (dakutenMozi !== null) {
				document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent.slice(0, -1) + dakutenMozi + '<span id="webime-userinput-cursor"></span>';
				webKeyboard.csPlaceholder();
			}

		});

		//半濁点(゜)キー
		var hdKey = document.getElementById("webime-key-hd");
		hdKey.addEventListener("click", function () {
			var lastStr = document.getElementById("webime-userinput").textContent.slice(-1);

			var dakutenMozi = null;
			switch (lastStr) {
				case "は":
					var dakutenMozi = "ぱ";
					break;
				case "ひ":
					var dakutenMozi = "ぴ";
					break;
				case "ふ":
					var dakutenMozi = "ぷ";
					break;
				case "へ":
					var dakutenMozi = "ぺ";
					break;
				case "ほ":
					var dakutenMozi = "ぽ";
					break;
				case "ば":
					var dakutenMozi = "ぱ";
					break;
				case "び":
					var dakutenMozi = "ぴ";
					break;
				case "ぶ":
					var dakutenMozi = "ぷ";
					break;
				case "べ":
					var dakutenMozi = "ぺ";
					break;
				case "ぼ":
					var dakutenMozi = "ぽ";
					break;
				case "ぱ":
					var dakutenMozi = "は";
					break;
				case "ぴ":
					var dakutenMozi = "ひ";
					break;
				case "ぷ":
					var dakutenMozi = "ふ";
					break;
				case "ぺ":
					var dakutenMozi = "へ";
					break;
				case "ぽ":
					var dakutenMozi = "ほ";
					break;
			}
			if (dakutenMozi !== null) {
				document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent.slice(0, -1) + dakutenMozi + '<span id="webime-userinput-cursor"></span>';
				webKeyboard.csPlaceholder();
			}
		});

		//普通⇔小書き変換キー
		var lsKey = document.getElementById("webime-ls");
		lsKey.addEventListener("click", function () {
			//テキストボックスの末尾の文字を取得
			var lastStr = document.getElementById("webime-userinput").textContent.slice(-1);

			var after = null;
			switch (lastStr) {
				case "あ":
					var after = "ぁ";
					break;
				case "い":
					var after = "ぃ";
					break;
				case "う":
					var after = "ぅ";
					break;
				case "え":
					var after = "ぇ";
					break;
				case "お":
					var after = "ぉ";
					break;
				case "や":
					var after = "ゃ";
					break;
				case "ゆ":
					var after = "ゅ";
					break;
				case "よ":
					var after = "ょ";
					break;
				case "つ":
					var after = "っ";
					break;

				case "ぁ":
					var after = "あ";
					break;
				case "ぃ":
					var after = "い";
					break;
				case "ぅ":
					var after = "う";
					break;
				case "ぇ":
					var after = "え";
					break;
				case "ぉ":
					var after = "お";
					break;
				case "ゃ":
					var after = "や";
					break;
				case "ゅ":
					var after = "ゆ";
					break;
				case "ょ":
					var after = "よ";
					break;
				case "っ":
					var after = "つ";
					break;
			}
			if (after !== null) {
				document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent.slice(0, -1) + after + '<span id="webime-userinput-cursor"></span>';
				webKeyboard.csPlaceholder();
			}
		});
	}
	using = true;
	for (var i = 0; i < elem.length; i++) {
		elem[i].addEventListener("click", function (e) {
			webKeyboard.edit(e);
		});
		elem[i].dataset.webime = nowArrayNum;
		if (option) {
			if (option.onEnter) {
				onEnter[nowArrayNum] = option.onEnter;
			} else {
				onEnter[nowArrayNum] = null;
			}
			if (option.placeholder) {
				placeholderText[nowArrayNum] = option.placeholder;
			} else {
				placeholderText[nowArrayNum] = "テキストを入力...";
			}
		}
		nowArrayNum++;
	}
}

//webKeyboard.addを適用済みの要素をクリックしたとき
webKeyboard.edit = function (e) {
	nowEdit = e.target;
	nowEditNum = nowEdit.dataset.webime;
	document.getElementById("webime-base").className = "";
	document.getElementById("webime-userinput").innerHTML = e.target.textContent + '<span id="webime-userinput-cursor"></span>';
	webKeyboard.csPlaceholder();
	imeMode = "ja";
	document.getElementById("webime-en").style.display = "none";
	document.getElementById("webime-ja").style.display = "block";
	document.getElementById("webime-je").innerHTML = "<b>あ</b>A";
	webKeyboard.addKeyboardEvent();
}
//完了ボタンクリック時
webKeyboard.continue = function () {
	nowEdit.textContent = document.getElementById("webime-userinput").textContent;
	document.getElementById("webime-base").className = "close";
	//onEnterを実行
	if (onEnter[nowEditNum] !== null) {
		onEnter[nowEditNum](document.getElementById("webime-userinput").textContent);
	}
	webKeyboard.removeKeyboardEvent();
}
//キーボードをクリックしたときの処理
webKeyboard.input = function (e) {
	var keyText = e.target.textContent;
	if (shift === true) {
		var text = keyText.toUpperCase();
	} else {
		var text = keyText.toLowerCase();
	}
	document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent + text + '<span id="webime-userinput-cursor"></span>';
	webKeyboard.csPlaceholder();
}

//文字列をテキストボックスに追加(ただし、小文字大文字はshiftの状況で自動変換)
webKeyboard.inputStr = function (text) {
	console.log("inputStr");
	if (shift == true) {
		var text = text.toUpperCase();
	} else if (shift == false) {
		var text = text.toLowerCase();
	}
	document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent + text + '<span id="webime-userinput-cursor"></span>';
	webKeyboard.csPlaceholder();
}

//テキストボックスが空のときにplaceholderを表示
webKeyboard.csPlaceholder = function () {
	var value = document.getElementById("webime-userinput").textContent;
	if (value.length == 0) {
		document.getElementById("webime-placeholder").style.display = "block";
		document.getElementById("webime-placeholder").textContent = placeholderText[nowEditNum];
	} else {
		document.getElementById("webime-placeholder").style.display = "none";
	}
}

//日本語・英語を切り替え
webKeyboard.changeJE = function () {
	//英語にする
	if (imeMode == "ja") {
		imeMode = "en";
		document.getElementById("webime-ja").style.display = "none";
		document.getElementById("webime-en").style.display = "block";
		document.getElementById("webime-je").innerHTML = "あ<b>A</b>";
	}
	//日本語にする
	else if (imeMode == "en") {
		imeMode = "ja";
		document.getElementById("webime-en").style.display = "none";
		document.getElementById("webime-ja").style.display = "block";
		document.getElementById("webime-je").innerHTML = "<b>あ</b>A";
	}
}

//Shiftのオンオフ
webKeyboard.changeShift = function () {
	//有効
	if (shift == false) {
		shift = true;
		document.getElementById("webime-shift").className = "on";
		var enKeys = document.querySelectorAll("#webime-en .webime-key");
		for (var i = 0; i < enKeys.length; i++) {
			enKeys[i].textContent = enKeys[i].textContent.toUpperCase();
		}
	}
	//無効
	else {
		shift = false;
		document.getElementById("webime-shift").className = "";
		var enKeys = document.querySelectorAll("#webime-en .webime-key");
		for (var i = 0; i < enKeys.length; i++) {
			enKeys[i].textContent = enKeys[i].textContent.toLowerCase();
		}
	}
}

//物理キーボードによる入力を有効
webKeyboard.addKeyboardEvent = function () {
	/*document.addEventListener("keypress", function keyboardEvent(e) {
		var key = e.key;
		console.log("pushed key:" + key);
		//英語のとき
		if (imeMode == "en") {
			if(key == "backspace"){
				webKeyboard.backSpace();
			}else{
			webKeyboard.inputStr(key);
			}
		}
	})*/
}

//物理キーボードによる入力を無効
webKeyboard.removeKeyboardEvent = function () {
	/*document.removeEventListener("keypress", KeyboardEvent);*/
}

//BackSpace
webKeyboard.backSpace = function () {
	document.getElementById("webime-userinput").innerHTML = document.getElementById("webime-userinput").textContent.slice(0, -1) + '<span id="webime-userinput-cursor"></span>';
	webKeyboard.csPlaceholder();
}
