<?php

function getFilesize($filename) {
	$size = filesize($filename);
	if ($size < 0) {
		$size = trim((string) shell_exec("stat -c%s " . escapeshellarg($filename)));
	}
	return $size;
}

$filesize = getFilesize($POST["file"]);
error_log("Filesize: " . $filesize);
