vapp = new function(){
    var vapp = this,
        feeds = {},
        defaultFeeds = { 'mine' : { title: 'Моё видео', tabSource: 'mine' }}
        currentFeed = 'mine',
        appId = null;

    /**
     * initialize for vapp application
     * @param opts
     * opts.appId {Int} - app id of vk application
     */
    vapp.init = function(opts){
        opts = opts || {};

        currentFeed = opts.currentFeed || currentFeed;
        feeds = opts.feeds || defaultFeeds;
        apiId = opts.apiId || apiId;

        vapp.nodes = {
            'body' : $('body'),
            'window' : $('window'),
            'heap' : $('#node-heap'),
            'page' : $('#vapp-page'),
            'navigation' : $('#vapp-header_nav'),
        }

        vapp.resetFeed();
        vapp.initBinds();
        vapp.vkInit(vapp.vkCheck);
    };

    vapp.changeFeed = function(feed){
        if ( typeof feed != 'string') return false;
        if ( !feeds[feed] ) return false;

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

    vapp.resetFeed = function(){
        vapp.vids = [];
        vapp.vidsIdsLoaded = [];
        vapp.feedOffset = 0;
        vapp.feedLimit = 50;
    };

    vapp.vkCheck = function(){
        if ( !vapp.inited ) { vapp.vkInit( vapp.vkCheck ) }

        VK.Auth.getLoginStatus(function( response ){
            if ( response.status ){

            } else {

            }
        })
    };

    vapp.vkInit = function(callback){
        VK.init({ apiId: apiId });

        vapp.inited = true;

        if ( callback ) callback();
    };

    function _onResize(){
        vapp.windowHeight = vapp.nodes.window.height();
        vapp.windowWidth = vapp.nodes.window.width();
    }

    function _onMove(event){
        if(typeof event == 'undefined' ) return;

        vapp.mouseX = event.pageX;
        vapp.mouseY = event.pageY;
    }

    vapp.initBinds = function(){
        _onResize();

        vapp.nodes.body.bind('resize', _onResize);
        vapp.nodes.body.bind('move', _onMove);
    }
}


vapp.renderer = function(page, data){
    if ( this[page] ) return this[page](data);
};

vapp.renderer.welcome = function(){

};

vapp.renderer.notLoggined = function(){

};

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
};

function indexOf(arr, value, from) { for (var i = from || 0, l = (arr || []).length; i < l; i++) { if (arr[i] == value) return i; } return -1; };
function inArray(value, arr) { return indexOf(arr, value) != -1; };
function ge(el) { return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el; };
function objLength(obj) {
    if (typeof obj != 'object') return 0;

    var length = 0;

    for(var key in obj) if ( obj.hasOwnProperty(key) ) { length += 1; }

    return length;
};
function getByField(arr, field, val) {
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
// templates cache
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