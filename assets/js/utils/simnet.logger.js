/**
 * 
 */
/*global $ jQuery */
;
if( !Simnet ) {
   var Simnet = {};
};

$.extend(Simnet, {
    Logger: {
        active: false,
        config: {
            separator: " - "
        },
        LEVEL: {
            TRACE: 0x01,
            DEBUG: 0x02,
            INFO: 0x03,
            WARN: 0x04,
            ERROR: 0x05,
            CRIT: 0x06,
            FATAL: 0x07
        },
        getLevel: function(level) {
            switch (level) {
            case Simnet.Logger.LEVEL.TRACE:
                return "[TRACE]";
            case Simnet.Logger.LEVEL.DEBUG:
                return "[DEBUG]";
            case Simnet.Logger.LEVEL.INFO:
                return "[INFO]";
            case Simnet.Logger.LEVEL.WARN:
                return "[WARN]";
            case Simnet.Logger.LEVEL.ERROR:
                return "[ERROR]";
            case Simnet.Logger.LEVEL.CRIT:
                return "[CRIT]";
            case Simnet.Logger.LEVEL.FATAL:
                return "[FATAL]";
            }
        },
        activate: function() {
            Simnet.Logger.active = true;
        },
        deactivate: function() {
            Simnet.Logger.active = false;
        },
        log: function(level, message) {
            if (!Simnet.Logger.active) {
                return;
            }
            var date = Date.now(),
            	dateFormat = "yyyy-MM-dd HH:mm:ss",
                level = Simnet.Logger.getLevel( level );
            // TODO : manage filter
            // TODO : checking about arguments
            console.log( level + Simnet.Logger.config.separator + date.toString( dateFormat ) + Simnet.Logger.config.separator + message, Array.prototype.slice.call( arguments, 2 ) );
        },
        trace: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.TRACE, message);
        },
        debug: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.DEBUG, message);
        },
        info: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.INFO, message);
        },
        warn: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.WARN, message);
        },
        error: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.ERROR, message);
        },
        crit: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.CRIT, message);
        },
        fatal: function(message) {
            Simnet.Logger.log(Simnet.Logger.LEVEL.FATAL, message);
        }
    }
});