<?php

function saveFile($filename, $format, $content) {
    $fl = fopen($filename . '.' . $format, 'w');
    fwrite($fl, $content);
    fclose($fl);
}

$mimeTypes = array('xls' => 'application/vnd.ms-excel', 'xml' => 'application/xml', 'html' => 'text/html', 'cvs' => 'text/plain', 'tsv' => 'text/plain', 'json' => 'text/plain',  'array' => 'text/plain');

if (isset($_POST['format']) && isset($_POST['filename']) && isset($_POST['content'])) {
    $filename = $_POST['filename'];
    $format = $_POST['format'];
    $content = stripslashes($_POST['content']);
	
    $fullName = $filename . '.' . $format;
    saveFile($filename, $format, $content);
    header('Pragma: public');
    header('Expires: 0'); 
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0'); 
    header('Cache-Control: private', false);
    header('Content-Type: ' . $mimeTypes[$format]);
    header('Content-Disposition: attachment; filename="' . $fullName . '"');
    header('Content-Length: ' . filesize($fullName));     
    readfile($fullName);
    unlink($fullName);
}

?>
