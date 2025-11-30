<?php

function getFilesize($filename) {
	$size = @filesize($filename);
	if ($size < 0) {
		$allowedFiles = ['/var/www/uploads/', '/tmp/'];
		$isAllowed = false;
		foreach ($allowedFiles as $allowedPath) {
			if (strpos(realpath($filename), realpath($allowedPath)) === 0) {
				$isAllowed = true;
				break;
			}
		}
		if ($isAllowed) {
			$size = trim((string) shell_exec('stat -c%s ' . escapeshellarg($filename)));
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
error_log("Filesize: " . $filesize);
