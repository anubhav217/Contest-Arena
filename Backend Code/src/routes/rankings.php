<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

function fetchRankingsDataFromAPI($ccode, $access_token)
{
    $curl = curl_init();
    $msg["result"] = ["status"=>"Ok"];

    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.codechef.com/rankings/$ccode?fields=rank,username,countryCode,country,totalScore,institution",
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

function getRankingsDataFromDB($ccode)
{
    $sql = "SELECT rank, username, countryCode, country, totalScore, institution FROM rankings WHERE contest_code = :ccode";

    $msg['result']=[];

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':ccode' => $ccode
        ]);

        $body = array();
        $count = 0;

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
            foreach ($item as $key => $value) {
                $temp[$key] = $value;
            }
            array_push($body, $temp);
        }

        $msg['result'] = ['status'=>"Ok", "body"=>$body];

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
    }

    return $msg;
}

function storeRankingsDataToDB($res, $ccode)
{
    $data = json_decode($res);

    // Get DB Object
    $db = new db();
    // Connect
    $db = $db->connect();

    $msg['result']=[];
    
    foreach ($data->result->data->content as $item) {
        $rank = $item->rank;
        $username = $item->username;
        $countryCode = $item->countryCode;
        $country = $item->country;
        $totalScore = $item->totalScore;
        $institution = $item->institution;

        $sql = "INSERT INTO rankings (contest_code, rank, username, countryCode, country, totalScore, institution) VALUES (:ccode, :rank, :username, :countryCode, :country, :totalScore, :institution)";

        try{

            $stmt = $db->prepare($sql);

            $stmt->execute([
                ':ccode' => $ccode,
                ':rank' => $rank,
                ':username' => $username,
                ':countryCode' => $countryCode,
                ':country' => $country,
                ':totalScore' => $totalScore,
                ':institution' => $institution
            ]);

        } catch(PDOException $e){
            $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
            return $msg;
        }
    }
    
    $msg = getRankingsDataFromDB($ccode);
    return $msg;
}

$app->get('/rankings/{ccode}', function (Request $request, Response $response, $args){
    $ccode = $args['ccode'];

    $auth_code = $request->getHeader('authcode')[0];
    $access_token = check_session($auth_code);

    if($access_token == 0)
    {
        $msg["result"]["status"] = "Error";
        $msg["result"]["body"] = "Unauthorized";
        $response->getBody()->write(json_encode($msg));
        return $response->withStatus(401);
    }
    else
    {
        $msg = getRankingsDataFromDB($ccode);

        if($msg["result"]["status"] == "Ok")
        {
            if(count($msg["result"]["body"]) == 0)
            {
                $res = fetchRankingsDataFromAPI($ccode, $access_token);
                if($res["result"]["status"] == "Ok")
                    $msg = storeRankingsDataToDB($res["result"]["body"],$ccode);
                else
                {
                    $msg["result"]["status"] = "Error";
                    $msg["result"]["body"] = $res["result"]["body"];
                }
            }
        }
    }

    return $response->getBody()->write(json_encode($msg));
});