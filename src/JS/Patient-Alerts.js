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
        return !r;});
});