<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

/**
 * 请求网址
 * @param $url 网址
 * @param $method 提交模式
 * @param $data POST时提交数据
 * @param $cookie 提交的cookie
 * @param $header 提交的协议头
 * @param $returnHeader 是否返回头部 默认不返回
 * @param $returnCookie 是否返回cookie 默认不返回
 * @param $returnSource 是否返回源码 默认返回
 */
function request($url, $method = 'get', $data = '', $cookie = '', $header = '', $returnHeader = false, $returnCookie = false, $returnSource = true)
{
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0');
    curl_setopt($curl, CURLOPT_TIMEOUT, 300);
    curl_setopt($curl, CURLOPT_REFERER, $url);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    if ($method == 'post') {
        curl_setopt($curl, CURLOPT_POST, 1);
        $post_data = array();
        if ($data != "") {
            $data = explode('&', $data);
            foreach ($data as $v) {
                $v = explode('=', $v);
                $post_data[$v[0]] = $v[1];
            }
        }
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    }
    if (substr($url, 0, 8) == 'https://') {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    if ($header) {
        curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    }
    if ($cookie) {
        curl_setopt($curl, CURLOPT_COOKIE, $cookie);
    }
    if ($returnHeader) {
        curl_setopt($curl, CURLOPT_HEADER, 1);
    }
    if ($returnCookie) {
        curl_setopt($curl, CURLOPT_COOKIEJAR, $cookie);
    }
    $result = curl_exec($curl);
    curl_close($curl);
    if ($returnSource || $returnSource == '') {
        return $result;
    }
}

/**
 * 编码转换
 * @param $str 要转换的字符串
 * @param $from 原编码
 * @param $to 转换后的编码
 */
function convert($str, $from = 'gbk', $to = 'utf-8')
{
    if (function_exists('mb_convert_encoding')) {
        return mb_convert_encoding($str, $to, $from);
    } else {
        return iconv($from, $to, $str);
    }
}

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
if ($action == "") {
    $action = isset($_REQUEST['A']) ? $_REQUEST['A'] : '';
}
switch ($action) {
    case 'request':
        $url = isset($_REQUEST['url']) ? $_REQUEST['url'] : '';
        $method = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
        $data = isset($_REQUEST['data']) ? $_REQUEST['data'] : '';
        $cookie = isset($_REQUEST['cookie']) ? $_REQUEST['cookie'] : '';
        $header = isset($_REQUEST['header']) ? $_REQUEST['header'] : '';
        $returnHeader = isset($_REQUEST['returnHeader']) ? $_REQUEST['returnHeader'] : false;
        $returnCookie = isset($_REQUEST['returnCookie']) ? $_REQUEST['returnCookie'] : false;
        $returnSource = isset($_REQUEST['returnSource']) ? $_REQUEST['returnSource'] : true;
        $result = request($url, $method, $data, $cookie, $header, $returnHeader, $returnCookie, $returnSource);
        echo $result;
        break;
    case 'convert':
        $str = isset($_REQUEST['str']) ? $_REQUEST['str'] : '';
        $from = isset($_REQUEST['from']) ? $_REQUEST['from'] : '';
        $to = isset($_REQUEST['to']) ? $_REQUEST['to'] : '';
        $result = convert($str, $from, $to);
        echo $result;
        break;
    default:
        echo '欢迎';
        break;
}
