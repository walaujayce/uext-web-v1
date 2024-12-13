$(document).ready(function () {
        // Tab Toggle Function
        $(".opt").click(function (e) { 
            e.preventDefault();
            $(this).addClass("active");
            $(this).siblings().removeClass("active");
        });
        $(".opt.s1").click(function (e) { 
            e.preventDefault();
            $(".bg-bk").removeClass("s2").addClass("s1");
            $(".opt.s1").addClass("active").siblings().removeClass("active");
            $(".grid").addClass("active");
            $(".by-status").removeClass("active");
        });
        $(".opt.s2").click(function (e) { 
            e.preventDefault();
            $(".bg-bk").removeClass("s1").addClass("s2");
            $(".opt.s2").addClass("active").siblings().removeClass("active");
            $(".grid").removeClass("active");
            $(".by-status").addClass("active");
        });

        // Disconnect Bed Tag Text Replacement
        $(".bed.disconnect").hover(function () {
                // over
                $(this).find("p").text("Reconnect");
                $(this).find(".dis-tag").css("background-color", "#0D0D0D");
            }, function () {
                // out
                $(this).find("p").text("Disconnected");
                $(this).find(".dis-tag").css("background-color", "#333333");
            }
        );

        // Disconnect Bed Tag Text Replacement（Chinese Version）
        $(".bed.disconnect.chi").hover(function () {
            // over
            $(this).find("p").text("重新連結");
            $(this).find(".dis-tag").css("background-color", "#0D0D0D");
        }, function () {
            // out
            $(this).find("p").text("斷線");
            $(this).find(".dis-tag").css("background-color", "#333333");
        }
    );
});