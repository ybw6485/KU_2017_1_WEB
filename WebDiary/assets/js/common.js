var storageRef;
var DBRef;
var DBDiary;
var DB_NAME = "diary";
var ATTACHMENT_PATH = "attahments";
function getAttachmentLink(attachment){
	var item = $('<a/>', {
		class : "attachment",	
		html : 	[$('<i class="material-icons">attachment</i>'), $('<p/>', {text : attachment.name})],
	    href : attachment.url,
	});
	return item;
}



$(document).ready(function(){
	var config = {
		apiKey: "AIzaSyCCQDPuXuyRJF2Y8oLQJqaKosTuowlLoPQ",
		authDomain: "ku2017web.firebaseapp.com",
		databaseURL: "https://ku2017web.firebaseio.com",
		projectId: "ku2017web",
		storageBucket: "ku2017web.appspot.com",
		messagingSenderId: "676303621218"
	};
	firebase.initializeApp(config);
	storageRef = firebase.storage().ref();
	DBRef = firebase.database().ref();
	DBDiary = DBRef.child(DB_NAME);
});


