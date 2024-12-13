$(document).ready(function () {
    // $(".tab .opt").click(function (e) { 
    //     e.preventDefault();
    //     $(this).addClass("active");
    //     $(this).siblings().removeClass("active");
    // });

    // $(".tab .opt-1").click(function (e) { 
    //     e.preventDefault();
    //     $(".monitor").addClass("active");
    //     $(".alert, .analysis, .logs").removeClass("active");
    // });
    // $(".tab .opt-2").click(function (e) { 
    //     e.preventDefault();
    //     $(".alert").addClass("active");
    //     $(".monitor, .analysis, .logs").removeClass("active");
    // });
    // $(".tab .opt-3").click(function (e) { 
    //     e.preventDefault();
    //     $(".analysis").addClass("active");
    //     $(".alert, .monitor, .logs").removeClass("active");
    // });
    // $(".tab .opt-4").click(function (e) { 
    //     e.preventDefault();
    //     $(".logs").addClass("active");
    //     $(".alert, .analysis, .monitor").removeClass("active");
    // });


    $(".toggle").click(function (e) { 
        e.preventDefault();
        $(this).toggleClass("active");
        $(this).closest(".alertSetting").find(".opt-grid").toggleClass("active");
        $(this).closest(".alertSetting").find(".opt").toggleClass("on");
        $(this).closest(".alertSetting").find(".btn").toggleClass("inactive");
    });

    $(".alertOpt .opt img").click(function (e) { 
        e.preventDefault();
        $(this).parent(".opt").toggleClass("active");
        $(this).parent(".opt").find("input").prop('readonly',function(i,r){
            // returns the value as the opposite  of what it currently is
            // if readonly is false, then it returns true (and vice-versa)
            return !r;});
    });
});