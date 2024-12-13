$(document).ready(function () {

    // SideMenu X Logout Overlay
    $(".sideMenu .btn").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".overlay.logout").addClass("active");

        // Close Overlay
        $(".overlay .sec").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });

    // LOGOUT OVERLAY
    $(".setting .logout").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".overlay.logout").addClass("active");

        // Close Overlay
        $(".overlay .sec").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });

    // LOGOUT OVERLAY
    $(".setting .logout.chi").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".overlay.logout").addClass("active");

        // Close Overlay
        $(".overlay .sec").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });

    // EXIT ALERT OVERLAY
    $(".alerts .alert-list").on("click", ".new",function (e) { 
        e.preventDefault();

        $(this).addClass("in-progress").removeClass("new");
        $(this).find("img").attr("src","element/alert-progress.svg")

        // Open Overlay
        $(".overlay.alert-new").addClass("active");

        // Close Overlay
        $(".alert-new .sec, .alert-new .pri").click(function (e) { 
            e.preventDefault();
            $(".alert-new").removeClass("active");
        });
    });


    // IN-PROGRESS EXIT ALERT OVERLAY
    $(".alerts .alert-list").on("click", ".in-progress",function (e) { 
        e.preventDefault();

        // Open Overlay
        $(".inp-ea").addClass("active");
        
        // Close Overlay
        $(".inp-ea .sec").click(function (e) { 
            e.preventDefault();
            $(".inp-ea").removeClass("active");
        });

        // LEAVVE A LOG REMINDER
        $(".inp-ea .pri").click(function (e) { 
            e.preventDefault();
            // Open Overlay
            $(".log").addClass("active");
            $(".inp-ea").removeClass("active");
        });

        // Open addLog
        $(".log .pri").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
            $(".addLog").addClass("active");
        });
        // Close Overlay
        $(".log .sec").click(function (e) { 
            e.preventDefault();
            $(".log").removeClass("active");
        });
        // Close addLog
        $(".addLog .pri, .addLog .sec").click(function (e) { 
            e.preventDefault();
            $(".addLog").removeClass("active");
        });
    });
    

    // DISCHARGE ALERT
    $("#discharge").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".discharge").addClass("active");
        
        // Close Overlay
        $(".overlay .sec, .overlay .pri").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });


    // DUPLICATED DEVICE ALERT
    $("").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".overlay").addClass("active");
        
        // Set Icon
        $(".warn .icon").attr("src", "../element/alert-box.svg");

        // Set Title & Description
        $(".warn .title").text("Duplicated device connection");
        $(".warn .desc").text("7/F, Zone A, Bed 113 was originally connected with another device (ADPS-003078-S)");

        // Set Btn
        $(".warn .pri, .warn .sec").css("display","block")
        // Replace Btn Text
        $(".warn .pri-text").text("Override with this device");
        $(".warn .sec-text").text("Cancel");

        // Close Overlay
        $(".overlay .sec, .overlay .pri").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });


    // DUPLICATED BED/PATIENT ALERT
    $("").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".overlay").addClass("active");
        
        // Set Icon
        $(".warn .icon").attr("src", "../element/alert-box.svg");

        // Set Title & Description
        $(".warn .title").text("Duplicated device connection");
        $(".warn .desc").text(" This device (ADPS-003078-S) was originally connected with another patient @7/F, Zone A, Bed 113 ");

        // Set Btn
        $(".warn .pri, .warn .sec").css("display","block")
        // Replace Btn Text
        $(".warn .pri-text").text("Override with this device");
        $(".warn .sec-text").text("Cancel");

        // Close Overlay
        $(".overlay .sec, .overlay .pri").click(function (e) { 
            e.preventDefault();
            $(".overlay").removeClass("active");
        });
    });


    // UNSAVED LOG ALERT
    $(".editLog .sec, .addLog .sec").click(function (e) { 
        e.preventDefault();
        // Hide Log Edit
        $(".editLog").removeClass("active");
        $(".addLog").removeClass("active");
        // Open Overlay
        $(".unsavedLog").addClass("active");
        
        // Close Overlay
        $(".unsavedLog .pri").click(function (e) { 
            e.preventDefault();
            $(".unsavedLog").removeClass("active");
        });

        // Back to Log Edit
        $(".unsavedLog .sec").click(function (e) { 
            e.preventDefault();
            $(".editLog").addClass("active")
            $(".unsavedLog").removeClass("active");
        });
    });

    // UNSAVED LOG ALERT
    $(".addLog .sec").click(function (e) { 
        e.preventDefault();
        // Hide addLog
        $(".addLog").removeClass("active");
        // Open Overlay
        $(".unsavedLog").addClass("active");
        
        // Close Overlay
        $(".unsavedLog .pri").click(function (e) { 
            e.preventDefault();
            $(".unsavedLog").removeClass("active");
        });
        // Back to Log Edit
        $(".unsavedLog .sec").click(function (e) { 
            e.preventDefault();
            $(".addLog").addClass("active")
            $(".unsavedLog").removeClass("active");
        });
    });


    // ADD PATIENT OVERLAY WINDOW
    $("#addPatient, .bed.vacant").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".addPatient").css("display", "block");
    });

    // Stage 1 Btn Function
    $(".addPatient .st1 .pri").click(function (e) { 
        e.preventDefault();
        // Open Stage 2
        $(".grid.st2").css("display","grid");
        $(".btn-gp.st2").css("display","flex");
        // Set Tab Status
        $(".tab-1").removeClass("active").addClass("completed");
        $(".tab-2").addClass("active");
        // Close Stage 1
        $(".grid.st1").css("display","none");
        $(".btn-gp.st1").css("display","none");
    });
    $(".addPatient .st1 .sec").click(function (e) { 
        e.preventDefault();
        // Close Overlay
        $(".addPatient").css("display", "none");
    });

    // Stage 2 Btn Function
    $(".addPatient .st2 .sec").click(function (e) { 
        e.preventDefault();
        // Open Stage 1
        $(".grid.st1").css("display","grid");
        $(".btn-gp.st1").css("display","flex");
        // Set Tab Status
        $(".tab-1").addClass("active").removeClass("completed");
        $(".tab-2").removeClass("active");
        // Close Stage 2
        $(".grid.st2").css("display","none");
        $(".btn-gp.st2").css("display","none");
    });

    $(".addPatient .st2 .pri").click(function (e) { 
        e.preventDefault();
        // Open Stage 3
        $(".addPatient .title").text("New Patient Added!");
        $(".addPatient.chi .title").text("成功新增病人");
        $(".btn-gp.st3").css("display","flex");
        $(".addPatient .icon").css("display", "block");
        $(".addPatient .icon").attr("src", "../element/check-active.svg");
        $(".window").css("justify-content","center");
        // Close Stage 2
        $(".addPatient .tab-list").css("display","none");
        $(".grid.st2").css("display","none");
        $(".btn-gp.st2").css("display","none");
    });

    // Stage 3
    $(".addPatient .st3 .pri").click(function (e) { 
        e.preventDefault();
        // Close Overlay
        $(".addPatient").css("display", "none");
        // Reset Overlay Status
        $(".addPatient .icon").css("display", "none");
        $(".grid.st1").css("display", "grid");
        $(".btn-gp.st1").css("display", "flex");
        $(".addPatient .tab-list").css("display","flex");
        $(".tab-1").addClass("active").removeClass("completed");
        $(".tab-2").removeClass("active");
        $(".st3").css("display","none");
        $(".addPatient .title").text("Add Patient");
        $(".addPatient.chi .title").text("新增病人");
    });

    $(".addPatient .st3 .sec").click(function (e) { 
        e.preventDefault();
        // Close Stage 3
        $(".addPatient .icon").css("display", "none");
        $(".btn-gp.st3").css("display", "none");

        // Open Stage 4
        $(".addPatient .title").text("Link Device");
        $(".addPatient.chi .title").text("連結裝置");
        $(".addPatient .tab-list").css("display","flex");
        $(".tab-1").addClass("active").removeClass("completed").text("Device Connection");
        $(".addPatient.chi .tab-1").addClass("active").removeClass("completed").text("裝置連結");
        $(".tab-2").removeClass("active").css("display","none");
        $(".grid.st4-1").addClass("active");
        $(".btn-gp.st4-1").addClass("active");
        $(".window").css("justify-content","flex-start");
    });
    
    // Stage 4

    // Switch to link new device
    $(".addPatient .st4-1 .sec").click(function (e) { 
        e.preventDefault();
        
        $(".grid.st4-1").toggleClass("active");
        $(".btn-gp.st4-1").toggleClass("active");
        $(".grid.st4-2").toggleClass("active");
        $(".btn-gp.st4-2").toggleClass("active");
    });
    // Switch to link registered device
    $(".addPatient .st4-2 .sec").click(function (e) { 
        e.preventDefault();
        
        $(".grid.st4-1").toggleClass("active");
        $(".btn-gp.st4-1").toggleClass("active");
        $(".grid.st4-2").toggleClass("active");
        $(".btn-gp.st4-2").toggleClass("active");
    });

    // Open Stage 5
    $(".addPatient .st4-1 .pri, .st4-2 .pri").click(function (e) { 
        e.preventDefault();
        // Close Stage 4
        $(".grid.st4-1").removeClass("active");
        $(".btn-gp.st4-1").removeClass("active");
        $(".grid.st4-2").removeClass("active");
        $(".btn-gp.st4-2").removeClass("active");
        // Open Stage 5
        $(".connecting").css("display", "flex");

        // Open Stage 6
        setTimeout(
            function() 
            {
                $(".btn-gp.st6").css("display","flex");
                $(".addPatient .title").text("Device Linked!");
                $(".addPatient.chi .title").text("成功連結裝置!");
                $(".addPatient .icon").css("display", "block");
                $(".addPatient .icon").attr("src", "../element/link-active.svg");
                $(".connecting").css("display", "none");
                $(".tab-list").css("display","none");
                $(".window").css("justify-content","center");
            }, 4000);
    });



    // ADD DEVICE OVERLAY WINDOW
    $("#addDevice").click(function (e) { 
        e.preventDefault();
        // Open Overlay
        $(".addDevice").css("display", "block");
    });

    // Open Stage 2
    $(".addDevice .st1 .pri").click(function (e) { 
        e.preventDefault();        
        // Set Tab Status
        $(".tab-1").removeClass("active").addClass("completed");
        $(".tab-2").addClass("active");
        // Close Stage 1
        $(".grid.st1").removeClass("active");
        $(".btn-gp.st1").removeClass("active");
        // Set Icon
        $(".addDevice .connecting").addClass("active");

        setTimeout(
            function() 
            {   
                $(".addDevice .title").text("Device Registered!");
                $(".addDevice .icon").css("display", "block");
                $(".addDevice .icon").attr("src", "../element/link-active.svg");
                $(".btn-gp.st2").addClass("active");
                $(".connecting").removeClass("active");
                $(".tab-list").css("display","none");
                $(".window").css("justify-content","center");
            }, 4000);
    });

    // Open Stage 3: Link device with a bed/patient
    $(".addDevice .st2 .sec").click(function (e) { 
        e.preventDefault();

        $(".addDevice .st3").addClass("active");
        $(".window").css("justify-content","flex-start");

        // Restore Tab
        $(".tab-list").css("display","flex");
        $(".tab-2").css("display","none");
        $(".tab-1").removeClass("completed").addClass("active").text("Bed Location");
        // Edit Title
        $(".addDevice .title").text("Link Device to Patient");
        // Close Stage 2
        $(".addDevice .icon").css("display", "none");
        $(".addDevice .st2").removeClass("active");
    });

    // Open Stage 4
    $(".addDevice .st3 .pri").click(function (e) { 
        e.preventDefault();

        // Set Icon
        $(".addDevice .connecting").addClass("active");
        $(".addDevice .st3").removeClass("active");

        setTimeout(
            function() 
            {   
                $(".addDevice .title").text("Device Linked to a Patient");
                $(".addDevice .icon").css("display", "block");
                $(".addDevice .icon").attr("src", "../element/link-active.svg");
                $(".btn-gp.st4").addClass("active");
                $(".connecting").removeClass("active");
                $(".tab-list").css("display","none");
                $(".window").css("justify-content","center");
            }, 4000);
    });


    // addLog
    $("#addLog").click(function (e) { 
        e.preventDefault();
        $(".addLog").addClass("active");
    });

    // editLog
    $("img.edit").click(function (e) { 
        e.preventDefault();
        $(".editLog").addClass("active");
    });

    // deleteLog
    $("img.delete, #deleteLog").click(function (e) { 
        e.preventDefault();
        $(".deleteLog").addClass("active");
    });

    // addUser
    $("#addUser").click(function (e) { 
        e.preventDefault();
        $(".addUser").addClass("active");

        $(".st-1 .sec").click(function (e) { 
            e.preventDefault();
            $(".addUser").removeClass("active");
        });

        $(".st-1 .pri").click(function (e) { 
            e.preventDefault();
            $(".st-1").removeClass("active");
            $(".st-2").addClass("active");
            $(".addUser .subtitle").text("Set up your password")
        });

        $(".st-2 .sec").click(function (e) { 
            e.preventDefault();
            $(".st-1").addClass("active");
            $(".st-2").removeClass("active");
            $(".addUser .subtitle").text("Fill in your profile information");
        });

        $(".st-2 .pri").click(function (e) { 
            e.preventDefault();
            $(".addUser").removeClass("active");
            $(".newUserConfirm").addClass("active");
            $(".st-1").addClass("active");
            $(".st-2").removeClass("active");
            $(".addUser .subtitle").text("Fill in your profile information");
        });
    });

    // Show password
    $(".input-gp").on("click",".hide",function (e) {  
        e.preventDefault();
        
        $(this).siblings(".placeholder").attr("type", "text");
        $(this).attr("src", "element/eye.svg");
        $(this).removeClass("hide").addClass("show");
    });

    // Hide Password
    $(".input-gp").on("click",".show",function (e) { 
        e.preventDefault();
        
        $(this).siblings(".placeholder").attr("type", "password");
        $(this).attr("src", "element/eye-off.svg");
        $(this).removeClass("show").addClass("hide");
    });


    // Change Password
    $("#changePassword, #changePassword-2, #changePassword-3").click(function (e) { 
        e.preventDefault();
        $(".changePassword").addClass("active");

        $(".changePassword .pri").click(function (e) { 
            e.preventDefault();
            $(".changePassword").removeClass("active");
            $(".newpwConfirm").addClass("active");
        });

        $(".changePassword .sec").click(function (e) { 
            e.preventDefault();
            $(".changePassword").removeClass("active");
        });

        $(".changePassword .close").click(function (e) { 
            e.preventDefault();
            $(".changePassword").removeClass("active");
        });
    });

    $(".newpwConfirm .pri").click(function (e) { 
        e.preventDefault();
        $(".newpwConfirm").removeClass("active");
    });

    $(".newUserConfirm .pri").click(function (e) { 
        e.preventDefault();
        $(".newUserConfirm").removeClass("active");
    });


    // Delete User Overaly
    $("#deleteUser").click(function (e) { 
        e.preventDefault();
        $(".deleteUser").addClass("active");

    });
});