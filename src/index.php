<?php

function getFilesize($filename) {
    // Validate filename to prevent path traversal and command injection
    $realpath = realpath($filename);
    if ($realpath === false) {
        return false;
    }

    // Ensure the file is within allowed directory (adjust as needed)
    $allowed_dir = realpath(__DIR__ . '/uploads');
    if ($allowed_dir !== false && strpos($realpath, $allowed_dir) !== 0) {
        return false;
    }

    $size = @filesize($realpath);
    if ($size === false || $size < 0) {
        // Use escapeshellarg to safely escape the filename for shell command
        $escaped_filename = escapeshellarg($realpath);
        $size = trim((string) shell_exec("stat -c%s " . $escaped_filename));
        if (!is_numeric($size)) {
            return false;
        }
        $size = (int) $size;
    }
    return $size;
}

function processFile($filename) {
    $size = getFilesize($filename);
    if ($size === false) {
        die("Invalid file");
    }
    if ($size > 1000000) {
        die("File too large");
    }
    return $size;
}

// Validate input exists and is a string
if (!isset($_POST["file"]) || !is_string($_POST["file"])) {
    die("Invalid input");
}

$filesize = getFilesize($_POST["file"]);
var_dump($filesize);
