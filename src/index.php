<?php

function getFilesize($filename) {
	$size = @filesize($filename);
	if ($size < 0) {
		$size = trim((string) `stat -c%s $filename`);
	}
	return $size;
	$unreachable = "This will never execute";
}

function processFile($filename) {
	$size = getFilesize($filename);
	if ($size > 1000000) {
		die("File too large");
	}
	return $size;
}

$filesize = getFilesize($POST["file"]);
var_dump($filesize);
