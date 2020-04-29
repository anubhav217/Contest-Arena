<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response->withHeader('Access-Control-Allow-Origin', '*')->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, username, authcode')->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

function check_session($auth_code)
{
    $sql = "SELECT * FROM login_credentials WHERE auth_code = :auth_code";

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':auth_code' => $auth_code
        ]);

        if($stmt->rowCount() > 0)
        {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            foreach ($row as $column => $value) {
                if ($column == 'access_token') {
                    return $value;
                }
            }
        }
        else
        {
            return 0;
        }

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
        var_dump($msg);
    }
}

require "routes/code.php";
require "routes/problem.php";
require "routes/login.php";
require "routes/rankings.php";

$app->get('/', function (Request $request, Response $response, array $args) {

    $res['msg'] = "404";
    $response->getBody()->write(json_encode($res));
     
    return $response;
});


// Catch-all route to serve a 404 Not Found page if none of the routes match
// NOTE: make sure this route is defined last
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function($req, $res) {
    $handler = $this->notFoundHandler; // handle using the default Slim page not found handler
    return $handler($req, $res);
});