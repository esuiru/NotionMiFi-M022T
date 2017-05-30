var version_num = "";
var device_name = "";
(function ($) {
    $.fn.objSoftUpdate = function (InIt) {


        var xmlName = '';
        this.onLoad = function () {

            var index = 0;
            this.loadHTML();
            document.getElementById("title").innerHTML = jQuery.i18n.prop(InIt);
            //var xml = callProductXMLNoDuster(xmlName);
            var xml = callProductXML(xmlName);
            var xmlStatus1 = callProductXML("status1");

            lableLocaliztion(document.getElementsByTagName("label"));
            buttonLocaliztion("btUpgrade");
            buttonLocaliztion("btGetSoftVersion");
            $(xml).find("sysinfo").each(function() {
            	version_num =$(this).find("version_num").text(); 
                document.getElementById("lCurrentSoftVersionValue").innerHTML =   $(this).find("version_num").text();
                document.getElementById("lCurrentSoftwareDateValue").innerHTML = "Dec 16 2016"; // please modify before version realse
            });

            $(xmlStatus1).find("sysinfo").each(function() {
            	device_name =$(this).find("device_name").text(); 
            });

            checksoftupgrade();
        }

        this.setXMLName = function (_xmlname) {
            xmlName = _xmlname;
        }
        this.loadHTML = function() {
            document.getElementById('Content').innerHTML = "";
            document.getElementById('Content').innerHTML = callProductHTML("html/router/software_upgrade.html");
            $('#uploadFileForm').ajaxForm({
            success: function() {
                    uploadfiledone();
                    //hm();
                },
            error: function() {
                    //hm();
                }
            });

        }
        return this.each(function () {
        });
    }
})(jQuery);

function checksoftupgrade(){
	var number =0;
	if(version_num.length>0){
		number = parseInt(version_num.substring(version_num.indexOf("_V")+2,version_num.length));
	}
	var my_url = "";
	
	$.ajax({
		type : "GET",
		url : "http://updater2.notioni.com:8080/mifi-softversion-manager/SoftVersionServlet?method=list",
		dataType : "jsonp",
		data : {
			"deviceName":device_name,
			"version":number
		},
		jsonp:"jsonpcallback",
		success : function(data, status) {
			if (data != "" && data[0] != null) {
			my_url = data[0].softUrl;
			tmp = data[0].softVer;
			if(my_url.length>0){
				$("#lCurrentSoftwareListNeed").html(jQuery.i18n.prop("upgrade_soft_need"));
				$("#lCurrentSoftwareListNeed").attr("style","font-size: 14px;font-weight: bold;color: #555789;");
				$("#lCurrentSoftwareList").attr("style","display:block;width: 70px;");
				$("#lCurrentSoftwareList").attr("href",my_url);
			}else{
				$("#lCurrentSoftwareListNeed").html(jQuery.i18n.prop("upgrade_soft_no"));
				$("#lCurrentSoftwareListNeed").attr("style","font-size: 14px;color: gray;");
			}
			return;
		}
		}
	});

		$("#lCurrentSoftwareListNeed").html(jQuery.i18n.prop("upgrade_soft_no"));
		$("#lCurrentSoftwareListNeed").attr("style","font-size: 18px;color: gray;");
		$("#lCurrentSoftwareList").attr("style","display:none;");
}

function upgradeRouter() {
    if(document.getElementById("softVersionUpdateFile").value!="") {
        if(document.getElementById("softVersionUpdateFile").value.toString().lastIndexOf(".bin")==-1) {
            showAlert(jQuery.i18n.prop("BinExtError"));

        } else {

            stopInterval();
            var url;
            var host = window.location.protocol + "//" + window.location.host;
            url = host+getHeader("GET","upgrade");

            //sm('upgradeModalBox',350,170);
            //document.getElementById("h1RouterUpgrade").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
            //document.getElementById("lUploading").innerHTML = jQuery.i18n.prop("lUploading");
            document.getElementById("uploadFileForm").action = url;
            document.getElementById("btnSoftSubmit").click();
            startInterval();
            upLoadFileSuccess();
        }
    } else {
        showAlert(jQuery.i18n.prop("lsoftwareError"));
    }
}

var timeStatusBar,upgradeFileSuccessIntervalID,afterRebootID, timeBurnStatusBar;
var standardTiming = 100000;
var flagIsSuccess = true;

function upLoadFileSuccess() {
    if(document.getElementById("softVersionUpdateFile").value!="") {
        //hm('upgradeModalBox');
        sm('upgradeModalBox1',350,230);
        document.getElementById("h1RouterUpgrade1").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
        document.getElementById("lUpgrade").innerHTML = jQuery.i18n.prop("lDownload");
        document.getElementById("lWarning").innerHTML = jQuery.i18n.prop("lWarning");
        document.getElementById("lWarningLine1").innerHTML = jQuery.i18n.prop("lWarningLine1");
        document.getElementById("lWarningLine2").innerHTML = jQuery.i18n.prop("lWarningLine2");

        //timeStatusBar = setInterval("DownloadstatusBar()", 1200);
        sm("PleaseWait", 150, 100);
    }

}

function upgradeFileSuccess() {

    sm('upgradeModalBox1',350,230);
    document.getElementById("h1RouterUpgrade1").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
    document.getElementById("lUpgrade").innerHTML = jQuery.i18n.prop("lBurnFirm");
    document.getElementById("lWarning").innerHTML = jQuery.i18n.prop("lWarning");
    document.getElementById("lWarningLine1").innerHTML = jQuery.i18n.prop("lWarningLine1");
    document.getElementById("lWarningLine2").innerHTML = jQuery.i18n.prop("lWarningLine2");
	var status=1;
	var progress=0;
	var xml;

	xml= callProductXMLNoDuster("upgrade_firmware");
	if(xml != null)
	{
        status = $(xml).find("upgrade_status").text();
		if(status == "2" || status == "0")
		{
			timeBurnStatusBar = setInterval("BurnstatusBar()", 2000);
		}
	}

}

function uploadfiledone()
{
	clearInterval(timeStatusBar);
	sm('upgradeModalBox1');

	document.getElementById("UpgradeProgressText").innerHTML = "100%";
	document.getElementById("UpgradeProgressPercent").style.width="100%";

	upgradeFileSuccess();
}

function BurnFileSuccess()
{
	document.getElementById("UpgradeProgressText").innerHTML = "100%";
	document.getElementById("UpgradeProgressPercent").style.width="100%";

	clearInterval(timeBurnStatusBar);
	hm('upgradeModalBox1');
 	sm('upgradeModalBox2',319,170);
    document.getElementById("h1RouterUpgrade2").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
    document.getElementById("lReboot").innerHTML = jQuery.i18n.prop("lSuccessReboot");

    afterRebootID =  setInterval("afterReboot()", 20000);
}

function BurnFileFail()
{
	clearInterval(timeBurnStatusBar);
	hm('upgradeModalBox1');
 	sm('upgradeModalBox2',319,170);
    document.getElementById("h1RouterUpgrade2").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
    document.getElementById("lReboot").innerHTML = jQuery.i18n.prop("lFailReboot");

    afterRebootID =  setInterval("afterReboot()", 20000);
}


function afterReboot() {
    hm();
    clearInterval(afterRebootID);
    clearAuthheader();
}
function getStatus(status) {
    switch (status) {
        case "0":
            return        "NET_ERR_STATUS_OK";
        case "160":
            return        "NET_ERR_SWUP_FILE_SIZE";    /* File too big see: MAX_UPGRADE_SIZE */
        case "161":
            return        "NET_ERR_SWUP_BAD_URL";    /* Not an http or ftp url */
        case  "162":
            return        "NET_ERR_SWUP_CONNECTION";    /* Server stalled or not responding */
        case  "163":
            return        "NET_ERR_SWUP_DOWNGRADE";    /* Downgrade */
        case "164":
            return        "NET_ERR_SWUP_REMOTE_NEEDLESS";    /* Remote upgrade needless */
        case "165":
            return        "NET_ERR_SWUP_REMOTE_NEEDED";    /* Remote upgrade need */
        case "166":
            return        "NET_ERR_SWUP_BAD_FILE";    /* Image file corrupt */
        case "167":
            return        "NET_ERR_SWUP_BURN_FAILED";    /* Burn operation failed  */
        case "200":
            return        "NET_GENERIC_ERR";    /* Generic Error */
        case "180":
            return        "NET_ERR_REMOTE_NON_SUPPORT";
        default :
            return        "UNKNOWN_ERROR";
    }
}

var _pixels = 0;
var pxml;

function DownloadstatusBar() {
	++_pixels;    
	document.getElementById("UpgradeProgressText").innerHTML = _pixels+"%";
	document.getElementById("UpgradeProgressPercent").style.width=_pixels+"%";   

	if(_pixels == 100)
	{
		clearInterval(timeStatusBar);	
		sm("PleaseWait", 150, 100);
		afterReboot();
	}
	
}

function BurnstatusBar() {

	var xml = callProductXMLNoDuster("upgrade_firmware");
   	var pixels = $(xml).find("progress").text();
	var status = $(xml).find("upgrade_status").text();
    if(pixels>=100) {
        clearInterval(timeStatusBar);
		clearInterval(timeBurnStatusBar);
        BurnFileSuccess();
    }
	else
	{
		if(status == "1")
		{
			clearInterval(timeStatusBar);
		    clearInterval(timeBurnStatusBar);
			BurnFileSuccess();
		}
		else if(status == "3")
		{
			clearInterval(timeStatusBar);
		    clearInterval(timeBurnStatusBar);
			BurnFileFail();
		}
		else
		{
    		document.getElementById("UpgradeProgressText").innerHTML = pixels+"%";
			document.getElementById("UpgradeProgressPercent").style.width=pixels+"%";
   
		}
	}
}
function burnStatus(xml) {
    clearInterval(afterRebootID);
    clearInterval(timeStatusBar);
    var status=1;
	var xml;
	xml = callProductXMLNoDuster("upgrade");
    if (xml != null) {
        $(xml).find("VersionUpgrade").each(function() {
            status = decodeURIComponent($(this).find("status").text());
        });

        if(status != 0) {
            hm();
            sm('upgradeModalBox3',319,170);
            document.getElementById("h1RouterUpgrade3").innerHTML = jQuery.i18n.prop("h1RouterUpgrade");
            document.getElementById("lUpgradeError").innerHTML = jQuery.i18n.prop("lUpgradeError");
            document.getElementById("lUpgradeError").innerHTML = document.getElementById("lUpgradeError").innerHTML + " " + jQuery.i18n.prop(getStatus(status));
            execCommand("upgrade","SWUP_DELETE");
            flagIsSuccess = false;
        }
    }
}

function setAsDefaultClick() {
    showAlert("still not implement");
}
function getfileName() {
    var filename;
    var pathandfile=document.getElementById("softVersionUpdateFile").value;
    var last=pathandfile.lastIndexOf("\\");
    if(last==-1)
        filename=pathandfile;
    else
        filename=pathandfile.substring(last+1,pathandfile.length);

    document.getElementById("textfield").value=filename;

}

function btnCancelSDUpgradeFailedPopup() {
	hm();
}

function btnCancelSDUpgradeSuccessPopup() {
	hm();
}

function btGetSWList() {
	var mapData = new Array();
	var itemIndex = 0;
	putMapElement(mapData, "RGW/upgrade/sd_upgrade/sd_firmware_check", "1", itemIndex++);

	function loaddata(data) {
                $("#SelUpgradeList").empty();
		$(data).find("sd_upgrade").each(function() {
	        $(this).find("sd_firmware_list").each(function() {
				$(this).find("Item").each(function(){
		            var name = $(this).find("firmware_name").text();
		            var version = $(this).find("firmware_version").text();
		            var date = $(this).find("firmware_date").text();
		            var size = $(this).find("firmware_size").text();

		            var opt = document.createElement("option");
		            document.getElementById("SelUpgradeList").options.add(opt);
		            opt.text = name;
		            opt.value = name;
				})
	         })
	    })
	}
    PostXMLWithResponse("upgrade_firmware",g_objXML.getXMLDocToString(g_objXML.createXML(mapData)),loaddata);
}


function SubmitUpgrade() {
    var mapData = new Array();
    var itemIndex = 0;
    var upgradeName = $("#SelUpgradeList").val();

    putMapElement(mapData, "RGW/upgrade/sd_upgrade/sd_firmware_upgrade_name", upgradeName, itemIndex++);

    function refreshPage(data) {

		var upgrade_status = "4";
		$(data).find("sd_upgrade").each(function() {
			upgrade_status = $(this).find("sd_firmware_upgrade_status").text();
		})

		if(upgrade_status == "3")
		{
			//sm("SDUpgradeSuccessPopup", 350, 150);
			//document.getElementById("h1SDUpgradeSuccessPopup").innerHTML = jQuery.i18n.prop("h1SDUpgradePopup");
			showMsgBox(jQuery.i18n.prop("h1SDUpgradePopup"),jQuery.i18n.prop("lSDUpgradeSuccessText"));
		}
		else if(upgrade_status == "4")
		{
			//sm("SDUpgradeFailedPopup", 350, 150);
			//document.getElementById("h1SDUpgradeFailedPopup").innerHTML = jQuery.i18n.prop("h1SDUpgradePopup");
			showMsgBox(jQuery.i18n.prop("h1SDUpgradePopup"),jQuery.i18n.prop("lSDUpgradeFailedText"));
		}
        //afterRebootID =  setInterval("afterReboot()", 30000);
    }

    PostXMLWithResponse("upgrade_firmware",g_objXML.getXMLDocToString(g_objXML.createXML(mapData)),refreshPage);
}