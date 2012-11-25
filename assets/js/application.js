/**
 * 
 */
function onDeviceReady() {
	Simnet.Logger.activate();
	$.support.cors = true;
	$.mobile.showPageLoadingMsg();
	$( '#notificationContainer' ).toast();
	
	SimFacebook.init();
	
	$( "#loginButton" ).click( function( mouseEvent ) {
		// test simapp & social functions
		SimFacebook.postMessage( "This is a simple test" );
	} );
};
	
( function( $ ) {
	document.addEventListener("deviceready", onDeviceReady, false);
} )( jQuery );