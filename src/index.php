<?php

/**
 * Get the size of a file safely without command injection vulnerabilities.
 *
 * @param string $filename The path to the file.
 * @return int|false The file size in bytes, or false on failure.
 */
function getFilesize($filename) {
	// Validate that the filename is a string and not empty
	if (!is_string($filename) || empty($filename)) {
		return false;
	}

	// Resolve the real path to prevent directory traversal attacks
	$realPath = realpath($filename);
	if ($realPath === false) {
		return false;
	}

	// Use PHP's built-in filesize function which is safe
	$size = filesize($realPath);

	// For large files (>2GB on 32-bit systems), filesize may return negative
	// In this case, we use a safe alternative without shell commands
	if ($size < 0) {
		// Use fseek/ftell for large file support instead of shell commands
		$fp = @fopen($realPath, 'rb');
		if ($fp === false) {
			return false;
		}
		if (fseek($fp, 0, SEEK_END) === 0) {
			$size = ftell($fp);
		}
		fclose($fp);
	}

	return $size;
}

// Validate and sanitize input
if (!isset($_POST["file"]) || !is_string($_POST["file"])) {
	http_response_code(400);
	echo "Error: Invalid file parameter";
	exit;
}

$filename = $_POST["file"];
$filesize = getFilesize($filename);

if ($filesize === false) {
	http_response_code(404);
	echo "Error: File not found or inaccessible";
	exit;
}

var_dump($filesize);
