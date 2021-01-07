<%@ WebHandler Language="C#" Class="makeJSON" %>

using System.Linq;

public class makeJSON : System.Web.IHttpHandler
{
  public void ProcessRequest (System.Web.HttpContext oContext)
  {
    //定義檔案列舉物件
    System.Collections.Generic.List<string> oFileLists = new System.Collections.Generic.List<string>();

    /* 尋訪目錄下所有的資料夾，是否有出現符合關鍵字檔名，有出現的話就加入到列表中 */
    //根目錄下所有的資料夾
    foreach (string oFolder in System.IO.Directory.GetDirectories(oContext.Request.MapPath("/"), "archive*", System.IO.SearchOption.AllDirectories))
    {
      foreach (var oFile in System.IO.Directory.GetFiles(oFolder, "*.html"))
      { oFileLists.Add(oFile); }
    }

    //定義檔案資料包
    var oFilePackage = new[] { new { D = "", T = "" } }.ToList();
    oFilePackage.Clear();

    //尋訪命中的內容，並擷取標題
    foreach (var oFile in oFileLists)
    {
      System.IO.FileInfo a = new System.IO.FileInfo(oFile);
      string aaa = (new System.IO.FileInfo(oFile)).Name;
      //讀取檔案中的<h1>標頭內容
      string cH1 = string.Empty;
      using (System.IO.StreamReader oSR = new System.IO.StreamReader(new System.IO.FileStream
        (
          oFile,
          System.IO.FileMode.Open,
          System.IO.FileAccess.Read,
          System.IO.FileShare.ReadWrite
        )
      ))
      {
        cH1 = oSR.ReadToEnd();
      }
      //解析<h1>
      string cRegExp = @"(<h1>)([\s\S]*?)(<\/h1>)";
      foreach (System.Text.RegularExpressions.Match oItem in System.Text.RegularExpressions.Regex.Matches(cH1, cRegExp, System.Text.RegularExpressions.RegexOptions.IgnoreCase))
      { cH1 = oItem.Groups[2].ToString(); }
      //將資訊添加到檔案資料包中
      oFilePackage.Add(
        new
        {
          //日期
          D = (new System.IO.FileInfo(oFile)).Name.Replace(".html", ""),
          //抬頭
          T = cH1
        }
      );
    }

    //因為要日期逆排，所以用LINQ進行逆排序後並輸出成LIST資料包
    oFilePackage = oFilePackage.OrderByDescending(x => x.D).ToList();

    //取得存檔目標路徑
    string cPath = oContext.Request.MapPath("/_data/");
    string cFileJson = $"{cPath}articles.json";
    string cFileText = $"{cPath}sitemap.txt";
    string cMessage = string.Empty;

    //寫入檔案
    try
    {
      //寫入JSON檔案（網站檔案列表用）
      using (System.IO.StreamWriter oSW = new System.IO.StreamWriter(cFileJson, append: false, encoding: System.Text.Encoding.UTF8))
      { oSW.Write(Newtonsoft.Json.JsonConvert.SerializeObject(oFilePackage, Newtonsoft.Json.Formatting.None)); }

      //寫入TEXT檔案（搜尋引擎索引用）
      using (System.IO.StreamWriter oSW = new System.IO.StreamWriter(cFileText, append: false, encoding: System.Text.Encoding.UTF8))
      {
        foreach (var oItem in oFilePackage)
        { oSW.WriteLine($"http://slashview.com/archive{(oItem.D.Substring(0, 4))}/{oItem.D}.html"); }
      }
      cMessage = "檔案寫入成功。";
    }
    catch (System.Exception oEx)
    { cMessage = string.Format("檔案寫入失敗：{0}", oEx.Message); }

    //輸出JSON報告（純粹讓管理者觀看用，無任何意義）
    oContext.Response.Clear();
    oContext.Response.Buffer = false;
    oContext.Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
    oContext.Response.HeaderEncoding = System.Text.Encoding.UTF8;
    oContext.Response.ContentType = System.Web.MimeMapping.GetMimeMapping(".json");
    oContext.Response.Write(
      Newtonsoft.Json.JsonConvert.SerializeObject(
        new
        {
          cMessage = cMessage,
          cDate = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        },
        Newtonsoft.Json.Formatting.Indented
      )
    );
    oContext.Response.Flush();
    oContext.ApplicationInstance.CompleteRequest();
  }

  public bool IsReusable { get { return false; } }
}