<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

function fetchProblemDataFromAPI($pcode, $ccode, $access_token)
{
    $curl = curl_init();
    $msg["result"] = ["status"=>"Ok"];

    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.codechef.com/contests/$ccode/problems/$pcode",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
            "Accept: application/json",
            "Authorization: Bearer $access_token"
        ),
    ));

    $response = curl_exec($curl);

    if (curl_errno($curl)) {
        $error_msg = curl_error($curl);
    }

    // echo (curl_getinfo($curl, CURLINFO_HTTP_CODE));

    if(curl_getinfo($curl, CURLINFO_HTTP_CODE) != 200)
    {
        $error_msg = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    }
    curl_close($curl);

    if (isset($error_msg)) {
        $msg["result"]["status"] = "Error";
        $msg["result"]["body"] = $error_msg;
    }
    else
    {
        $msg["result"]["body"] = $response;
    }

    return $msg;
}

function getProblemDataFromDB($pcode, $ccode)
{
    $sql = "SELECT maxTimeLimit, author, body, problemName, successfulSubmissions FROM problem_details WHERE problem_code = :pcode AND contest_code = :ccode";

    $msg['result']=[];

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':pcode' => $pcode,
            ':ccode' => $ccode
        ]);

        $body = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $key => $value) {
            $body[$key] = $value;
        }

        $msg['result'] = ['status'=>"Ok", "body"=>$body];

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
    }

    return $msg;
}

function storeProblemDataToDB($res, $pcode, $ccode)
{
    $data = json_decode($res);

    if(isset($data->result->data->content))
    {
        $maxTimeLimit = $data->result->data->content->maxTimeLimit;
        $author = $data->result->data->content->author;
        $body = $data->result->data->content->body;
        $problemName = $data->result->data->content->problemName;
        $successfulSubmissions = $data->result->data->content->successfulSubmissions;
    }
    else
    {
        $msg['result'] = ['status'=>"Error", 'body'=>"404"];
        return $msg;
    }

    $sql = "INSERT INTO problem_details (problem_code, contest_code, maxTimeLimit, author, body, problemName, successfulSubmissions) VALUES (:pcode, :ccode, :maxTimeLimit, :author, :body, :problemName, :successfulSubmissions)";

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
            ':maxTimeLimit' => $maxTimeLimit,
            ':author' => $author,
            ':body' => $body,
            ':problemName' => $problemName,
            ':successfulSubmissions' => $successfulSubmissions
        ]);

        $msg = getProblemDataFromDB($pcode, $ccode);

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
        return $msg;
    }

    return $msg;
}

$app->get('/problem/{ccode}/{pcode}', function (Request $request, Response $response, $args){
    $ccode = $args['ccode'];
    $pcode = $args['pcode'];

    $access_token = $request->getHeader('Authorization')[0];

    $msg = getProblemDataFromDB($pcode, $ccode);

    if($msg["result"]["status"] == "Ok")
    {
        if(count($msg["result"]["body"]) == 0)
        {
            $res = fetchProblemDataFromAPI($pcode, $ccode, $access_token);
            if($res["result"]["status"] == "Ok")
                $msg = storeProblemDataToDB($res["result"]["body"],$pcode,$ccode);
            else
            {
                $msg["result"]["status"] = "Error";
                $msg["result"]["body"] = $res["result"]["body"];
            }
        }
    }

    return $response->getBody()->write(json_encode($msg));
});
