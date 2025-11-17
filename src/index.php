<?php

define('MAX_FILE_SIZE', 1000000);

function getFilesize($filename) {
	$size = filesize($filename);
	if ($size === false || $size < 0) {
		$size = trim((string) `stat -c%s $filename`);
	}
	return $size;
}

function processFile($filename) {
	$size = getFilesize($filename);
	if ($size > MAX_FILE_SIZE) {
		throw new Exception("File too large");
	}
	return $size;
}

$filesize = getFilesize($POST["file"]);
var_dump($filesize);
