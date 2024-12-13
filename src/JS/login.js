$(document).ready(function () {
    $(".input-gp").on("click",".hide",function (e) {  
        e.preventDefault();
        
        $(this).siblings(".placeholder").attr("type", "text");
        $(this).attr("src", "element/eye.svg");
        $(this).removeClass("hide").addClass("show");
    });

    $(".input-gp").on("click",".show",function (e) { 
        e.preventDefault();
        
        $(this).siblings(".placeholder").attr("type", "password");
        $(this).attr("src", "element/eye-off.svg");
        $(this).removeClass("show").addClass("hide");
    });


    // Forget Password
    $("#forget-pw").click(function (e) { 
        e.preventDefault();
        $(".login .title").text("Forget Password");
        $(".st2").addClass("active");
        $(".st1").removeClass("active");
        $(".login").css("transform","translateY(55%)")
    });

    // Send Reset Pw Link
    $(".st2 .btn.pri").click(function (e) { 
        e.preventDefault();
        $(".st3").addClass("active");
        $(".st2").removeClass("active");
    });

    // Back to Login
    $(".st3 .btn.pri").click(function (e) { 
        e.preventDefault();
        $(".st1").addClass("active");
        $(".st3").removeClass("active");
        $(".login").css("transform","translateY(40%)")
        $(".login .title").text("Exit Bed Alarm System");
    });

    if($(window).width() <= 1024){
        // do your stuff
        $("#forget-pw").click(function (e) { 
            e.preventDefault();
            $(".login").css("transform","translateY(100%)")
        });
        $(".st3 .btn.pri").click(function (e) { 
            e.preventDefault();
            $(".login").css("transform","translateY(65%)")
        });
      }
});