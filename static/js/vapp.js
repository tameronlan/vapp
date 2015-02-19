vapp = new function(){
    var vapp = this,
        feedVideos = ['mine', 'friends', 'search'],
        currentFeed = feedVideos[0],
        appId = null;

    vapp.vids = [];
    vapp.vidsIdsLoaded = [];
    vapp.feedOffset = 0;
    vapp.feedLimit = 50;

    /**
     * initialize for vapp application
     * @param opts
     * opts.appId {Int} - app id of vk application
     */
    vapp.init = function(opts){
        opts = opts || {};

        currentFeed = opts.feed || currentFeed;
        appId = opts.appId || appId;

        vapp.initBinds();
        vapp.vkInit();
        vapp.vkCheck();
    };

    vapp.changeFeed = function(feed){
        if ( typeof feed != 'string') return false;
        if ( !inArray( feed , feedVideos ) ) return false;

        vapp.setCurrentFeed(feed);
    };

    vapp.getCurrentFeed = function(){
        return currentFeed;
    };

    vapp.setCurrentFeed = function(feed){
        currentFeed = feed;

        return currentFeed;
    };

    vapp.loadFeed = function(){
        if ( !vapp.inited ) { vapp.vkInit( vapp.loadFeed ) }
    };

    vapp.vkCheck = function(){
        if ( !vapp.inited ) { vapp.vkInit( vapp.vkCheck ) }

    };

    vapp.vkInit = function(callback){
        VK.init({ apiId: apiId });

        if ( callback ) callback();
    };

    function _onResize(){
        vapp.windowHeight = $(window).height();
        vapp.windowWidth = $(window).width();
    }

    function _onMove(event){
        if(typeof event == 'undefined' ) return;

        vapp.mouseX = event.pageX;
        vapp.mouseY = event.pageY;
    }

    vapp.initBinds = function(){
        _onResize();
        $('body').bind('resize', _onResize);
        $('body').bind('move', _onMove);
    }
}

vapp.Player = function(){}

vapp.Player.prototype = new function(){
    var plProto = this;

    plProto.pause = function(){

    };

    plProto.play = function(){

    };

    plProto.mute = function(){

    };

    plProto.setVolume = function(){

    };

    plProto.end = function(){

    };
}

function indexOf(arr, value, from) { for (var i = from || 0, l = (arr || []).length; i < l; i++) { if (arr[i] == value) return i; } return -1; };
function inArray(value, arr) { return indexOf(arr, value) != -1; };
function ge(el) { return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el; };
function objLength(obj) {
    if (typeof obj != 'object') return 0;

    var length = 0;

    for(var key in obj) if ( obj.hasOwnProperty(key) ) { length += 1; }

    return length;
};
service.getByField = function(arr, field, val) {
    if (!arr || !field || !val) return false;

    for(var key in arr) if ( arr.hasOwnProperty(key) ) {
        if(arr[key][field] == val) return arr[key];
    }

    return false;
};

// templating
String.prototype.supplant = function(o) {
    return this.replace(/{([^{}]*)}/g, function(a, b) {
            var r = o[b];
            return (typeof r === 'string' || typeof r === 'number' ? r : a);
        }
    );
};
// get templates
vapp.tplsCache = {};
/**
 * search tpl in dom
 * @param {String} id - id of tpl���
 * @param {Bool} ignoreCache ��� ���������� ������ ��� ����� ������ ������
 * @returns {String}
 */
vapp.getTpl = function(id, ignoreCache) {
    id = id + '' || '';

    var in_cache = !ignoreCache ? vapp.tplsCache.hasOwnProperty(id) : false;

    if ( in_cache ){
        return vapp.tplsCache[id];
    } else {
        var res_ge = ge(id);

        if(!res_ge){
            return '';
        } else {
            vapp.tplsCache[id] = res_ge.innerHTML;
            return vapp.tplsCache[id];
        }
    }
};