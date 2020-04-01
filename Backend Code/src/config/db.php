<?php
class db{
    // Properties
    private $dbhost = 'maindb.cx5xvz3hhk0z.ap-south-1.rds.amazonaws.com:3306';
    private $dbuser = 'root';
    private $dbpass = 'db_pass1';
    private $dbname = 'contest_arena';

    // Connect
    public function connect(){
        $mysql_connect_str = "mysql:host=$this->dbhost;dbname=$this->dbname";
        $dbConnection = new PDO($mysql_connect_str, $this->dbuser, $this->dbpass);
        $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbConnection;
    }
}