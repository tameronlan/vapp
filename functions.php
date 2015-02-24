<?php

function dispatch() {
    
    $page = 'index';

    header('Content-Type: text/html;charset=UTF-8');

    $URL = $_SERVER['REQUEST_URI'];
    $len = strpos($URL, '?');

    $explodeParams = explode('?', $URL);
    $paramsStr = count(explode('?', $URL)) > 1 ? $explodeParams[1] : '' ;
    $parametrs = array();

    if(strlen($paramsStr) > 0){
        $paramsPairs = explode('&', $paramsStr);
        for($i= 0; $i < count($paramsPairs) ;$i++){
            $explodePairs = explode('=', $paramsPairs[$i]);
            $index = $explodePairs[0];
            $value = $explodePairs[1];
            $parametrs[$index] = $value;
        }
    }

    if ($len) {
        $URL = substr($URL, 1, $len-2);
    }

    $arr = explode('/', $URL);

    if ( isset($arr[1]) ) {
        $page = $arr[1];
    } else {
        $page = $arr[0];
    }
    
    if ($page == "") {
        $page = 'index';
    }
    
    define("TPLS_PATH", "tpl/");
    
    switch ($page) {
        case "index":
            require_once TPLS_PATH.'vapp.php';
            break;
        case "icns":
            require_once TPLS_PATH.'icns.html';
            break;
        default:
            require TPLS_PATH.'error.php';
    }

}
