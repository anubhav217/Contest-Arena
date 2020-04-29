<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

function take_user_to_codechef_permissions_page($config){

    $params = array('response_type'=>'code', 'client_id'=> $config['client_id'], 'redirect_uri'=> $config['redirect_uri'], 'state'=> 'xyz');
    header('Location: ' . $config['authorization_code_endpoint'] . '?' . http_build_query($params));
    die();
}

function generate_access_token_first_time($config, $oauth_details){

    $oauth_config = array('grant_type' => 'authorization_code', 'code'=> $oauth_details['authorization_code'], 'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret'], 'redirect_uri'=> $config['redirect_uri']);
    $response = json_decode(make_curl_request($config['access_token_endpoint'], $oauth_config), true);
    $result = $response['result']['data'];

    $oauth_details['access_token'] = $result['access_token'];
    $oauth_details['refresh_token'] = $result['refresh_token'];
    $oauth_details['scope'] = $result['scope'];

    return $oauth_details;
}

function generate_access_token_from_refresh_token($config, $oauth_details){
    $oauth_config = array('grant_type' => 'refresh_token', 'refresh_token'=> $oauth_details['refresh_token'], 'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret']);
    $response = json_decode(make_curl_request($config['access_token_endpoint'], $oauth_config), true);
    $result = $response['result']['data'];

    $oauth_details['access_token'] = $result['access_token'];
    $oauth_details['refresh_token'] = $result['refresh_token'];
    $oauth_details['scope'] = $result['scope'];

    return $oauth_details;

}

function store_session($config, $oauth_details)
{
    $path = $config['api_endpoint']."users/me";
    $response = make_api_request($oauth_details, $path);
    $data = json_decode($response);
    $username = $data->result->data->content->username;
    $auth_code = bin2hex(random_bytes(20));
    $access_token = $oauth_details['access_token'];
    $refresh_token = $oauth_details['refresh_token'];

    $sql = "INSERT INTO login_credentials (username, auth_code, access_token, refresh_token) VALUES (:username, :auth_code, :access_token, :refresh_token) ON DUPLICATE KEY UPDATE auth_code = VALUES(auth_code), access_token = VALUES(access_token), refresh_token = VALUES(refresh_token)";

    try{
        // Get DB Object
        $db = new db();
        // Connect
        $db = $db->connect();

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':username' => $username,
            ':auth_code' => $auth_code,
            ':access_token' => $access_token,
            ':refresh_token' => $refresh_token
        ]);

    } catch(PDOException $e){
        $msg['result'] = ['status'=>"Error", 'body'=>$e->getMessage()];
        var_dump($msg);
    }

    return $auth_code;
}

function make_api_request($oauth_config, $path){
    $headers[] = 'Authorization: Bearer ' . $oauth_config['access_token'];
    return make_curl_request($path, false, $headers);
}

function make_curl_request($url, $post = FALSE, $headers = array())
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    if ($post) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
    }

    $headers[] = 'content-Type: application/json';
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    return $response;
}

$app->get('/login', function (Request $request, Response $response, $args) {

    $config = array('client_id'=> 'c05ec8e1ed3b1e305a62308a140bb50b',
        'client_secret' => '8990a3aeae4b9746f3ec00ffc2930780',
        'api_endpoint'=> 'https://api.codechef.com/',
        'authorization_code_endpoint'=> 'https://api.codechef.com/oauth/authorize',
        'access_token_endpoint'=> 'https://api.codechef.com/oauth/token',
        'redirect_uri'=> 'https://www.wannacode.tech/login',
        'website_base_url' => 'https://safe-wildwood-95576.herokuapp.com/');

    $oauth_details = array('authorization_code' => '',
        'access_token' => '',
        'refresh_token' => '');

    if(isset($_GET['code'])){
        $oauth_details['authorization_code'] = $_GET['code'];
        $oauth_details = generate_access_token_first_time($config, $oauth_details);
        
        //maintain a session between the intermediate server and client
        $auth_code = store_session($config, $oauth_details);

        $params = array('access_token'=>$oauth_details['access_token'], 'refresh_token'=>$oauth_details['refresh_token'], 'auth_code'=>$auth_code);
        setcookie('auth_code', $auth_code, time() + 60*60*24*30, '/');
        header('Location: '.'https://safe-wildwood-95576.herokuapp.com/?'. http_build_query($params));
        die();
    } else{
        take_user_to_codechef_permissions_page($config);
    }

    return $response;
});