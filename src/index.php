<?php

function getFilesize($filename) {
	$size = @filesize($filename);
	if ($size < 0) {
		$allowedFiles = ['/var/log/app.log', '/tmp/upload.txt'];
		if (in_array($filename, $allowedFiles, true)) {
			$size = trim((string) shell_exec("stat -c%s " . escapeshellarg($filename)));
		} else {
			$size = 0;
		}
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
error_log("File size: " . $filesize);
