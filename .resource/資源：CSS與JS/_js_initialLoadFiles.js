/* 因為Google也會去爬NeoCities的網站，這樣會造成我方網頁的內容被Google視為兩份一模一樣的網頁，在考量Google有可能會因此降低網頁排名的情況下，因此將偵測到NeoCities的網址全部導回slashlook.com */
(function(){
	var cFind = "slashlook.neocities.org";
	if (window.location.hostname === cFind) {
		var cURL = window.location.href;
		var cUrlFinal = cURL.substring(cURL.indexOf(cFind) + cFind.length);
		window.location.href = "//slashlook.com" + cUrlFinal;
	}
})(); 

/* 動態載入 JavaScript, Css 涵式 */
var LoadFile = function(cType, cUrl, fCallBack) {
  var oDom;
  if (cType === "js") {
		oDom = document.createElement("script");
		oDom.setAttribute("src", cUrl);
		//特別針對jQuery進行確定載入處理
		if(cUrl.indexOf("jquery.min.js") !== -1){
			if(oDom.readyState){
				//Browser:IE
				oDom.onreadystatechange = function(){
					if (oDom.readyState === "loaded" || oDom.readyState === "complete") {
						oDom.onreadystatechange = null;
						fCallBack();
					}
				};
			}else{
				//Browser:Others
				oDom.onload = function(){	fCallBack(); };
			}
		}
	} else if (cType === "css") {
		oDom = document.createElement("link");
		oDom.setAttribute("rel", "stylesheet");
		oDom.setAttribute("href", cUrl);
	}
	document.getElementsByTagName("head")[0].appendChild(oDom);
};

/*
在一般的情況下，本文HTML裡面的JavaScript一定會被先執行，但是在這個網站的例子裡面剛好相反，我們會希望先去運行全網站繪製的JavaScript，再來運行本文裡的JavaScript。
不幸的是，這兩段程式碼通常都被塞在DocumentReady裡面，但是jQuery的DocumentReady是不允許進行排序的，也就是瀏覽器會優先跑本文JavaScript，再運行全站繪製JavaScript。
這樣的現象尤其在行動裝置瀏覽器按下「重新整理」鈕時更會發生，要解決這個問題，比較高級的可以用Queue的觀念來重新設計，
另外較不優雅的方式就是想要比較晚執行的DocumentReady就使用TimeOut來進行延遲。
*/

//陣列將存放全站想要放在DocumentReady內跑的程序
var aryExecuteList = new Array();
//函式將要執行的程式碼，以及想要的優先權，以Queue的方式推入陣列中
var pushToExecuteList = function(fCode, iPriority){
    aryExecuteList.push({
        method: fCode,
        priority: iPriority
    });
};

/* 確定網頁的jQuery是否已經可用。由於動態載入的關係，因此以後在處理jQuery的相關事務，都要利用CallBack寫在這裡面 */
var jQueryIsReady = function(fCallBack){
	if(window.$){
		fCallBack();
	}else{
		window.setTimeout(function(){ jQueryIsReady(fCallBack); }, 1);
	}
};

/* 載入必要的 JavaScript, Css ... */
(function(){
	//Css可以平行載入，無優先權問題
	LoadFile("css", "//netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
  LoadFile("css", "/_resource/css/_css_highlight.css");     //程式碼高亮度
  LoadFile("css", "/_resource/css/_css_customize.min.css"); //網站基底
	/*
	理論上這些JavaScript都是要平行載入的，但是因為jQuery實在太重要了，因此必須確定他載入完再去驅動其它的載入。
	雖然可以保證jQuery一定會先載入完成後，再去載入其它的Javascript，但是其實同時間內，瀏覽器還會繼續去往下讀取
	解析其它DOM文件（*.html主體本文），因此還是會跑到本文中撰寫的<script>區段，如果裡面剛好有引用到jQuery的功能
	的話，那麼這樣的機制仍然是無法保證jQuery會被正確的運行的。例如裡面寫到：$(document).ready()，但此刻的瀏覽器
	根本不認識誰是$,jQuery，因為jQuery的JavaScript有可能還在Load當中。因此需要jQueryIsReady涵式來進行把關。
	*/
  LoadFile("js", "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js", function () {
    LoadFile("js", "//netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"); //Bootstrap
    LoadFile("js", "/_resource/js/_js_highlight.js");                                //程式碼高亮度
    LoadFile("js", "/_resource/js/_js_createAllWebsite.min.js");                     //網站基底
	});
})();