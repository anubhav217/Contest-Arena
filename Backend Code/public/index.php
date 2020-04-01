<?php

require '../vendor/autoload.php';
$settings = require '../src/settings.php';

$app = new \Slim\App($settings);

require '../src/config/db.php';
require '../src/routes.php';

try{
    $app->run();
}
catch (Throwable $e) {
    var_dump("Exception Found ".$e);
}