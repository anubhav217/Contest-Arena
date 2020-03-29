<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app = new \Slim\App([

    'settings' => [
        'displayErrorDetails' => true,
        'debug'               => true,
        'whoops.editor'       => 'sublime',
    ]

]);

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

$app->post('/code', function (Request $request, Response $response, $args) {
    // echo ("All righty!");
    
    $sql = "INSERT INTO code (problem_code, contest_code, user_id, code_content) VALUES (:pcode, :ccode, :userid, :code) ON DUPLICATE KEY UPDATE code_content = VALUES(code_content)";

    $pcode = $request->getParsedBodyParam('pcode', $default = null);
    $ccode = $request->getParsedBodyParam('ccode', $default = null);
    $userid = $request->getParsedBodyParam('uid', $default = null);
    $code = $request->getParsedBodyParam('code', $default = null);

    $msg['result']=[];

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            'pcode' => $pcode,
            'ccode' => $ccode,
            'userid' => $userid,
            'code' => $code
        ]);

        $msg['result'] = ['status'=>"Ok"];

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'Message'=>$e->getMessage()];
    }

    return $response->getBody()->write(json_encode($msg));
});

$app->get('/code/{ccode}/{pcode}/{uid}', function (Request $request, Response $response, $args){
    $ccode = $args['ccode'];
    $pcode = $args['pcode'];
    $userid = $args['uid'];

    $sql = "SELECT code_content FROM code WHERE problem_code = :pcode AND contest_code = :ccode AND user_id = :userid";

    $msg['result']=[];

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':pcode' => $pcode,
            ':ccode' => $ccode,
            ':userid' => $userid
        ]);

        $msg['result'] = ['status'=>"Ok", "body"=>$stmt->fetch()[0]];

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'Message'=>$e->getMessage()];
    }

    return $response->getBody()->write(json_encode($msg));
});