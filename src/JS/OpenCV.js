var scale;
var show_num = false;
var ori_w;
var ori_h;
var bar_h = 200;
var bar_w = 40;
var width;
var height;
var mat24;
var zoom = 255 / 50;
var devicetype;
var rawdata;

function pressurechart(deviceid) {
    console.log('start pressure chart:' + deviceid)
    if (!deviceid == null || deviceid.trim().length > 0) {
        go(deviceid);
        setInterval(function () { go(deviceid); }, 1000);
    }
}

function go(deviceid) {
    cv['onRuntimeInitialized'] = () => {
        console.log('opencv start ');
        document.getElementById("tcanvas").classList.add("hidden");
        document.getElementById('testloading').style.display = 'display';
    };

    getdata(deviceid);
    /* document.getElementById('testloading').remove();*/
}

function getdata(deviceid) {
    console.log('get rawdata' + Date().toLocaleString());
    $.ajax({
        url: "/Profile?handler=ProcessPressure",
        type: "POST",
        dataType: "json",
        data: { "device": deviceid },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("XSRF-TOKEN",
                $('input:hidden[name="__RequestVerificationToken"]').val());
        },
        success: function (res) {
            devicetype = res.type;
            console.log('devicetype:' + devicetype);
            var result = res.data;
            console.log('raw:' + result);

            //pressure chart
            if (devicetype.length > 0 && result.length > 0) {
                setelem(res);
                rawdata = JSON.parse(result);
                console.log('rawdata:' + rawdata);
                switch (devicetype) {
                    case 'D01': {
                        print_img(rawdata);
                        break;
                    }
                    case 'D02': {
                        print_img(rawdata);
                        break;
                    }
                    case 'D03': {
                        print_img2(rawdata);
                        break;
                    }
                    default: {
                        break;
                    }
                }
                document.getElementById('testloading').style.display = 'none';
            }
        },
        error: function (jqxhr, textstatus, errorthrown) {
            alert(errorthrown);
        }
    });
}

function setelem(data_info) {
    var c = 6;
    ori_w = data_info.data_col;
    ori_h = data_info.data_row;
    scale = data_info.data_scale;

    if (data_info.type = 'D03') {
        width = Math.round(ori_w * scale * c);
        height = Math.round(ori_h * scale * c);
    }
    else {
        width = Math.round(ori_w * scale);
        height = Math.round(ori_h * scale);
    }

    var elem = document.getElementById("main_img");
    elem.style.width = width + bar_w + "px";
    elem.style.height = height + "px";

    var elem2 = document.getElementById("tcanvas");
    elem2.style.width = width + "px";
    elem2.style.height = height + "px";
    elem2.classList.remove("hidden");

}

/***device type: D01、D02***/
export function print_img(data) {
    mat24 = cv.matFromArray(height, width, cv.CV_8UC1, Array(width * height).fill(24));
    var vis = cv.matFromArray(ori_h, ori_w, cv.CV_8UC1, data); //rows, cols, type, array

    var dim = new cv.Size(width, height);
    var vis2 = new cv.Mat();

    cv.resize(vis, vis2, dim, 0, 0, cv.INTER_CUBIC);
    cv.divide(vis2, mat24, vis2);
    cv.multiply(vis2, mat24, vis2);

    var dst = new cv.Mat();
    cv.cvtColor(vis2, dst, cv.COLOR_GRAY2RGB, 0);

    for (var i = 0; i < vis2.size().height; i++) {
        for (var j = 0; j < vis2.size().width; j++) {
            var c = getColor(vis2.ucharPtr(i, j)[0]);

            dst.ucharPtr(i, j)[0] = c[2];
            dst.ucharPtr(i, j)[1] = c[1];
            dst.ucharPtr(i, j)[2] = c[0];
            dst.ucharPtr(i, j)[3] = 0;
        }
    }
    if (show_num)
        for (var i = 0; i < vis.size().height; i++) {
            for (var j = 0; j < vis.size().width; j++) {
                if (vis.ucharPtr(i, j)[0] > 20)
                    cv.putText(dst, "" + vis.ucharPtr(i, j)[0], { x: (j + 0.3) * (Math.pow(scale, 1.002)), y: (i + 0.5) * (scale) }, cv.FONT_HERSHEY_SIMPLEX, 0.25, new cv.Scalar(255, 255, 255), 1);
            }
        }

    cv.imshow('tcanvas', dst);

    vis.delete();
    vis2.delete();
    dst.delete();
}

function getColor(div) {
    if (div < 5)
        return [255, 255, 255];

    div = Math.floor(div / 16);

    if (div > 15)
        return [37, 58, 235];
    switch (div) {
        case 0:
            return [104, 4, 1];
        case 1:
            return [158, 8, 2];
        case 2:
            return [245, 57, 21];
        case 3:
            return [245, 97, 41];
        case 4:
            return [245, 141, 63];
        case 5:
            return [249, 185, 84];
        case 6:
            return [250, 225, 104];
        case 7:
            return [160, 226, 110];
        case 8:
            return [62, 210, 97];
        case 9:
            return [70, 227, 166];
        case 10:
            return [75, 234, 211];
        case 11:
            return [79, 240, 251];
        case 12:
            return [84, 203, 246];
        case 13:
            return [56, 158, 240];
        case 14:
            return [48, 119, 234];
        case 15:
            return [37, 58, 235];
        default:
            return [0, 0, 0];
    }
}

/***device type: D03***/
function print_img2(data) {
    console.log("print rawdata");
    var vis = cv.matFromArray(ori_h, ori_w, cv.CV_8UC1, data);
    //cv.rotate(vis, vis, cv.ROTATE_90_CLOCKWISE);

    var dim1 = new cv.Size(width, height);
    var vis1 = new cv.Mat();
    cv.resize(vis, vis1, dim1, 0, 0, cv.INTER_CUBIC);

    var dim2 = new cv.Size(width * scale, height * scale);
    var vis2 = new cv.Mat();
    cv.resize(vis1, vis2, dim2, 0, 0, cv.INTER_CUBIC);

    var dim3 = new cv.Size(width * scale * scale, height * scale * scale);
    var vis3 = new cv.Mat();
    cv.resize(vis2, vis3, dim3, 0, 0, cv.INTER_CUBIC);


    let ksize = new cv.Size(3, 3);
    cv.GaussianBlur(vis3, vis3, ksize, 0, 0, cv.BORDER_DEFAULT);


    var dst = new cv.Mat();
    cv.cvtColor(vis3, dst, cv.COLOR_GRAY2RGB, 0);


    for (var i = 0; i < vis3.size().height; i++) {
        for (var j = 0; j < vis3.size().width; j++) {
            var c = getColor2(vis3.ucharPtr(i, j)[0]);

            dst.ucharPtr(i, j)[0] = c[2];
            dst.ucharPtr(i, j)[1] = c[1];
            dst.ucharPtr(i, j)[2] = c[0];
            dst.ucharPtr(i, j)[3] = 0;

        }
    }

    cv.imshow('tcanvas', dst);

    vis.delete();
    vis1.delete();
    vis2.delete();
    vis3.delete();
    dst.delete();
}
function getColor2(div) {
    if (div < 1) {
        return [255, 255, 255]
    }
    div = div * zoom;
    div = Math.floor(div / 16);
    switch (div) {
        case 0:
            return [104, 4, 1];
        case 1:
            return [158, 8, 2];
        case 2:
            return [245, 57, 21];
        case 3:
            return [245, 97, 41];
        case 4:
            return [245, 141, 63];
        case 5:
            return [249, 185, 84];
        case 6:
            return [250, 225, 104];
        case 7:
            return [160, 226, 110];
        case 8:
            return [62, 210, 97];
        case 9:
            return [70, 227, 166];
        case 10:
            return [75, 234, 211];
        case 11:
            return [79, 240, 251];
        case 12:
            return [84, 203, 246];
        case 13:
            return [56, 158, 240];
        case 14:
            return [48, 119, 234];
        case 15:
            return [37, 58, 235];
        default:
            return [37, 58, 235];
    }
}