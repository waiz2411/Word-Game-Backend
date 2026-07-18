<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LevelController extends Controller
{
    /**
     * Generate a deterministic crossword level based on the level number.
     */
    public function generate($levelNum)
    {
        $levelNum = intval($levelNum);
        if ($levelNum < 1) {
            $levelNum = 1;
        }

        // Seed PHP's random number generator with the level number
        // This ensures the same level number always produces the same puzzle
        srand($levelNum);

        // Load dictionary from words.json
        $wordsPath = storage_path('app/words.json');
        if (file_exists($wordsPath)) {
            $dictionary = json_decode(file_get_contents($wordsPath), true);
        } else {
            // Fallback basic list if file is missing
            $dictionary = ["CREAM", "RACE", "CAR", "RAM", "REACT", "CATER", "TRACE", "RATE", "TEAR", "CARE", "ACRE"];
        }

        // Clean up dictionary (uppercase, trim)
        $dictionary = array_map(function($w) {
            return strtoupper(trim($w));
        }, $dictionary);
        $dictionary = array_unique(array_filter($dictionary, function($w) {
            return strlen($w) >= 3;
        }));

        // Determine difficulty/base word length based on level
        if ($levelNum < 15) {
            $targetLength = 5;
        } elseif ($levelNum < 30) {
            $targetLength = 6;
        } elseif ($levelNum < 50) {
            $targetLength = 7;
        } else {
            $targetLength = 8;
        }

        // Filter potential base words
        $baseWords = array_values(array_filter($dictionary, function($w) use ($targetLength) {
            return strlen($w) == $targetLength;
        }));

        if (empty($baseWords)) {
            // Fallback if no words of that exact length
            $baseWords = array_values(array_filter($dictionary, function($w) {
                return strlen($w) >= 5 && strlen($w) <= 8;
            }));
        }

        // Try generating a layout with up to 10 different base words
        $attempts = 0;
        $maxAttempts = 10;
        $layoutData = null;

        while ($attempts < $maxAttempts) {
            if (empty($baseWords)) {
                break;
            }
            $baseWord = $baseWords[rand(0, count($baseWords) - 1)];
            
            // Generate letter pool from the base word
            $letters = str_split($baseWord);
            sort($letters);

            // Find all sub-words that can be spelled with these letters
            $subWords = $this->findSubWords($letters, $dictionary);

            // Attempt to build a crossword layout
            $layoutData = $this->buildCrossword($baseWord, $subWords);
            if ($layoutData !== null) {
                break;
            }
            $attempts++;
        }

        // Final fallback if generation failed
        if ($layoutData === null) {
            return response()->json([
                'level' => $levelNum,
                'letters' => ['A', 'C', 'E', 'R', 'T'],
                'words' => ['TRACE', 'RACE', 'CARE', 'TEA', 'ACT', 'CAT'],
                'gridSize' => ['rows' => 5, 'cols' => 5],
                'layout' => [
                    ['word' => 'TRACE', 'row' => 1, 'col' => 0, 'direction' => 'H'],
                    ['word' => 'RACE', 'row' => 1, 'col' => 1, 'direction' => 'V'],
                    ['word' => 'CARE', 'row' => 3, 'col' => 1, 'direction' => 'H'],
                    ['word' => 'TEA', 'row' => 0, 'col' => 3, 'direction' => 'V']
                ]
            ]);
        }

        return response()->json([
            'level' => $levelNum,
            'letters' => $layoutData['letters'],
            'words' => $layoutData['words'],
            'gridSize' => $layoutData['gridSize'],
            'layout' => $layoutData['layout']
        ]);
    }

    /**
     * Check if a word can be made from a pool of letters.
     */
    private function canMakeWord($word, $letterCounts)
    {
        $wordLetters = str_split($word);
        $wordCounts = array_count_values($wordLetters);
        foreach ($wordCounts as $char => $count) {
            if (!isset($letterCounts[$char]) || $letterCounts[$char] < $count) {
                return false;
            }
        }
        return true;
    }

    /**
     * Find all words in the dictionary that can be spelled using the letter pool.
     */
    private function findSubWords($letters, $dictionary)
    {
        $letterCounts = array_count_values($letters);
        $subWords = [];
        foreach ($dictionary as $word) {
            if ($this->canMakeWord($word, $letterCounts)) {
                $subWords[] = $word;
            }
        }
        return $subWords;
    }

    /**
     * Build crossword layout using backtracking.
     */
    private function buildCrossword($baseWord, $subWords)
    {
        // Sort subWords by length descending so we place larger words first
        usort($subWords, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        // We want to place between 3 and 6 words
        // Let's cap the candidates to the top 15 words to keep it fast
        $candidates = array_slice($subWords, 0, 15);
        if (!in_array($baseWord, $candidates)) {
            array_unshift($candidates, $baseWord);
        }
        $candidates = array_values(array_unique($candidates));

        if (count($candidates) < 3) {
            return null;
        }

        // Initialize state
        $placed = [];
        $grid = [];

        // Place first word (horizontal at 0, 0)
        $firstWord = $candidates[0];
        $this->placeWordOnGrid($firstWord, 0, 0, 'H', $grid, $placed);

        // Try placing remaining words
        $success = $this->solveCrossword($candidates, 1, $grid, $placed);
        if (!$success || count($placed) < 3) {
            return null;
        }

        // Calculate bounding box and offset coordinates
        $minRow = 999; $maxRow = -999;
        $minCol = 999; $maxCol = -999;
        foreach ($placed as $p) {
            $word = $p['word'];
            $r = $p['row'];
            $c = $p['col'];
            $dir = $p['direction'];
            $len = strlen($word);

            if ($dir == 'H') {
                $minRow = min($minRow, $r);
                $maxRow = max($maxRow, $r);
                $minCol = min($minCol, $c);
                $maxCol = max($maxCol, $c + $len - 1);
            } else {
                $minRow = min($minRow, $r);
                $maxRow = max($maxRow, $r + $len - 1);
                $minCol = min($minCol, $c);
                $maxCol = max($maxCol, $c);
            }
        }

        // Pad grid
        $rowsCount = $maxRow - $minRow + 1;
        $colsCount = $maxCol - $minCol + 1;

        // Offset layout
        $finalLayout = [];
        $finalWords = [];
        foreach ($placed as $p) {
            $finalLayout[] = [
                'word' => $p['word'],
                'row' => $p['row'] - $minRow,
                'col' => $p['col'] - $minCol,
                'direction' => $p['direction']
            ];
            $finalWords[] = $p['word'];
        }

        // Shuffle base word letters for the letter wheel
        $letters = str_split($baseWord);
        shuffle($letters);

        return [
            'letters' => $letters,
            'words' => $finalWords,
            'gridSize' => ['rows' => $rowsCount, 'cols' => $colsCount],
            'layout' => $finalLayout
        ];
    }

    /**
     * Backtracking solver.
     */
    private function solveCrossword($candidates, $index, &$grid, &$placed)
    {
        // If we placed enough words, we can stop
        if (count($placed) >= 6) {
            return true;
        }
        if ($index >= count($candidates)) {
            return count($placed) >= 3;
        }

        $word = $candidates[$index];

        // Find all possible intersections
        $intersections = [];
        $wordLen = strlen($word);

        for ($i = 0; $i < $wordLen; $i++) {
            $char = $word[$i];
            // Look for matching character on grid
            foreach ($grid as $coord => $gridChar) {
                if ($gridChar === $char) {
                    list($r, $c) = explode(',', $coord);
                    $r = intval($r);
                    $c = intval($c);

                    // Determine the direction of the word that placed this letter
                    $parentDir = $this->getLetterDirection($r, $c, $placed);
                    $newDir = ($parentDir == 'H') ? 'V' : 'H';

                    if ($newDir == 'H') {
                        $startRow = $r;
                        $startCol = $c - $i;
                    } else {
                        $startRow = $r - $i;
                        $startCol = $c;
                    }

                    $intersections[] = [
                        'row' => $startRow,
                        'col' => $startCol,
                        'direction' => $newDir
                    ];
                }
            }
        }

        // Try each intersection
        foreach ($intersections as $pos) {
            if ($this->canPlaceWord($word, $pos['row'], $pos['col'], $pos['direction'], $grid, $placed)) {
                // Save grid state for backtracking
                $tempGrid = $grid;
                $tempPlaced = $placed;

                $this->placeWordOnGrid($word, $pos['row'], $pos['col'], $pos['direction'], $grid, $placed);

                if ($this->solveCrossword($candidates, $index + 1, $grid, $placed)) {
                    return true;
                }

                // Backtrack
                $grid = $tempGrid;
                $placed = $tempPlaced;
            }
        }

        // Also try skipped case
        return $this->solveCrossword($candidates, $index + 1, $grid, $placed);
    }

    private function getLetterDirection($row, $col, $placed)
    {
        foreach ($placed as $p) {
            $pr = $p['row'];
            $pc = $p['col'];
            $len = strlen($p['word']);
            if ($p['direction'] == 'H') {
                if ($row == $pr && $col >= $pc && $col < $pc + $len) {
                    return 'H';
                }
            } else {
                if ($col == $pc && $row >= $pr && $row < $pr + $len) {
                    return 'V';
                }
            }
        }
        return 'H'; // fallback
    }

    private function canPlaceWord($word, $row, $col, $dir, $grid, $placed)
    {
        $len = strlen($word);

        // Check if layout size would get too large (max 7x7 size recommended for mobile screen fit)
        // Check relative boundaries
        $minR = $row; $maxR = $row + ($dir == 'V' ? $len - 1 : 0);
        $minC = $col; $maxC = $col + ($dir == 'H' ? $len - 1 : 0);
        foreach ($placed as $p) {
            $plen = strlen($p['word']);
            $pmaxR = $p['row'] + ($p['direction'] == 'V' ? $plen - 1 : 0);
            $pmaxC = $p['col'] + ($p['direction'] == 'H' ? $plen - 1 : 0);
            $minR = min($minR, $p['row']);
            $maxR = max($maxR, $pmaxR);
            $minC = min($minC, $p['col']);
            $maxC = max($maxC, $pmaxC);
        }
        if (($maxR - $minR + 1) > 7 || ($maxC - $minC + 1) > 7) {
            return false;
        }

        // Check if word overlaps/collides/touches incorrectly
        $intersectionCount = 0;
        for ($i = 0; $i < $len; $i++) {
            $r = $row + ($dir == 'V' ? $i : 0);
            $c = $col + ($dir == 'H' ? $i : 0);
            $char = $word[$i];

            if (isset($grid["$r,$c"])) {
                if ($grid["$r,$c"] !== $char) {
                    return false; // Character mismatch
                }
                $intersectionCount++;
            } else {
                // Adjacent cells in perpendicular direction must be empty
                // (except if it is an intersection or part of the same word)
                if ($dir == 'H') {
                    if (isset($grid[($r - 1) . ",$c"]) || isset($grid[($r + 1) . ",$c"])) {
                        return false;
                    }
                } else {
                    if (isset($grid["$r," . ($c - 1)]) || isset($grid["$r," . ($c + 1)])) {
                        return false;
                    }
                }
            }
        }

        // Must have at least 1 intersection with existing words
        if ($intersectionCount === 0) {
            return false;
        }

        // Before start and after end must be empty
        if ($dir == 'H') {
            if (isset($grid["$row," . ($col - 1)]) || isset($grid["$row," . ($col + $len)])) {
                return false;
            }
        } else {
            if (isset($grid[($row - 1) . ",$col"]) || isset($grid[($row + $len) . ",$col"])) {
                return false;
            }
        }

        return true;
    }

    private function placeWordOnGrid($word, $row, $col, $dir, &$grid, &$placed)
    {
        $len = strlen($word);
        for ($i = 0; $i < $len; $i++) {
            $r = $row + ($dir == 'V' ? $i : 0);
            $c = $col + ($dir == 'H' ? $i : 0);
            $grid["$r,$c"] = $word[$i];
        }
        $placed[] = [
            'word' => $word,
            'row' => $row,
            'col' => $col,
            'direction' => $dir
        ];
    }
}
