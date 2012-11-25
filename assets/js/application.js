/**
 * 
 */
function onDeviceReady() {
	Simnet.Logger.activate();
	$.support.cors = true;
	$.mobile.showPageLoadingMsg();
	$( '#notificationContainer' ).toast();
	
	$( "#loginButton" ).click( function( mouseEvent ) {
		// test simapp & social functions
	} );
};
	
( function( $ ) {
	document.addEventListener("deviceready", onDeviceReady, false);
} )( jQuery );