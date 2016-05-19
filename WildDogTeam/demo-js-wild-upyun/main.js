var testbucket = '<your-bucket>'; // 服务名称<bucket>
var form_api_secret= '<your-secret>';// 表单API密钥 
var wilddogurl = 'https://<your-appId>.wilddogio.com/upyun';//Wilddog 应用


var options = {
  'bucket': testbucket,
  'save-key': '{filemd5}{.suffix}',
  'expiration': Math.floor(new Date().getTime() / 1000) + 86400
};

var policy = window.btoa(JSON.stringify(options));

// 计算签名
var signature = md5(policy + '&' + form_api_secret);

// 图片上传（使用plupload插件）
var uploader = new plupload.Uploader({
    browse_button : 'pickfiles',     //触发文件选择对话框的按钮，为那个元素id
    runtimes: 'html5,flash,html4',
    container: document.getElementById('container'),
    flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
    silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'http://v0.api.upyun.com/' + testbucket, //API基本域名，v0为自动判断最优路线

    multipart_params: {
      'Filename': '${filename}', 
      'Content-Type': '',
      'policy': policy,
      'signature': signature,
    },

    init: {
      PostInit: function() {
        document.getElementById('filelist').innerHTML = '';
        document.getElementById('uploadfiles').onclick = function() {
          uploader.start();
          return false;
        };
      },

      FilesAdded: function(up, files) {
        plupload.each(files, function(file) {
          document.getElementById('filelist').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
        });
      },

      UploadProgress: function(up, file) {
        document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
      },

      FileUploaded: function(up, file, info) {
        var res = JSON.parse(info.response);
        var url;
        if (res.url) {
          url = 'http://'+testbucket+'.b0.upaiyun.com/'+res.url;
        }
        var ref = new Wilddog(wilddogurl);
        // 将图片链接等信息存入 Wilddog
        ref.push({
          "id": randomString(10),
          "name": res.url,
          "url": url,
          "time": new Date().getTime()
        });
      },

      Error: function(up, err) {
        document.getElementById('console').appendChild(document.createTextNode("\nError #" + err.code + ": " + err.message));
      }
    }
});

uploader.init();

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

function addImage(data){
  if(jQuery("#"+data.val().id).length>0){
      return;
  }
  var url = 'http://'+testbucket+'.b0.upaiyun.com/'+data.val().name;
  var $container = $('#masonry');
  var $item =  $("<div  id=\""+data.val().id+"\" class=\"box\"><img title=\""+data.val().name+"\"  src=\""+url+"\"></div>");
  $container.append($item).masonry('appended', $item).masonry({itemSelector: '.box',gutter: 50,isAnimated: true});
     
}

var ref = new Wilddog(wilddogurl);
ref.once('value',function(snapshot){
    var str = "", url ="";
    snapshot.forEach(function(data) {
        url = 'http://'+testbucket+'.b0.upaiyun.com/'+data.val().name;
        str   +=  "<div id=\""+data.val().id+"\" class=\"box\"><img title=\""+data.val().name+"\"  src=\""+url+"\"></div>";
    });
    var $container = $('#masonry');
    $container.append(str);
    $container.imagesLoaded( function(){
         $container.masonry({itemSelector: '.box',gutter: 50,isAnimated: true});
    });
    // 添加监听，实时同步
    ref.on("child_added",function(snapshot){
          addImage(snapshot);
    });

});