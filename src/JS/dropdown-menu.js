$(document).ready(function () {
    
        // Input and Dropdown Toggle
        $(".input.dropdown").click(function (e) { 
            e.preventDefault();
            $(this).find(".list").toggleClass("active");
            $(this).siblings().find(".list").removeClass("active");
        });

        $(".ghost").click(function (e) { 
            e.preventDefault();
            $(".input.dropdown .list").removeClass("active");
        });

        // Floor Dropdown List Content Replacement
        $(".input.floor .item.opt1").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","1F");
        });
        $(".input.floor .item.opt2").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","2F");
        });
        $(".input.floor .item.opt3").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","3F");
        });
        $(".input.floor .item.opt4").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","4F");
        });
        $(".input.floor .item.opt5").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","5F");
        });
        $(".input.floor .item.opt6").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","6F");
        });
        $(".input.floor .item.opt7").click(function (e) { 
            e.preventDefault();
            $(".input.floor input").attr("placeholder","7F");
        });

        // Section Dropdown List Content Replacement
        $(".input.section .item.opt1").click(function (e) { 
            e.preventDefault();
            $(".input.section input").attr("placeholder","Zone A");
        });
        $(".input.section .item.opt2").click(function (e) { 
            e.preventDefault();
            $(".input.section input").attr("placeholder","Zone B");
        });
        $(".input.section .item.opt3").click(function (e) { 
            e.preventDefault();
            $(".input.section input").attr("placeholder","Zone C");
        });
        $(".input.section .item.opt4").click(function (e) { 
            e.preventDefault();
            $(".input.section input").attr("placeholder","Zone D");
        });

        // Building Dropdown List Content Replacement
        $(".input.building .item.opt1").click(function (e) { 
            e.preventDefault();
            $(".input.building input").attr("placeholder","Building 1");
        });
        $(".input.building .item.opt2").click(function (e) { 
            e.preventDefault();
            $(".input.building input").attr("placeholder","Building 2");
        });
        $(".input.building .item.opt3").click(function (e) { 
            e.preventDefault();
            $(".input.building input").attr("placeholder","Building 3");
        });
        $(".input.building .item.opt4").click(function (e) { 
            e.preventDefault();
            $(".input.building input").attr("placeholder","Building 4");
        });
        $(".input.building .item.opt5").click(function (e) { 
            e.preventDefault();
            $(".input.building input").attr("placeholder","Building 5");
        });


        // Device ID Dropdown List Content Replacement
        $(".input.device .item.opt1").click(function (e) { 
            e.preventDefault();
            $(".input.device input").attr("placeholder","ADPS-003078-S");
        });
        $(".input.device .item.opt2").click(function (e) { 
            e.preventDefault();
            $(".input.device input").attr("placeholder","ADPS-003079-S");
        });
        $(".input.device .item.opt3").click(function (e) { 
            e.preventDefault();
            $(".input.device input").attr("placeholder","ADPS-003080-S");
        });
        $(".input.device .item.opt4").click(function (e) { 
            e.preventDefault();
            $(".input.device input").attr("placeholder","ADPS-003081-S");
        });
        $(".input.device .item.opt5").click(function (e) { 
            e.preventDefault();
            $(".input.device input").attr("placeholder","ADPS-003082-S");
        });


        // Device Confirguration Dropdown List Content Replacement
        $(".input.set .item.opt1").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","custom 1");
        });
        $(".input.set .item.opt2").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","custom 2");
        });
        $(".input.set .item.opt3").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","custom 3");
        });
        $(".input.set .item.opt4").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","custom 4");
        });
        $("#reset").click(function (e) { 
            e.preventDefault();
            $(".input.set input").attr("placeholder","Default");
        });

        // Device Confirguration Dropdown List Content Replacement
        $(".input.set.chi .item.opt1").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","客製一");
        });
        $(".input.set.chi .item.opt2").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","客製二");
        });
        $(".input.set.chi .item.opt3").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","客製三");
        });
        $(".input.set.chi .item.opt4").click(function (e) { 
            e.preventDefault();
            $(this).closest(".input").find("input").attr("placeholder","客製四");
        });
        $("#reset-chi").click(function (e) { 
            e.preventDefault();
            $(".input.set.chi input").attr("placeholder","默認");
        });
});