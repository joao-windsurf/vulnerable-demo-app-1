<?php

function getFilesize($filename) {
	if (!file_exists($filename)) {
		return false;
	}
	
	if (!is_file($filename)) {
		return false;
	}
	
	$size = filesize($filename);
	if ($size === false) {
		return false;
	}
	
	if ($size < 0) {
		if (PHP_INT_SIZE === 4) {
			$size = sprintf("%u", $size);
		}
	}
	
	return $size;
}

if (isset($_POST["file"])) {
	$filesize = getFilesize($_POST["file"]);
	var_dump($filesize);
} else {
	echo "No file specified";
}
