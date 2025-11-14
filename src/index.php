<?php

function getFilesize($filename) {
	if (!file_exists($filename)) {
		return false;
	}
	
	$size = filesize($filename);
	if ($size === false || $size < 0) {
		$size = 0;
	}
	return $size;
}

$filesize = getFilesize($_POST["file"] ?? '');
error_log("File size: " . $filesize);
