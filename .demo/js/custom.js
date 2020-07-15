$(document).ready(function () {
  //定時執行
  setInterval(function () {
    //取得現在時間並更新
    oTimeNow = moment();
    $("#uTimeNow").text(oTimeNow.format("HH:mm:ss"));

    //定義變數
    var iNextInterval = 1;   //過期多久就拋棄本場次，更換到下一場（分鐘）
    var iPrepare = 0;   //預備入場時間（分鐘）
    var iAllowLogin = 3;   //允許考前可預先登入練習（分鐘）
    var iAllowDelay = 0;   //允許可遲到時間（分鐘）
    var iAllowPrint = 16;  //允許可列印缺考統計時間（分鐘）；可能是有顧及到身心障礙考生所致，透過觀察在每節的「15+1分鐘」後系統才開放可列印
    var iAllowLeave = 45;  //允許可離開考場時間（分鐘）
    var iClassNumber = 0;   //目前處於第幾節次
    var oTimePrepare;        //預備考試時間
    var oTimeLogin;          //可登入時間
    var oTimeStart;          //考試開始時間
    var oTimeDisabled;       //禁止入場時間
    var oTimePrint;          //允許列印缺考統計時間
    var oTimeFinish;         //允許繳卷時間
    var oTimeStop;           //考試終止時間

    //計算最適合的時間區間
    for (i = 0; i < oData.length; i++) {
      var oTimeBase = moment(oData[i].cStart, "HH:mm:ss");
      iClassNumber = i + 1;
      //是否為第一節課
      if (oData[i].bIsFirstClass) { iPrepare = 20; iAllowDelay = 15; }
      else { iPrepare = 5; iAllowDelay = 15; }  //2020年不限身分節次，一律改允許遲到15分鐘
      //計算其餘相關時間
      oTimePrepare = oTimeBase.clone();
      oTimeLogin = oTimeBase.clone().add(iPrepare - iAllowLogin, "minutes");
      oTimeStart = oTimeBase.clone().add(iPrepare, "minutes");
      oTimeDisable = oTimeStart.clone().add(iAllowDelay, "minutes");
      oTimePrint = oTimeStart.clone().add(iAllowPrint, "minutes");
      oTimeFinish = oTimeStart.clone().add(iAllowLeave, "minutes");
      //是否為兩小時等級考試
      if (!oData[i].bIs2HR) { oTimeStop = oTimeStart.clone().add(1, "hours"); }
      else { oTimeStop = oTimeStart.clone().add(2, "hours"); }
      //計算是否要進行本場次的拋棄，以利更換到下一場
      if (!oTimeNow.isAfter(oTimeStop.clone().add(iNextInterval, "minutes"))) { break; }
    }

    //顯示所有已經計算過的時間
    $("#uTimePrepare").text(oTimePrepare.format("HH:mm:ss"));
    $("#uTimeLogin").text(oTimeLogin.format("HH:mm:ss"));
    $("#uTimeStart").text(oTimeStart.format("HH:mm:ss"));
    $("#uTimeDisable").text(oTimeDisable.format("HH:mm:ss"));
    $("#uTimePrint").text(oTimePrint.format("HH:mm:ss"));
    $("#uTimeFinish").text(oTimeFinish.format("HH:mm:ss"));
    $("#uTimeStop").text(oTimeStop.format("HH:mm:ss"));

    //定義檢核符號
    var cChecked = "<i class='fas fa-check fa-fw text-success'></i>";
    var cNotAvailable = "<i class='fas fa-minus fa-fw text-muted'></i>";

    //顯示當前時間進度（時間有經過就核勾）
    if (oTimeNow.isAfter(oTimePrepare)) {
      $("#uTimePrepare").next().html(cChecked);
      //完全結束：最後一堂考試 && 現在時間已經超過考試截止時間
      if ((iClassNumber == oData.length) && oTimeNow.isAfter(oTimeStop)) { $("#uClassInfo").html("今日考試結束"); }
      else { $("#uClassInfo").html("第 " + iClassNumber + " 節／進行"); }
    }
    else {
      $("#uTimePrepare").next().html(cNotAvailable);
      $("#uClassInfo").html("第 " + iClassNumber + " 節／準備");
    }

    if (oTimeNow.isAfter(oTimeLogin)) { $("#uTimeLogin").next().html(cChecked); }
    else { $("#uTimeLogin").next().html(cNotAvailable); }

    if (oTimeNow.isAfter(oTimeStart)) { $("#uTimeStart").next().html(cChecked); }
    else { $("#uTimeStart").next().html(cNotAvailable); }

    if (oTimeNow.isAfter(oTimeDisable)) { $("#uTimeDisable").next().html(cChecked); }
    else { $("#uTimeDisable").next().html(cNotAvailable); }

    if (oTimeNow.isAfter(oTimePrint)) { $("#uTimePrint").next().html(cChecked); }
    else { $("#uTimePrint").next().html(cNotAvailable); }

    if (oTimeNow.isAfter(oTimeFinish)) { $("#uTimeFinish").next().html(cChecked); }
    else { $("#uTimeFinish").next().html(cNotAvailable); }

    if (oTimeNow.isAfter(oTimeStop)) { $("#uTimeStop").next().html(cChecked); }
    else { $("#uTimeStop").next().html(cNotAvailable); }

  }, 1000);
});