var CLASS_ITEM = "list-item";
var CLASS_SELECTED = "selected";

var PAGE_CNT = 20;
var LOADED = 0;
var ORDER = 'update_datetime';

function removeItem(key){
	DBDiary.child(key).remove();
	$("#list-container").removeClass(CLASS_SELECTED);
	getList(true);
}
function openEdit(key){
	var url = "./edit.html";
	if(key)
		url += "?key=" + key;
	location.href = url;
}
function getListItemView(item){
	var itemView = $('<div/>', {
		class : CLASS_ITEM + " btn"
	});
	itemView[0].data = item.key;
	itemView.on("click", function(){
		if($(this).hasClass(CLASS_SELECTED)){
			$(this).removeClass(CLASS_SELECTED);
			$("#list-container").removeClass(CLASS_SELECTED);
			return;
		}
		$("."+CLASS_ITEM).removeClass(CLASS_SELECTED);
		$(this).addClass(CLASS_SELECTED);
		$("#list-container").addClass(CLASS_SELECTED);
		$('html, body').animate({
			scrollTop: $(this).offset().top -$("#list-container").offset().top - 8
		}, 300);
	});

	var itemContainer = $('<div/>', {
		class : "item-container",
	});
	itemView.append(itemContainer);

	
	$('<h3/>', {
		class : "title item",
	    text : item.title
	}).appendTo(itemContainer);

	$('<p/>', {
		class : "date item",
	    text : new Date(item.update_datetime).toLocaleString()
	}).appendTo(itemContainer);

	$('<div/>', {
		class : "content item",
	    html : item.content
	}).appendTo(itemContainer);


	if(item.attachment){
		var link = 	getAttachmentLink(item.attachment);
		var attachment = $('<div/>', {
			class : "item",
			style : "text-align: left",
			html : link
		});
		attachment.on("click", function(e){
			e.stopPropagation();
		})
		attachment.appendTo(itemContainer);
	}

	$('<p/>', {
		class : "tag item",
	    text : item.tag
	}).appendTo(itemContainer);


	var editArea = $('<div/>', {
		class : "flex-div edit-container",
	});
	editArea.appendTo(itemContainer);

	var editBtn = $('<button/>', {
		class : "btn btn-warning btn-edit",
		text : "EDIT"
	});
	editBtn.appendTo(editArea);

	var deleteBtn = $('<button/>', {
		class : "btn btn-danger btn-delete",
		text : "DELETE"
	});
	deleteBtn.button({loadingText: '<i class="fa fa-circle-o-notch fa-spin"></i>'});
	deleteBtn.appendTo(editArea);
	editBtn.on("click", function(e){
		e.stopPropagation();
		var key = $(this).closest("."+CLASS_ITEM)[0].data;
		openEdit(key);
	});
	deleteBtn.on("click", function(e){
		e.stopPropagation();
		$(this).button('loading');
		console.log($(this).button('loading'));
		var key = $(this).closest("."+CLASS_ITEM)[0].data;
		removeItem(key);
		
	});
	return itemView;
}

function search(){
	location.hash = $("#search").val();
}

function setLoading(loading){
	var btn = $("#btn-search");
	btn[0].loading = loading;
	if(loading){
		btn.button('loading');
	}else{
		btn.button('reset');
	}
}
function isLoading(){
	return  $("#btn-search")[0].loading;
}
function getList(reload = false, force = false){
	if(reload){
		force = true;
		$("#prev").val("");
		$("#next").val("Y")
		$("#list-container").removeClass(CLASS_SELECTED);
	}
	if((!force && isLoading() )|| $("#next").val() == "N"){
		return;
	}

	setLoading(true);
	var prev = $("#prev").val();
	var listRef = DBDiary.orderByChild(ORDER).limitToLast(PAGE_CNT);
	if(prev){
		listRef = listRef.endAt(prev-1, ORDER);	
	}else{
		LOADED = 0;
		$("#list-container").empty();
	}
	var container = $("#list-container");
	listRef.once('value', function(snapshot) {
		var result = snapshot.val();
		var list = []
		//console.log("result" + JSON.stringify(result));
		for(var k in result){
				var item = result[k];
				item.key = k;
				list.push(item);
		}
		if(list.length == 0){
			$("#next").val("N");
		}else{

			list.sort(function(a, b){
				return b.update_datetime - a.update_datetime;
			});
			var keyword = getHashValue();
			var last;
			for(i in list ){
				var item = list[i];
				last = item.update_datetime;

				if(keyword){
					if(item.tag.indexOf(keyword) == -1)
						continue;
				}
				LOADED ++;
				var itemView = getListItemView(item);
				container.append(itemView);
			}
			$("#prev").val(item.update_datetime);
			if(LOADED < PAGE_CNT){
				getList(false, true);
			}else{
				LOADED = 0;
			}
		}
		setLoading(false);
	});
}

function getNext(){
	var sh = $(window).scrollTop() + $(window).height();
	var dh = $(document).height();
	if(sh == dh){
		getList();
	}
}

function getHashValue(){
	return location.hash.replace("#", "");
}
$(document).ready(function(){
	$(window).bind('hashchange', function () {
		$("#search").val(getHashValue());
		getList(true);
	});
	$("#search").val(getHashValue());
	getList(true);
	$(window).on("scroll", getNext);
	$("#btn-add").on("click", function(){
		openEdit();
	});
});