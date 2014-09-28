/**
 * 此脚本为网络访问规则匹配脚本，包括直连访问、通过代理访问
 * 脚本维护人：OWenT
 * 更新：2014/09/05
 */

function FindProxyForURL(url, host) {
    if (CheckIPv4(host))
        return GetDefaultProxyCfg();
    
    if (DomainGFWProxyCheck(url, host))
        return GetGFWProxyCfg();
   
    // if (isInNet(host, "10.0.0.0",  "255.0.0.0")){
    //     return "DIRECT";
    // }
   return GetDefaultProxyCfg(); 
}

function GetSocks5Proxy() {
    return "172.18.111.3:8001";
}

function GetHttpProxy() {
    return "172.18.111.3:9001";
}

function GetDefaultProxyCfg() {
    return "DIRECT";
}

function GetGFWProxyCfg() {
    return "SOCKS5 " + GetSocks5Proxy() + "; PROXY " + GetHttpProxy() + "; DIRECT";
}


//特定域名访问，走代理
function DomainGFWProxyCheck(url, host) {
    var domains = [
        "*.af.mil",
        "*.afp.com",
        "*.afp-direct.com",
        "*.agoda.com",
        "*.agoda.net",
        "*.amazon.com",
        "*.android.com",
        "appspot.com",
        "*.appspot.com",
        "*audioview.conferencing.com",
        "*.badoo.com",
        "*.bild.t-online.de",
        "*.bizspring.net",
        "*.blizzard.com",
        "*.blogblog.com",
        "*.blogger.com",
        "*.blogspot.com",
        "*.booking.com",
        "*.boston.com",
        "*.bus.umich.edu",
        "*.careerbuilder.com",
        "*.castleagegame.com",
        "castleagegame.com",
        "chromium.org",
        "*.chromium.org",
        "cloudapp.net",
        "*.cloudapp.net",
        "cloudfront.net",
        "*.cloudfront.net",
        "*.cnbc.com",
        "*.cnn.com",
        "*.codeguru.com",
        "*.conferencing.com",
        "*.corrieredellosport.it",
        "*.corriere.it",
        "*.dice.com",
        "discuss.com.hk",
        "*.discuss.com.hk",
        "*.dropbox.com",
        "*.e3expo.com",
        "*.egotastic.com",
        "*.emarketer.com",
        "*.e.nikkei.com",
        "facebook.com",
        "*.facebook.com",
        "*.fastly.net",
        "*.fbcdn.net",
        "*.feedburner.com",
        "fibaasia.net",
        "*.fibaasia.net",
        "*.football365.com",
        "*.football.guardian.co.uk",
        "*.ft.com",
        "*.gailly.net",
        "*.gamebase.com.tw",
        "*.gamer.com.tw",
        "*.gazzetta.it",
        "*.gbc.tw",
//        "github.com",
//        "*.github.com",
        "*.glassdoor.com",
        "*.goldengame.com.tw",
        "google*.*",
        "*.google*.*",
        "*.googleusercontent.com",
        "gstatic.com",
        "*.gstatic.com",
        "*.guardian.co.uk",
        "*.hkjc.com",
        "*.home.skysports.com",
        "hootsuite.com",
        "*.hootsuite.com",
        "*.hosted.ap.org",
        "hulu.com",
        "*.hulu.com",
        "*.huluim.com",
        "i1.hk",
        "*.i1.hk",
        "*.ibibo.com",
        "*.imdb.com",
        "*.insead.edu",
        "*.insidefacebook.com",
        "*.insidesocialgame.com",
        "kenexa.com",
        "*.kenexa.com",
        "*.kicker.de",
        "knorex.asia",
        "*.knorex.asia",
        "*.ku.edu",
        "*.lacitylimo.com",
        "*.lastampa.it",
        "*.libpng.org",
        "*.marca.com",
        "me2day.com",
        "*.me2day.com",
        "*.milw0rm.com",
        "*.mitsloan.mit.edu",
        "mnet.com",
        "*.mnet.com",
        "*.money.cnn.com",
        "*.mytour.com.hk",
        "*.nasa.gov",
        "*.nasdaq.com",
        "*.nate.com",
        "*.navy.mil",
        "*.newsweek.com",
        "*.nexon.com",
        "*.northwestern.edu",
        "onedrive.com",
        "*.onedrive.com",
        "onedrive.live.com",
        "*.paypal.com",
        "ping.fm",
        "*.pixelinteractivemedia.com",
        "*.play168.com.tw",
        "*.playfish.com",
        "*.plurk.com",
        "*.ptt.cc",
        "*.rd.yahoo.com",
        "*.renaissancecapital.com",
        "*.reuters.com",
        "*.rootkit.com",
        "*.scout.org.hk",
        "*.sixjoy.com",
        "*.slidesharecdn.com",
        "*.slideshare.net",
        "sourceforge.net",
        "*.sourceforge.net",
        "*.sport.independent.co.uk",
        "survey-online.com",
        "*.survey-online.com",
        "*.sysinternals.com",
        "tangentsoft.net",
        "*.tangentsoft.net",
        "t.co",
        "*.t.co",
        "thestar.com",
        "*.thestar.com",
        "*.timesofindia.indiatimes.com",
        "tinychat.com",
        "*.tinychat.com",
        "*.tipo.gov.tw",
        "*.tmz.com",
        "twimg.com",
        "*.twimg.com",
        "*.twitiq.com",
        "*.twitpic.com",
        "twitter.com",
        "*.twitter.com",
        "udn.com",
        "*.udn.com",
        "*.unalis.com.tw",
        "*.verisign.com",
        "voanews.com",
        "*.voanews.com",
        "vtibet.cn",
        "*.vtibet.cn",
        "*.want-daily.com",
        "webpush1.wechat.com",
        "file1.wechat.com",
        "*.wharton.upenn.edu",
        "wiki.kernel.org",
        "*.wiki.kernel.org",
        "*.wikimedia.org",
        "*.windowslive.cn",
        "*.worldofwarcraft.co.kr",
        "*.wowarmory.com",
        "*.wow-europe.com",
        "*.wowtaiwan.com.tw",
        "*.wretch.cc",
        "*.xbox.com",
        "*.yam.com",
        "yfrog.com",
        "*.yfrog.com",
        "*.yiiframework.com",
        "*.youtube.com",
        "*.ytimg.com",
        "*.zgncdn.com"
    ];
    
    for(var k in domains)
        if (shExpMatch(host, domains[k]))
            return true;

    return false;
}


//判断IP是否合法
function CheckIPv4(host) {
    var ipValidate=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (ipValidate.test(host)) {
        return true;
    }
    else {
        return false;
    }
}
