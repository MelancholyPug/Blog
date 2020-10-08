/* 定義一個全域資料總物件，方便之後各函數之間的引用 */
//oSite全域資料總物件
var oSite = new Object();

//記載現在的網址路徑
oSite.cUrlPath = window.location.pathname;

//記載Menu Bar的程式碼
oSite.cMenuBar = "<div class='navbar navbar-inverse navbar-fixed-top'><div class='container'><div class='navbar-header'><button type='button' class='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'><span class='icon-bar'></span><span class='icon-bar'></span><span class='icon-bar'></span></button><span class='navbar-brand pull-left' style='margin-top:-1px'><img class='navbar-brand-logo' src='/_resource/image/_img_logo.png' /></span><a class='navbar-brand' href='/index.html'>SlashView</a></div><div class='collapse navbar-collapse'><ul id='nav-items' class='nav navbar-nav'><li><a href='/_resource/html/articles.html'>articles</a></li><li><a href='/_resource/html/aboutNcontact.html'>about &amp; contact</a></li><li><a href='/_resource/html/search.html'>search</a></li></ul></div></div></div>";

//記載全網站是否已經有（顯示）公告過鼓勵點擊廣告對話框
oSite.bAdsAnnouncement = false;

//紀錄是否為BloggerAds官方管理IP
oSite.bAdsAdministrator = false;

//是否為「文章主體」文件
if (oSite.cUrlPath.indexOf("/archive") === -1) {
  oSite.bArticles = false;
} else {
  oSite.bArticles = true;
}

//如果是文章的話，就紀錄現在的日期
var cArticlesDate = oSite.cUrlPath.substring(oSite.cUrlPath.indexOf(".html") - 8, oSite.cUrlPath.indexOf(".html"));

//將要進行DocumentReady的程序，推入佇列中
pushToExecuteList(function () {
  /* Insert Head: Google Canonical Link */
  if (oSite.bArticles) {
    $("<link rel='canonical' href='http://slashview.com/archive" + cArticlesDate.substring(0, 4) + "/" + cArticlesDate + ".html'/>").appendTo("head");
  }

  /* Insert Blocks: Menu bar & contents process */
  if (oSite.bArticles) {
    var cTempBody = $("body").html();	// Cache original articles-content if available
    $("body").html(oSite.cMenuBar + "<div class='container'><div class='row'><div id='main-contents' class='col-md-12'></div></div></div>");
    $("#main-contents").html(cTempBody);
  } else {
    $(oSite.cMenuBar).prependTo("body");	// Package all contents into Bootstrap container
  }

  /* Insert Blocks: Disqus & Ads */
  if (oSite.bArticles) {
    $("<div class='container'><div class='row'><div class='col-md-8 col-sm-8'><button id='btnLoadGuestbook' class='btn btn-primary btn-lg btn-block' type='button'>訪客留言板 / Guestbook</button><div id='disqus_thread'></div></div><div class='col-md-4 col-sm-4'><div id='AdvertisementBottom'><div id='BloggerAdsBottom'></div></div></div></div></div>").appendTo("body");
  }

  /* Insert Blocks: Disqus & Ads (backup for google) */
	/*
	if(oSite.bArticles){
		$("<div class='container'><div class='row'><div class='col-md-7 col-sm-6'><button id='btnLoadGuestbook' class='btn btn-primary btn-lg btn-block' type='button'>點選此處開啟留言板 / Disqus Guestbook</button><div id='disqus_thread'></div></div><div class='col-md-5 col-sm-6'><div id='AdvertisementBottom'><div id='GoogleAdSenseBottom'><p>Google Ads</p></div><div id='BloggerAdsBottom'><p>BloggerAds Sticker</p></div></div></div></div></div>").appendTo("body");
	}
	*/

  /* Insert Blocks: Footer */
  $("<div class='container'><div class='row'><div class='col-md-12'><div class='footer'><p class='footer-color'>Copyright <span class='glyphicon glyphicon-copyright-mark'></span> 2013 by <a href='/_resource/html/aboutNcontact.html'><strong>SlashView</strong></a> Inc. All Rights Reserved.</p></div></div></div></div>").appendTo("body");

  /* Make <pre> tag code Highlight */
  $("pre").each(function (i, block) {
    hljs.highlightBlock(block);
  });

}, 1);	//Priority:1

/* 當jQuery真正具備運行能力的時候... */
jQueryIsReady(function () {
  //執行整個網站在DOM完成後想要運行的項目
  $(document).ready(function () {
    //每呼叫一次，就進行一次正向排序，由低至高（數字越低越優先）
    aryExecuteList.sort(function (a, b) { return a.priority - b.priority; });
    //列舉出待執行陣列內部的相關方法，並逐一呼叫
    $.each(aryExecuteList, function (i, item) {
      //開始執行DocumentReady的動作，將待運行的程式取出運作
      item.method();
    });
  });

  //美化優化等東西，擺在windowLoad時期做
  $(window).load(function () {
    /* Styling: <h1> tag */
    if (oSite.bArticles) { $("h1").wrap("<div class='title title-color'></div>"); }

    /* Styling: Articles Date */
    if (oSite.bArticles) {
      cArticlesDate = "&nbsp;" + cArticlesDate.substring(0, 4) + "/" + cArticlesDate.substring(4, 6) + "/" + cArticlesDate.substring(6, 8);
      $("div.title.title-color").after("<div class='date-time'><span class='glyphicon glyphicon-th-large'></span>" + cArticlesDate + "</div>");
    }

    /* Styling: Keywords */
    var cMetaKeywords = "";
    if (oSite.bArticles) {
      $("small").replaceWith(function () {
        var cTemp = "";
        var aryKeywords = $(this).text().split(" ");
        $.each(aryKeywords, function (iTemp) {
          cTemp += "<span class='label label-success'>#" + aryKeywords[iTemp] + "</span> ";
          cMetaKeywords += aryKeywords[iTemp];
          if (iTemp < aryKeywords.length - 1) { cMetaKeywords += ", "; }
        });
        return "<div class='keywords'>" + cTemp + "</div>";
      });
    }

    /* Styling: Navigation bar Active */
    if (oSite.cUrlPath.indexOf("articles") !== -1) {
      $("#nav-items > li").each(function () {
        if ($(this).find("a").text() === 'articles') { $(this).addClass("active"); }
      });
    } else if (oSite.cUrlPath.indexOf("aboutNcontact") !== -1) {
      $("#nav-items > li").each(function () {
        if ($(this).find("a").text() === 'about & contact') { $(this).addClass("active"); }
      });
    } else if (oSite.cUrlPath.indexOf("search") !== -1) {
      $("#nav-items > li").each(function () {
        if ($(this).find("a").text() === 'search') { $(this).addClass("active"); }
      });
    }

    /* Styling: Bootstrap <pre>, <img> */
    if (oSite.bArticles) {
      $("pre").addClass("pre-scrollable");
      $("#main-contents > img").addClass("img-thumbnail");
      $("#main-contents > a > img").addClass("img-thumbnail");
    }

    /* Normalizing: Create Browser Icon */
    $("<link rel='shortcut icon' href='/_resource/image/_favicon.ico'/>").appendTo("head");

    /* Normalizing: Create Title Tag */
    $("<title></title>", { text: $("h1").text() }).appendTo("head");

    /* Normalizing: Create Android Chrome Theme */
    $("head > meta:eq(0)").after("<meta name='theme-color' content='#719D06'>");

    /* Normalizing: Create Meta Keyword, Viewport Tag */
    if (oSite.bArticles) {
      $("head > meta:eq(0)").after("<meta name='keywords' content='" + cMetaKeywords + "'>");
      $("head > meta:eq(0)").after("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
    } else {
      //如果不是內容頁，那就只要加入Meta Viewport就好
      $("head > meta:eq(0)").after("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
    }

    /* Initial: Disqus & Google AdSense */
    if (oSite.bArticles) {
      //為了解決低端裝置對於讀取Disqus留言板的延遲性，因此設計了動態按鈕來進行後顯示
      $('#btnLoadGuestbook').click(function () {
        LoadFile("js", "//slashviewblog.disqus.com/embed.js");
        $(this).fadeOut('slow', function () {
          $('#disqus_thread').show();
        });
      });

      //Check Administrator IP (-402384043 = 230.31.163.118 with REVERSE)
      $.getJSON("https://api.ipify.org?format=jsonp&callback=?", function (data) {
        if ((function () { l = data.ip; ll = 0; if (0 === l.length) return ll; for (i = 0; i < l.length; i++)lll = l.charCodeAt(i), ll = (ll << 5) - ll + lll, ll &= ll; return ll })() === -402384043) { oSite.bAdsAdministrator = true; }
      });

      // Insert Advertisment Block
      $("#main-contents").find("p:eq(0)").after("<div id='AdvertismentInline' class='row'><div id='BloggerAdsInline1' class='col-md-6'></div><div id='BloggerAdsInline2' class='col-md-6'></div><div>");

      // Insert Advertisment Block (backup for google)
      //$("#main-contents").find("p:eq(0)").after("<div id='AdvertismentInline' class='row'><div id='GoogleAdSenseInline' class='col-md-6'></div><div id='BloggerAdsInline' class='col-md-6'></div><div>");

			/* Google Ads backup
			// Load Google JS
			LoadFile("js", "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
			// Google AdSense Inline
			$("<ins class='adsbygoogle' style='display:inline-block;width:320px;height:100px' data-ad-client='ca-pub-8735686564465715' data-ad-slot='3733444786'></ins>").appendTo("#GoogleAdSenseInline");
			// Google AdSense Bottom
			$("<ins class='adsbygoogle' style='display:inline-block;width:200px;height:200px' data-ad-client='ca-pub-8735686564465715' data-ad-slot='8964223188'></ins>").appendTo("#GoogleAdSenseBottom");
			// Google AdSense launch
			for(i=0;i<2;i++){ (adsbygoogle=window.adsbygoogle||[]).push({}); }
			*/

      // BloggerAds Process（If not BloggerAds Administrator IP then show Ads in iFrame tag.）
      if (!oSite.bAdsAdministrator) {
        //BloggerAds BannerAds-1
        setTimeout(function () {
          $("<iframe src='/_resource/html/_bloggerAdsInline1.html' scrolling='no' frameborder='0' allowtransparency='true' style='height:120px;width:100%;'></iframe>").appendTo("#BloggerAdsInline1");
        }, 2000);

        //BloggerAds BannerAds-2
        setTimeout(function () {
          $("<iframe src='/_resource/html/_bloggerAdsInline2.html' scrolling='no' frameborder='0' allowtransparency='true' style='height:120px;width:100%;'></iframe>").appendTo("#BloggerAdsInline2");
        }, 4000);

        //BloggerAds ButtonAds
        setTimeout(function () {
          $("<iframe src='/_resource/html/_bloggerAdsBottom.html' scrolling='no' frameborder='0' allowtransparency='true' style='height:370px;width:100%;'></iframe>").appendTo("#BloggerAdsBottom");
        }, 6000);
      }

      // IP Logger  Bottom Initial
      var iRandomNumber = 10000000 + Math.floor(Math.random() * 90000000);
      $("<div class='hidden'><img src='http://iplogger.org/1kS8.jpg?" + iRandomNumber + "'/></div>").appendTo("#BloggerAdsBottom");
    }
  });

  //彈出苦情公告視窗，請使用者點選廣告
  /*
  $("<div id='mdAdsAnnouncement' class='modal fade' tabindex='-1' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span> 好文章需要您的鼓勵</h4></div><div class='modal-body'><p>如果這篇文章對您有幫助的話請麻煩支持一下。您「小小的協助」雖然杯水車薪，但可以支持我更有繼續撰寫與營運下去的動力。</p><p>此外，您應該可以發現網站已經保留90%以上的版面空間來放置滿版的內容，不去干擾您閱讀的樂趣。所以如果您有使用AdBlock之類的廣告屏蔽軟體的話，麻煩幫忙將本網站加入白名單一下。</p><p>在此先謝謝您的鼎力相助。</p></div><div class='modal-footer'><button type='button' class='btn btn-lg btn-success' data-dismiss='modal'><span class='glyphicon glyphicon-ok' aria-hidden='true'></span> 舉手之勞，我願意幫忙</button></div></div></div></div>").appendTo("body");
  $(window).on("scroll", function () {
    var iScrollHeight = $(document).height();
    var iScrollPosition = $(window).height() + $(window).scrollTop();
    if (oSite.bArticles && !oSite.bAdsAdministrator && !oSite.bAdsAnnouncement && ((iScrollHeight - iScrollPosition) / iScrollHeight === 0)) {
      //捲到底部後，顯示對話方框，當對話方框消失後，捲到頁面最頂端
      $('#mdAdsAnnouncement').modal('show').on('hidden.bs.modal', function (e) {
        oSite.bAdsAnnouncement = true;
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      });
    }
  });
  */
});