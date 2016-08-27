function initIntroBtns() {
    for (var n = $("intro-ul").children("ul").children().click(function () {
        var n = $(this).attr("id").slice(-1);
        $("#intro-middleimage").attr("src", "img/02_intro/ic_intro" + n + ".png");
        var e, o;
        1 == n ? (e = "�ㅻ쭏�명븳 �덉빟", o = "�꾩쭅�� 蹂듭옟�� �댁궗寃ъ쟻�� 諛쏆쑝�쒕굹��?<br />寃⑹씠 �ㅻⅨ �ㅻ쭏�명븳 �덉빟 �쒖뒪�쒖쓣 留뚮굹蹂댁꽭��!") : 2 == n ? (e = "�⑸━�곸씤 �쒖�媛�寃�", o = "�곹솴留덈떎 �щ씪吏��� �댁궗媛�寃�!<br />吏먯뭅�� 紐뉕�吏� 議곌굔�쇰줈 媛�寃⑹쓣�쒖��� �덉뼱��.") : 3 == n ? (e = "留욎땄 �쒕퉬��", o = "吏먯떥�� 臾쇳뭹�� �꾩슂�좊븧 吏먮컯��,<br />�쇱넀�� 遺�議깊븷�� 吏먮㎤,<br />�댁넚�섎떒�� �놁쓣�� 吏먯뭅瑜�,<br />�닿쾶 �꾩슂�� �쒕퉬�ㅻ쭔 �곕줈 �좎껌 �� �섏엳�댁슂.<br />臾쇰줎 �좏깉�쒕퉬�ㅻ룄 OK!") : 4 == n && (e = "�덉쟾�� 吏먯뭅", o = "�뺤떇 �덇��� �ш퀬�� 諛곗긽 梨낆엫�� 湲곕낯�닿쿋二�?<br />�뱀떆 紐⑤� �ш퀬�� 吏먯뭅�먯꽌�� �덉떖!"), $("#intro-middle-title").text(e), $("#intro-middle-description").html(o), $("#intro-btn-img-1").attr("src", "img/02_intro/btn_content01.png"), $("#intro-btn-img-2").attr("src", "img/02_intro/btn_content02.png"), $("#intro-btn-img-3").attr("src", "img/02_intro/btn_content03.png"), $("#intro-btn-img-4").attr("src", "img/02_intro/btn_content04.png"), $("#intro-btn-img-" + n).attr("src", "img/02_intro/btn_content0" + n + "_on.png")
    }), e = n.length, o = 0; e > o; ++o);
}
function closeZimmanApplyBanner() {
    $("#zimmanapply").hide()
}
function gotoApplyZimman() {
    window.open("http://blog.zimcar.kr/220616421494")
}
function gotoBuyZimbox() {
    window.open("http://storefarm.naver.com/zimcar/products/296495307")
}
function goEstimate() {
    window.open("http://reservation.zimcar.kr", "�댁궗 鍮꾩슜 �뺤씤�섍린 :: 吏먯뭅", "width=600, height=800, resizable=no")
}
function scrollHandler() {
    var n;
    n = $(window).scrollTop() < 470 ? "in" : "out", n != navState && ("in" == n ? (0 == $("nav").hasClass("navFadeIn") && $("nav").addClass("navFadeIn"), 1 == $("nav").hasClass("navFadeOut") && $("nav").removeClass("navFadeOut")) : (0 == $("nav").hasClass("navFadeOut") && $("nav").addClass("navFadeOut"), 1 == $("nav").hasClass("navFadeIn") && $("nav").removeClass("navFadeIn")), navState = n)
}
function gotoBuyZimbox() {
    var n = "http://storefarm.naver.com/zimcar/products/296495307";
    zimcarHelpers.openUrl(n)
}
function gotoIntroduce() {
    var n = "http://" + window.location.host + "/introduce";
    zimcarHelpers.openUrl(n)
}
function gotoGuide() {
    var n = "http://" + window.location.host + "/guide";
    zimcarHelpers.openUrl(n)
}
function gotoVersus() {
    var n = "http://" + window.location.host + "/versus";
    zimcarHelpers.openUrl(n)
}
function gotoZimcarFB() {
    var n = "https://www.facebook.com/zimcar";
    isMobile.apple.device ? zimcarHelpers.isiOSInAppWebView ? zimcarHelpers.callFunc_iOS("openZimcarFb") : window.open(n, "_blank") : isMobile.android.device ? window.open(n, "_blank") : window.open(n, "_blank")
}
function initSwiper() {
    var n = new Swiper(".swiper-container", {
        direction: "horizontal",
        loop: !0,
        autoplay: 2500,
        autoplayDisableOnInteraction: !1,
        pagination: ".swiper-pagination",
        paginationClickable: !0
    });
    n.on("click", function () {
        5 == n.activeIndex || 1 == n.activeIndex ? gotoIntroduce() : 0 == n.activeIndex || 4 == n.activeIndex ? gotoZimcarFB() : 2 == n.activeIndex ? gotoGuide() : 3 == n.activeIndex && gotoVersus()
    })
}
function openFrame(n, e) {
    window.ZimCarForUser.openUrl(n, e, 0)
}
function closeFrame() {
    TweenMax.to("#app-container .iframe-wrapper", .3, {
        ease: Cubic.easeInOut, y: "100%", onComplete: function () {
            $("#app-container .iframe-wrapper").remove(), $("#app-container").removeClass("no-header")
        }
    }), $("#app-bottom").show(), $("#content-wrapper").show(), $("#app-header h1").html('<img src="./img/logo.png" alt=""/>'), $("#app-header .close").hide(), updateHeaderLayout()
}
var menuList = ["home", "intro", "box", "car", "man"], navState = "in";
$(document).ready(function () {
    $('a[href^="#"]').on("click", function (n) {
        n.preventDefault();
        var e = this.hash, o = $(e);
        $("html, body").stop().animate({scrollTop: o.offset().top}, 900, "swing", function () {
            window.location.hash = e
        })
    });
    for (var n = 0; n < menuList.length; ++n)$("#sideNav_" + menuList[n]).mouseover(function () {
        var n = $(this).attr("src").replace("_off", "_on");
        $(this).attr("src", n)
    }).mouseout(function () {
        var n = $(this).attr("src").replace("_on", "_off");
        $(this).attr("src", n)
    });
    initIntroBtns(), scrollHandler()
}), $(window).load(function () {
    $(window).scroll(scrollHandler)
}), $(function () {
    $("#btn-buy-zimbox").on("click", function () {
        gotoBuyZimbox()
    }), $("#btn-user-guide").on("click", function () {
        gotoGuide()
    }), initSwiper()
}), window.onmessage = function (n) {
    "closeFrame" == n.data && (location.hash = "")
}, $(window).on("hashchange", function () {
    var n = location.hash.split("#").pop();
    switch (n) {
        case"introduce":
            openFrame("http://zimcar.kr/introduce", "吏먯뭅 �뚭컻");
            break;
        case"guide":
            openFrame("http://zimcar.kr/newguide", "�댁슜媛��대뱶");
            break;
        case"versus":
            openFrame("http://zimcar.kr/versus", "吏먯뭅�� �대젃寃� �ㅻ쫭�덈떎.");
            break;
        case"reviewadd":
            openFrame("http://m.cafe.naver.com/SimpleArticleList.nhn?search.clubid=28179002&search.menuid=3", "吏먯뭅 �댁슜�꾧린");
            break;
        case"faq":
            openFrame("http://m.cafe.naver.com/ArticleList.nhn?search.clubid=28179002&search.menuid=1", "�먯＜�섎뒗 吏덈Ц");
            break;
        case"go-reservation":
            $("#app-container").addClass("no-header"), openFrame("http://reservation.zimcar.kr", "�ㅼ떆媛� �덉빟�섍린");
            break;
        default:
            closeFrame()
    }
}), function (n) {
    isMobile.apple.device && (console = new Object, console.log = function (n) {
        for (var e = document.createElement("IFRAME"), o = "", i = 0; i < arguments.length; i++)o += arguments[i] + " ";
        e.setAttribute("src", "ios-log:#iOS#" + o), document.documentElement.appendChild(e), e.parentNode.removeChild(e), e = null
    }, console.debug = console.log, console.info = console.log, console.warn = console.log, console.error = console.log);
    var e = function () {
        var n = window.navigator.standalone, e = window.navigator.userAgent.toLowerCase(), o = /safari/.test(e);
        if (isMobile.apple.device)if (!n && o); else if (n && !o); else if (!n && !o)return !0;
        return !1
    }, o = function () {
        return this.isiOSInAppWebView = e(), this.openUrl_iOS = function (n, e, o) {
            if ("undefined" == typeof n)return !1;
            "undefined" == typeof e && (e = "_blank");
            var i = "|!|", t = "zimcarjs:#openUrl#";
            t += n, t += i, t += e, "undefined" != typeof o && (t += i, t += o), document.location = t
        }, this.callFunc_iOS = function (n, e) {
            if ("undefined" == typeof n)return !1;
            var o = "zimcarjs:#" + n + "#";
            document.location = o
        }, this.openUrl = function (n, e) {
            return "undefined" == typeof n ? !1 : ("undefined" == typeof e && (e = "_blank"), void(isMobile.apple.device ? zimcarHelpers.isiOSInAppWebView ? zimcarHelpers.openUrl_iOS(n, "_blank") : window.open(n, "_blank") : isMobile.android.device ? window.open(n, "_blank") : window.open(n, "_blank")))
        }, "undefined" == typeof window ? this : void 0
    }, i = function () {
        var n = new o;
        return n.Class = o, n
    };
    "undefined" != typeof module && module.exports && "undefined" == typeof window ? module.exports = o : "undefined" != typeof module && module.exports && "undefined" != typeof window ? module.exports = i() : "function" == typeof define && define.amd ? define("zimcarHelpers", [], n.zimcarHelpers = i()) : n.zimcarHelpers = i()
}(this);