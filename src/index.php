<?php

function getFilesize($filename) {
	if (!is_string($filename) || empty($filename)) {
		return false;
	}

	$realPath = realpath($filename);
	if ($realPath === false || !is_file($realPath)) {
		return false;
	}

	$size = filesize($realPath);
	if ($size === false || $size < 0) {
		$escapedPath = escapeshellarg($realPath);
		$size = trim((string) shell_exec("stat -c%s " . $escapedPath));
		if (!is_numeric($size)) {
			return false;
		}
		$size = (int) $size;
	}
	return $size;
}

$filename = isset($_POST["file"]) ? $_POST["file"] : null;
if ($filename !== null) {
	$filesize = getFilesize($filename);
	var_dump($filesize);
} else {
	echo "No file specified";
}
