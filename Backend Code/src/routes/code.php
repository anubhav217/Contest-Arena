<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->post('/code', function (Request $request, Response $response, $args) {

    $auth_code = $request->getHeader('authcode')[0];
    $access_token = check_session($auth_code);

    if($access_token == 0)
    {
        $msg["result"]["status"] = "Error";
        $msg["result"]["body"] = "Unauthorized";
        $response->getBody()->write(json_encode($msg));
        return $response->withStatus(401);
    }

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

    $auth_code = $request->getHeader('authcode')[0];
    $access_token = check_session($auth_code);

    if($access_token == 0)
    {
        $msg["result"]["status"] = "Error";
        $msg["result"]["body"] = "Unauthorized";
        $response->getBody()->write(json_encode($msg));
        return $response->withStatus(401);
    }

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