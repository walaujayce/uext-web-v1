$(document).ready(function () {

    // Role Dropdown List Content Replacement
    $(".input.role .item.opt1").click(function (e) { 
        e.preventDefault();
        $(".input.role input").attr("placeholder","Administrator");
        $(".user, .engineer, .admin").css("display", "flex");
    });
    $(".input.role .item.opt2").click(function (e) { 
        e.preventDefault();
        $(".input.role input").attr("placeholder","Engineer");
        $(".user, .engineer").css("display", "flex");
        $(".admin").css("display", "none");
    });
    $(".input.role .item.opt3").click(function (e) { 
        e.preventDefault();
        $(".input.role input").attr("placeholder","User");
        $(".user").css("display", "flex");
        $(".admin, .engineer").css("display", "none");
    });

    // Role Dropdown List Content Replacement
    $(".input.role.chi .item.opt1").click(function (e) { 
        e.preventDefault();
        $(".input.role.chi input").attr("placeholder","管理員");
        $(".user, .engineer, .admin").css("display", "flex");
    });
    $(".input.role.chi .item.opt2").click(function (e) { 
        e.preventDefault();
        $(".input.role.chi input").attr("placeholder","工程師");
        $(".user, .engineer").css("display", "flex");
        $(".admin").css("display", "none");
    });
    $(".input.role.chi .item.opt3").click(function (e) { 
        e.preventDefault();
        $(".input.role.chi input").attr("placeholder","一般用戶");
        $(".user").css("display", "flex");
        $(".admin, .engineer").css("display", "none");
    });

    // Checkbox Toggle
    $(".opt").click(function (e) { 
        e.preventDefault();
        $(this).toggleClass("active");
        $(this).find("input").prop('readonly',function(i,r){
            // returns the value as the opposite  of what it currently is
            // if readonly is false, then it returns true (and vice-versa)
            return !r;});
    });
});