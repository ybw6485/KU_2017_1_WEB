function getParam( url, name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}
function makeHash(item){
	var tags = $(item).val().replace(/#/gi, "").split(" ").reduce(function(a,b){
		if (a.indexOf(b) < 0 ) a.push(b);
		return a;}, []);

	var hash = "";
	for(ii in tags){
		var tag = tags[ii];
		if(tag){
			hash += ("#" + tag + " ");
		}
	}
	$(item).val(hash);
}
function uploadItem(item){
	//console.log(item);
	var key = $("#key").val();
	var now = new Date().getTime();
	item.update_datetime = now
	if(key){
		var updates = {};
  		updates['/' + DB_NAME + '/' + key] = item;
  		var result = DBRef.update(updates);
	}else{
		item.create_datetime = now
		var result = DBDiary.push(item);
	}
	alert("Saved!!");
	location.href = "./list.html";
}

function hidePrevAttachment(){
	$("#prev-attachment-container").addClass("addNew");
	$("#prev-attachment")[0].data = "";
}

function initView(){
	if(!$("#prev-attachment")[0].data){
		hidePrevAttachment();
	}
	$("#btn-save").on("click", function(){
		$(this).button('loading');
		makeHash($("#tag")[0]);
		var item = {
			title : $("#title").val(),
			tag : $("#tag").val(),
			content : CKEDITOR.instances.content.getData(),
		};
		var file = $("#attachment")[0].files[0];
		if(file){
			var now = new Date().getTime();
			var metadata = { 'contentType': file.type };
			storageRef.child(ATTACHMENT_PATH+'/' + now +"/"+ file.name).put(file, metadata).then(function(snapshot) {
				var attachment = {
					name : file.name,
					size: snapshot.totalBytes,
					type: file.type,
					url : snapshot.downloadURL
				}
				//console.log(attachment);
				item.attachment = attachment;
				uploadItem(item);
			}).catch(function(error) {
				 console.log('Upload failed:', error);
				 alert("파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
				return;
			});
			return;
		}else{
			if($("#prev-attachment")[0].data)
				item.attachment = $("#prev-attachment")[0].data;
			uploadItem(item);
		}
	});
	$("body").css("display", "block");
}
$(document).ready(function(){
	var key = getParam(location.href, 'key');
	if(key){
		$("#key").val(key);
		DBDiary.orderByKey().equalTo(key).once('value', function(snapshot) {
			var result = snapshot.val()[key];
			//console.log(result);
			if(result){
				$("#title").val(result.title);
				$("#tag").val(result.tag);
				CKEDITOR.instances.content.setData(result.content);
				var attachment = result.attachment;
				if(attachment){
					var link = 	getAttachmentLink(attachment);
					$("#prev-attachment").html(link);
					$("#prev-attachment")[0].data = attachment;
				}
				initView();
			}else{
				alert("잘못된 접근입니다.");
				location.href = "./list.html";
			}
		});
	}else{
		
		initView();
	}
});