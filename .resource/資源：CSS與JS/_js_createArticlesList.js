/* ***
這個類別最主要的動作，就是透過jQuery取得一個大量資料的JSON後，直接產生出一個Table，還有一個分頁導行。
撰寫時間為2013年，因此還是採用HashBang的實作方式，沒有採用HTML5的HistoryAPI實作pushState，因為pushState在IE10後才有支援。
註：Google有建議改成pushState方式會比較好。
*** */

/* 定義一個全域資料總物件，方便之後各函數之間的引用 */
var oData = new Object();				//oData全域資料總物件
oData.iRecordsPerPage = 10;			//每頁幾筆資料
oData.iPagesPerNavigation = 10;	//導航列一次顯示幾頁
oData.iTotalRecords;						//總筆數
oData.iTotalPages;							//總頁數
oData.iCurrentPage;							//現在工作於第幾頁
oData.iRecordsStart;						//此頁資料索引起始值
oData.iRecordsEnd;							//此頁資料索引終止值
oData.iCurrentNavSection;				//導航列現在在第幾節
oData.iNavPagesStart;						//導航列起始頁面數
oData.iNavPagesEnd;							//導航列終止頁面數
oData.aryArticlesData;					//記錄JSON傳回資料

//利用UrlHash取得目前的Page指標
oData.getCurrentPage = function(){
	var	cTemp = window.location.hash;
	if(cTemp.length == 0 || cTemp.indexOf("#") == -1){
		oData.iCurrentPage = 1;
	}else{
		cTemp = cTemp.substring(cTemp.indexOf("#") + 1);
		if(parseInt(cTemp, 10) != "NaN" && parseInt(cTemp, 10) > 0){
			oData.iCurrentPage = parseInt(cTemp, 10);
		}else{
			oData.iCurrentPage = 1;
		}
	}
};

//利用jQuery取得JSON資料
oData.getArticlesData = function(){
	if(oData.aryArticlesData === undefined){
		var oDate = new Date();
		$.ajax({
			url: "/_data/articles.json?" + oDate.getFullYear().toString() + (oDate.getMonth() + 1).toString() + oDate.getDate().toString()
		}).done(function(data){
			if(data.length > 0){
				oData.aryArticlesData = data;
				oData.iTotalRecords = data.length;
				updateArticlesInformation();	//資料取得成功，呼叫更新畫面資料
			}else{	//取回的JSON出現無法預期的錯誤（回傳成功，但內容是零）
				oData.aryArticlesData = undefined;
				oData.iTotalRecords = 0;
			}
		});
	}
};

//計算與更新其它數據
oData.setVariable = function(){
	//計算總筆數
	if(oData.iTotalRecords % oData.iRecordsPerPage == 0){
		oData.iTotalPages = Math.floor(oData.iTotalRecords / oData.iRecordsPerPage);
	}else{
		oData.iTotalPages = Math.floor(oData.iTotalRecords / oData.iRecordsPerPage) + 1;
	}	
	//修正「現在頁數大於總頁數」不合理的狀況
	if(oData.iCurrentPage > oData.iTotalPages){	oData.iCurrentPage = oData.iTotalPages; }
	//計算此頁的資料索引終止值
	oData.iRecordsEnd = oData.iCurrentPage * oData.iRecordsPerPage;
	//計算此頁的資料索引起始值
	oData.iRecordsStart = oData.iRecordsEnd - oData.iRecordsPerPage;
	//計算導航列現在在第幾節
	if(oData.iCurrentPage % oData.iPagesPerNavigation == 0){
		oData.iCurrentNavSection = Math.floor(oData.iCurrentPage / oData.iPagesPerNavigation);
	}else{
		oData.iCurrentNavSection = Math.floor(oData.iCurrentPage / oData.iPagesPerNavigation) + 1;
	}
	//導航列終止頁面數
	oData.iNavPagesEnd = oData.iCurrentNavSection * oData.iPagesPerNavigation;
	//導航列起始頁面數
	oData.iNavPagesStart = oData.iNavPagesEnd - (oData.iPagesPerNavigation - 1);
};

//將要進行DocumentReady的程序，推入佇列中
pushToExecuteList(function(){
	//在網頁第一次載入時，先進行一次JSON資料的取得
	oData.getArticlesData();
	/*
	利用OnHashChange事件來觸發更新涵式。這裡本來要考量IE8以下的瀏覽器並不支援OnHashChange，
	但既然本網站都選擇了jQuery2.x，表示IE9以下的都放棄不能執行了，所以干脆就不考慮了。
	*/
	window.onhashchange = updateArticlesInformation;
}, 2);	//Priority:2

/* 更新由UrlHash取得，應該顯示的正確資料 */
function updateArticlesInformation(){
	oData.getArticlesData();	//取得資料
	oData.getCurrentPage();		//取得現在頁面數
	oData.setVariable();			//更新物件中所有需要重新計算的變數
	createJson2Table();				//建立JSON To TABLE
	createNavigationBar();		//建立導航列
}

/* 將JSON資料轉成TABLE */
function createJson2Table(){
	var oTempObj = $("#articles-list > table.table-striped.table-hover > tbody").empty();
	for(i = oData.iRecordsStart; i < oData.iRecordsEnd; i++){
		var item;
		if(i < oData.aryArticlesData.length){
			item = oData.aryArticlesData[i];
		}else{
			return;
		}
		$("<tr></tr>").append(
			$("<td class=\"hidden-sm hidden-xs\"></td>").text(i + 1),
			$("<td class=\"hidden-xs\"></td>").text(function(){
				return item.D.substring(0, 4) + "/" + item.D.substring(4, 6) + "/" + item.D.substring(6, 8);
			}),
			$("<td></td>").text(item.T),
			$("<td></td>").html(function(){
				return "<a class='btn btn-danger btn-sm' href='/articles_" + item.D + ".html'>點擊閱讀</a>";
			})
		).appendTo(oTempObj);
	}
}

/* 建立導航分頁列 */
function createNavigationBar(){
	var oTempObj = $("#pagging-list > ul.pagination").empty();
	//上一節
	if((oData.iNavPagesStart - 1) <= 0){
		$("<li class='disabled'><span>&laquo;</span></li>").appendTo(oTempObj);
	}else{
		$("<li><a href='#" + (oData.iNavPagesStart - 1) + "'>&laquo;</a></li>").appendTo(oTempObj);
	}
	//產生此節頁面
	for(i=oData.iNavPagesStart; i<=oData.iNavPagesEnd; i++){
		if(i == oData.iCurrentPage){
			$("<li class='active'><span>" + i + "<span class='sr-only'>(current)</span></span></li>").appendTo(oTempObj);
		}else if(i > oData.iTotalPages){
			$("<li class='disabled'><span>" + i + "</span></li>").appendTo(oTempObj);
		}else{
			$("<li><a href='#" + i + "'>" + i + "</a></li>").appendTo(oTempObj);
		}
	}
	//下一節
	if((oData.iNavPagesEnd + 1) > oData.iTotalPages){
		$("<li class='disabled'><span>&raquo;</span></li>").appendTo(oTempObj);
	}else{
		$("<li><a href='#" + (oData.iNavPagesEnd + 1) + "'>&raquo;</a></li>").appendTo(oTempObj);
	}
}