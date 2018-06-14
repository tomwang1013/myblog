(function(allVariable) {
  var privated = 'feild_224852204965216426';
  var _self = allVariable;
  
	//自定义控件渲染初始化方法
	_self.init = function(res) {
		var privateId = res.privateId;
		var messageObj = res.adaptation.childrenGetData(privateId);//获取自定义控件值对象
    
    if (messageObj.auth === 'hide') {
      return;
    }
    
		var adaptation = res.adaptation;
		var showValue = messageObj.showValue || cmp.i18n("collaboration.pighole.click");
		
    var showHTML = 
      '<section class="cap4-depart is-one" style="background:' + messageObj.extra.fieldBg + '">' +
        '<div class="cap4-depart__content" style="border-bottom-width: 1px; border-bottom-style: solid; ">' +
          '<div class="cap4-depart__left" style="color:'+ messageObj.extra.fieldTitleDefaultColor + '">' + messageObj.display + '</div>' +
          '<div class="cap4-depart__right">' +
            '<div class="cap4-depart__real">' +
              '<div id="tap-area-' + privateId + '" class="cap4-depart__real--edit">' +
                '<div id="input-' + privateId + '" class="cap4-depart__real--ret" style="color:' + messageObj.extra.placeholderColor + '">' + showValue + '</div>' +
                '<div id="arrow-' + privateId + '" class="cap4-depart__real--arrow" style="display: none">' +
                  '<i class="icon CAP cap-icon-youjiantou"></i>' +
                  '<i class="icon CAP cap-icon-shanchu-X"></i>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
		
		var div = document.getElementById(privateId);
		div.innerHTML = showHTML;
		
		_self.initShow(privateId, adaptation);
    
		//改变时触发事件
		adaptation.ObserverEvent.listen('Event' + privateId, function() {
			_self.initShow(privateId, adaptation);
		});
	}
	
	_self.initShow = function(privateId, adaptation) {
		// 重新获取,计算后值可能有变化
		var messageObj = adaptation.childrenGetData(privateId);
		var rightButton = document.getElementById("arrow-" + privateId);
		
    if(messageObj.auth === "edit") { // 编辑态
      rightButton.style.display = "block";
			document.getElementById("tap-area-" + privateId).addEventListener('tap', function() {
				_self.popHandWriter(messageObj);
			});
    } else/*  if (messageObj.auth === 'browse') */ { // 浏览态
      rightButton.style.display = "none";
    }
  }
  
  // 弹出签名对话框
  _self.popHandWriter = function popHandWriter(messageObj) {
    var affairId = cmp.href.getParam().affairId || '-1';
    var formId = messageObj.formdata.rawData.content.contentDataId;
    
    cmp.handWriteSignature.show({
      summaryID: formId,
      affairId: affairId,
      fieldName: messageObj.id + '_' + formId,
      fieldValue: '',
      height: 100,
      width: 200,
      signatureListUrl: cmp.serverIp + '/seeyon/rest/signet/signets/' + affairId,
      signaturePicUrl: cmp.serverIp + '/seeyon/rest/signet/signetPic',

      success: function success(data) {
        
      },

      error: function error(error) {
        console.error(error);
      }
    })
  }    
  
  window[privated] = allVariable;
})({});
