/* 宣告搜尋用變數物件 */
var oPreSearchConfig = {
	siteURL: "slashlook.com",	//要搜尋的目標網域
	type:	"web",							//搜尋的對象可以是不一樣的，例如:圖片、影片...
	itemsPerPage: 8,					//傳回結果集每次的筆數，Google規定最大八筆
	nowPage: 0,								//傳回結果集的頁面啟始數
	append: false							//是否持續對結果內容新增
}

/* 送出至 Google Search 並取得傳回值 */
function runGoogleSearch(oRealSearchConfig){
	//利用extend將兩個控制物件進行覆蓋式的結合
	oRealSearchConfig = $.extend({}, oPreSearchConfig, oRealSearchConfig);
	//建立搜尋字串
	oRealSearchConfig.cSearchString = "site:" + oRealSearchConfig.siteURL + " " + $("#cKeyword").val();
	//定義Google Search API Url字串
	var cGoogleSearchAPI = "http://ajax.googleapis.com/ajax/services/search/" + oRealSearchConfig.type + "?v=1.0&callback=?";
	//利用AJAX取得JSON資料
	$.getJSON(cGoogleSearchAPI, {
		q	: oRealSearchConfig.cSearchString,
		rsz	: oRealSearchConfig.itemsPerPage,
		start	: oRealSearchConfig.nowPage * oRealSearchConfig.itemsPerPage
	}, function(data){
		var oResults = data.responseData.results;	//Google傳回來的是一個大型的JSON物件，因此先定義等一下要操作的結果集物件比較方便
		var oCursor = data.responseData.cursor;		//取得現在的資料指標
		var oDisplay = $("#Search-Result");				//定義結果集顯示物件
		//如果有更多結果集的按鈕，就先移除
		$("#Search-Result-More").remove();
		//檢查傳回的JSON結果集中，是否有資料
		if(oResults.length){
			//如果在有結果的情況下，使用者重新進行查詢，那麼系統會重新送出oPreSearchConfig，
			//代表append屬性會被洗回false，這是就要把結果集的顯示清空，以防一直被往下新增
			if(!oRealSearchConfig.append){ oDisplay.empty(); }
			//進行結果集顯示的產生
			$.each(oResults, function(i, item){
				oDisplay.append(parseResults(item));
			});
			//畫面優化動作
			//oDisplay.hide().fadeIn("fast");
			//如果指標傳回來的下一次結果集總數，大於下一頁顯示的結果集總數，那就表示可以產生下一頁結果
			if(((oRealSearchConfig.nowPage + 1) * oRealSearchConfig.itemsPerPage) < oCursor.estimatedResultCount){
				$("<a></a>", {
					id: "Search-Result-More",
					class: "btn btn-danger",
					text: "更多結果"
				}).appendTo(oDisplay).click(function(){
					runGoogleSearch({
						append: true,
						nowPage: (oRealSearchConfig.nowPage + 1)
					});
					$(this).fadeOut("slow");
				});
			}
		}else{
			oDisplay.empty();
			$("<p>", {
				className: "notFound",
				html: "對不起！在這個網站內找不到您要的關鍵字之資料！（No Results Found.）"
			}).hide().appendTo(oDisplay).fadeIn("slow");
		}
	});
}

/* 解析結果集中的每一筆資料 */
function parseResults(data){
	//Google傳回的結果集中，每一筆結果的資料裡面，都會帶有一個GsearchResultClass的屬性，
	//你可以透過這個屬性來判斷是哪一種類型的搜尋結果，例如：GwebSearch, GimageSearch, GvideoSearch,
	//GnewsSearch，但本程式中只有使用到web搜尋，因此還是保留一下SelectCase結構，但是只有實作GwebSearch的解析。
	var cTemp = "";
	switch(data.GsearchResultClass){
		case "GwebSearch":
			cTemp = 
				"<div class='webResult'>" + 
				"<h4><a href='" + data.url + "'>" + data.title + "</a></h4>" + 
				"<p>" + data.content + "</p>" + 
				"</div>";
			break;
	}
	return cTemp;
}