$(document).ready(function () {
    // Language List Mouseenter and Mouseleave
    $(".lang").mouseenter(function () { 
        $(".lang").addClass("active");
        $(".lang .list").addClass("active");
        $("header").addClass("menu-expanded");
    });
    $(".lang .list").mouseleave(function () { 
        $(".lang .list").removeClass("active");
        $(".lang").removeClass("active");
        $("header").removeClass("menu-expanded");
    });
    $(".lang").mouseleave(function () { 
        $(".lang .list").removeClass("active");
        $(".lang").removeClass("active");
        $("header").removeClass("menu-expanded");
    });

    // Notification List Mouseenter and Mouseleave
    $(".notification").mouseenter(function () { 
        $(".notification").addClass("active");
        $(".notification .list").addClass("active");
        $("header").addClass("menu-expanded");
    });
    $(".notification .list").mouseleave(function () { 
        $(".notification .list").removeClass("active");
        $(".notification").removeClass("active");
        $("header").removeClass("menu-expanded");
    });
    $(".notification").mouseleave(function () { 
        $(".notification .list").removeClass("active");
        $(".notification").removeClass("active");
        $("header").removeClass("menu-expanded");
    });

    // Setting List Mouseenter and Mouseleave
    $(".setting").mouseenter(function () { 
        $(".setting").addClass("active");
        $(".setting .list").addClass("active");
        $("header").addClass("menu-expanded");
    });
    $(".setting .list").mouseleave(function () { 
        $(".setting .list").removeClass("active");
        $(".setting").removeClass("active");
        $("header").removeClass("menu-expanded");
    });
    $(".setting").mouseleave(function () { 
        $(".setting .list").removeClass("active");
        $(".setting").removeClass("active");
        $("header").removeClass("menu-expanded");
    });

    // Alert-list Toggle
    $("#expand").click(function (e) { 
        e.preventDefault();
        $(".alerts,.alert-list .container").toggleClass("min");
    });

    // Panel List-item Selection (single)
    $(".item-list .item .cb").click(function (e) { 
        e.preventDefault();
        $(this).parent(".item").toggleClass("selected");
    });

    // Panel List-item Selection (all)
    $(".pl .head .cb").click(function (e) { 
        e.preventDefault();
        $(".pl .head").addClass("selected");
        $(".item").addClass("selected");
    });
    $(".pl .head .cb2").click(function (e) { 
        e.preventDefault();
        $(".pl .head").removeClass("selected");
        $(".item").removeClass("selected");
    });

    // Log List-item Selection (all)
    $(".ll .head .cb").click(function (e) { 
        e.preventDefault();
        $(".ll .head").addClass("selected");
        $(".item").addClass("selected");
    });
    $(".ll .head .cb2").click(function (e) { 
        e.preventDefault();
        $(".ll .head").removeClass("selected");
        $(".item").removeClass("selected");
    });
    

    // SideMenu Function
    $(".hamburger").click(function (e) { 
        e.preventDefault();
        $(".sideMenu, .sideMenu-overlay").addClass("active");
    });

    $("body").on("click",".sideMenu-overlay.active",function (e) { 
        e.preventDefault();
        $(".sideMenu, .sideMenu-overlay").removeClass("active");
    });

    // Delete Notifications
    $(".notification .notice .close").click(function (e) { 
        e.preventDefault();
        $(this).closest(".notice").css("display","none");
    });
});