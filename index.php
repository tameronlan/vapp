<?php
session_start();

error_reporting(E_ALL);

include 'config.php';
include 'functions.php';

if (isset($_COOKIE['lang']) && strpos(ACCEPTED_LANG, $_COOKIE['lang']) !== false)
{
    $_SESSION['lang'] = $_COOKIE['lang'];
}

define("LANG", isset($_SESSION['lang']) ? $_SESSION['lang'] : "en");

$menu = "home";

dispatch();



