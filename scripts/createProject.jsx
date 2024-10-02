/**
 * Adobe Premiere Pro ExtendScript
 * 
 * This script automates project setup, media import, and sequence creation based on a JSON configuration.
 * It includes enhanced logging with message prefixes, timestamped logs, external log file recording,
 * dynamic path separators for cross-platform compatibility, robust error handling, JSON validation,
 * and optimized media import operations.
 */

// ---------------------------- Configuration ----------------------------

// Determine the path separator based on the operating system
var PATH_SEPARATOR = Folder.fs === "Windows" ? "\\" : "/";

// Project path
var PROJECT_DIR_PATH = "D:" + PATH_SEPARATOR + "ResearchAndDevelopment" + PATH_SEPARATOR + "Development" + PATH_SEPARATOR + "adobeExtendedScripting" + PATH_SEPARATOR + "projectAutomation"

// Paths Configuration
var CONFIG = {
    projectDirPath: "D:" + PATH_SEPARATOR + "ResearchAndDevelopment" + PATH_SEPARATOR + "Development" + PATH_SEPARATOR + "adobeExtendedScripting" + PATH_SEPARATOR + "projectAutomation",
    projectFilePath: PROJECT_DIR_PATH + PATH_SEPARATOR + "project" + PATH_SEPARATOR + "project.prproj",
    videoFolderPath: PROJECT_DIR_PATH + PATH_SEPARATOR + "source" + PATH_SEPARATOR + "videos",
    slideFolderPath: PROJECT_DIR_PATH + PATH_SEPARATOR + "source" + PATH_SEPARATOR + "slides",
    jsonFilePath: PROJECT_DIR_PATH + PATH_SEPARATOR + "scripts" + PATH_SEPARATOR + "sequence_mapping.json",
    logFilePath: PROJECT_DIR_PATH + PATH_SEPARATOR + "scripts" + PATH_SEPARATOR + "script_log.txt" // Path to the external log file
};

// Logging Types with Prefixes
var LOG_TYPES = {
    INFO: "[INFO]",
    SUCCESS: "[SUCCESS]",
    WARNING: "[WARNING]",
    ERROR: "[ERROR]"
};

// ---------------------------- Utilities ----------------------------

/**
 * Logs a message to both the ExtendScript console and an external log file with a specified type prefix and timestamp.
 * @param {string} message - The message to log.
 * @param {string} type - The type of message ('INFO', 'SUCCESS', 'WARNING', 'ERROR').
 */
function log(message, type) {
    type = type || 'INFO'; // Set default type to 'INFO' if undefined
    var prefix = LOG_TYPES[type] || LOG_TYPES.INFO;

    // Get current timestamp in YYYY-MM-DD HH:MM:SS format
    var now = new Date();
    var timestamp = now.getFullYear() + "-" +
        ("0" + (now.getMonth() + 1)).slice(-2) + "-" +
        ("0" + now.getDate()).slice(-2) + " " +
        ("0" + now.getHours()).slice(-2) + ":" +
        ("0" + now.getMinutes()).slice(-2) + ":" +
        ("0" + now.getSeconds()).slice(-2);

    var formattedMessage = "[" + timestamp + "] " + prefix + " " + message;

    // Log to console
    $.writeln(formattedMessage);

    // Log to external file
    try {
        var logFile = new File(CONFIG.logFilePath);
        if (!logFile.exists) {
            logFile.encoding = "UTF-8";
            logFile.open("w");
            logFile.writeln("=== Script Log Started ===");
            logFile.close();
        }
        logFile.open("a");
        logFile.writeln(formattedMessage);
        logFile.close();
    } catch (e) {
        $.writeln("[ERROR] Failed to write to log file: " + e.message);
    }
}

/**
 * Checks if a file exists at the given path.
 * @param {string} filePath - The path to the file.
 * @returns {boolean} - True if the file exists, else false.
 */
function fileExists(filePath) {
    try {
        var file = new File(filePath);
        return file.exists;
    } catch (e) {
        log("Error checking file existence: " + e.message, 'ERROR');
        return false;
    }
}

/**
 * Imports media files into a specified bin in Premiere Pro in batches.
 * @param {string[]} filePaths - Array of file paths to import.
 * @param {Bin} bin - The target bin for imported media.
 */
function importMediaFiles(filePaths, bin) {
    var existingFiles = [];
    var missingFiles = [];

    for (var i = 0; i < filePaths.length; i++) {
        if (fileExists(filePaths[i])) {
            existingFiles.push(filePaths[i]);
        } else {
            missingFiles.push(filePaths[i]);
        }
    }

    if (existingFiles.length > 0) {
        try {
            app.project.importFiles(existingFiles, 0, bin, false);
            for (var j = 0; j < existingFiles.length; j++) {
                log("Imported: " + existingFiles[j], 'SUCCESS');
            }
        } catch (e) {
            log("Error importing files: " + e.message, 'ERROR');
        }
    }

    if (missingFiles.length > 0) {
        for (var k = 0; k < missingFiles.length; k++) {
            log("Missing file: " + missingFiles[k], 'WARNING');
        }
    }
}

/**
 * Parses a JSON file, validates its structure, and returns the parsed object.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Object|null} - Parsed JSON object or null if parsing/validation fails.
 */
function parseJSONFile(filePath) {
    if (!fileExists(filePath)) {
        log("JSON file not found: " + filePath, 'ERROR');
        return null;
    }

    var jsonFile = new File(filePath);
    try {
        jsonFile.open('r');
        var content = jsonFile.read();
        jsonFile.close();
        var parsedData = JSON.parse(content);
        if (validateJSON(parsedData)) {
            return parsedData;
        } else {
            log("JSON validation failed for file: " + filePath, 'ERROR');
            return null;
        }
    } catch (e) {
        log("Error parsing JSON file: " + e.message, 'ERROR');
        return null;
    }
}

/**
 * Validates the structure of the parsed JSON data.
 * @param {Object} data - The parsed JSON data.
 * @returns {boolean} - True if valid, else false.
 */
function validateJSON(data) {
    if (!data.sections || !(data.sections instanceof Array)) {
        log("Invalid JSON structure: 'sections' array is missing or not an array.", 'ERROR');
        return false;
    }
    for (var i = 0; i < data.sections.length; i++) {
        var section = data.sections[i];
        if (!section.section || !section.sequences || !(section.sequences instanceof Array)) {
            log("Invalid section structure at index " + i + ".", 'ERROR');
            return false;
        }
        for (var j = 0; j < section.sequences.length; j++) {
            var seq = section.sequences[j];
            if (!seq.video || !seq.startSlide || !seq.endSlide || !seq.sequenceName) {
                log("Invalid sequence structure at section '" + section.section + "', sequence index " + j + ".", 'ERROR');
                return false;
            }
        }
    }
    return true;
}

/**
 * Shifts all clips in video and audio tracks after a specific time by a given duration.
 * @param {Sequence} sequence - The target sequence.
 * @param {number} startTime - The time (in seconds) after which to shift clips.
 * @param {number} shiftDuration - The duration (in seconds) to shift clips by.
 */
function shiftAllTracks(sequence, startTime, shiftDuration) {
    try {
        // Shift Video Tracks
        for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
            var track = sequence.videoTracks[i];
            for (var j = 0; j < track.clips.numItems; j++) {
                var clip = track.clips[j];
                if (clip.start.seconds >= startTime) {
                    clip.start = clip.start.seconds + shiftDuration;
                }
            }
        }

        // Shift Audio Tracks
        for (var i = 0; i < sequence.audioTracks.numTracks; i++) {
            var track = sequence.audioTracks[i];
            for (var j = 0; j < track.clips.numItems; j++) {
                var clip = track.clips[j];
                if (clip.start.seconds >= startTime) {
                    clip.start = clip.start.seconds + shiftDuration;
                }
            }
        }

        log("Shifted all tracks after " + startTime + " seconds by " + shiftDuration + " seconds.", 'INFO');
    } catch (e) {
        log("Error shifting tracks: " + e.message, 'ERROR');
    }
}

/**
 * Creates a new bin with a specified name and color.
 * @param {string} name - The name of the bin.
 * @param {number} colorLabel - The color label index.
 * @param {Bin} parentBin - The parent bin where the new bin will be created.
 * @returns {Bin|null} - The created bin or null if creation fails.
 */
function createBin(name, colorLabel, parentBin) {
    try {
        var bin = parentBin.createBin(name);
        bin.setColorLabel(colorLabel);
        log("Created bin: " + name, 'SUCCESS');
        return bin;
    } catch (e) {
        log("Error creating bin '" + name + "': " + e.message, 'ERROR');
        return null;
    }
}

// ---------------------------- Core Functionality ----------------------------

/**
 * Initializes the Premiere Pro project.
 */
function initializeProject() {
    try {
        var projectFile = new File(CONFIG.projectFilePath);
        if (app.isDocument(CONFIG.projectFilePath)) {
            app.project.closeDocument(0, true);
            log("Closed existing project document.", 'INFO');
        }

        if (projectFile.exists) {
            var overwrite = confirm("A project already exists at:\n" + CONFIG.projectFilePath + "\n\nDo you want to overwrite it?", 1, "Overwrite Confirmation");
            if (overwrite) {
                var removed = projectFile.remove();
                if (removed) {
                    app.newProject(CONFIG.projectFilePath);
                    app.project.saveAs(CONFIG.projectFilePath);
                    log("Overwritten existing project and created a new one.", 'SUCCESS');
                } else {
                    log("Failed to remove existing project file.", 'ERROR');
                }
            } else {
                app.openDocument(CONFIG.projectFilePath);
                log("Opened existing project.", 'SUCCESS');
            }
        } else {
            app.newProject(CONFIG.projectFilePath);
            app.project.saveAs(CONFIG.projectFilePath);
            log("Created and saved a new project.", 'SUCCESS');
        }
    } catch (e) {
        log("Error initializing project: " + e.message, 'ERROR');
    }
}

/**
 * Sets up the project bin structure.
 * @returns {Object} - An object containing references to the created bins.
 */
function setupBins() {
    try {
        var rootBin = app.project.rootItem;
        var masterBin = createBin("Master Bin", 3, rootBin);
        if (!masterBin) throw new Error("Failed to create Master Bin.");

        var videoBin = createBin("Videos", 6, masterBin);
        var slideBin = createBin("Slides", 6, masterBin);
        var sequenceBin = createBin("Sequences", 6, masterBin);

        return { masterBin: masterBin, videoBin: videoBin, slideBin: slideBin, sequenceBin: sequenceBin };
    } catch (e) {
        log("Error setting up bins: " + e.message, 'ERROR');
        return null;
    }
}

/**
 * Creates a new sequence from a specified clip.
 * @param {string} clipName - The name of the clip to base the sequence on.
 * @param {string} sequenceName - The name of the new sequence.
 * @param {Bin} bin - The bin where the sequence will be created.
 * @param {Bin} sourceBin - The bin from where to fetch the clips.
 * @returns {Sequence|null} - The created sequence or null if creation fails.
 */
function createSequenceFromClip(clipName, sequenceName, bin, sourceBin) {
    try {
        var clipItem = findClipByName(clipName, sourceBin);
        if (!clipItem) {
            log("Clip '" + clipName + "' not found in bin '" + sourceBin.name + "'.", 'WARNING');
            return null;
        }

        var sequence = app.project.createNewSequenceFromClips(sequenceName, [clipItem], bin);
        log("Created sequence: " + sequence.name, 'SUCCESS');
        return sequence;
    } catch (e) {
        log("Error creating sequence '" + sequenceName + "': " + e.message, 'ERROR');
        return null;
    }
}

/**
 * Finds a clip by its name within a specified bin.
 * @param {string} clipName - The name of the clip to find.
 * @param {Bin} bin - The bin to search within.
 * @returns {ProjectItem|null} - The found clip or null if not found.
 */
function findClipByName(clipName, bin) {
    try {
        for (var i = 0; i < bin.children.numItems; i++) {
            var item = bin.children[i];
            if (item.name === clipName && item.type === ProjectItemType.CLIP) {
                return item;
            }
        }
        return null;
    } catch (e) {
        log("Error finding clip '" + clipName + "': " + e.message, 'ERROR');
        return null;
    }
}

/**
 * Inserts a slide clip into a sequence at a specified position.
 * @param {string} clipName - The name of the clip to insert.
 * @param {Sequence} sequence - The target sequence.
 * @param {number} insertAt - The time (in seconds) to insert the clip.
 * @param {string} position - Position relative to insertAt ('before', 'after', 'end').
 * @param {Bin} bin - The bin containing the clip.
 * @param {number} vTrackIndex - The video track index.
 * @param {number} aTrackIndex - The audio track index.
 */
function insertSlideClipInSequence(clipName, sequence, insertAt, position, bin, vTrackIndex, aTrackIndex) {
    try {
        var clipItem = findClipByName(clipName, bin);
        if (!clipItem) {
            log("Clip '" + clipName + "' not found in bin '" + bin.name + "'.", 'WARNING');
            return;
        }

        var clipDuration = clipItem.getOutPoint().seconds - clipItem.getInPoint().seconds;
        var targetTime = insertAt;

        if (position === "before") {
            shiftAllTracks(sequence, insertAt, clipDuration);
        } else if (position === "after") {
            targetTime += clipDuration;
        } else if (position !== "end") {
            log("Invalid position parameter '" + position + "'. Use 'before', 'after', or 'end'.", 'WARNING');
            return;
        } else {
            targetTime = sequence.end;
        }

        sequence.insertClip(clipItem, targetTime, vTrackIndex, aTrackIndex);
        log("Inserted clip '" + clipName + "' " + position + " position at " + targetTime + " seconds.", 'SUCCESS');
    } catch (e) {
        log("Error inserting clip '" + clipName + "': " + e.message, 'ERROR');
    }
}

/**
 * Processes the JSON configuration to set up sequences and insert slides.
 * @param {Object} data - The parsed JSON data.
 * @param {Bin} videoBin - The bin containing video clips.
 * @param {Bin} slideBin - The bin containing slide clips.
 * @param {Bin} sequenceBin - The bin where sequences will be organized.
 */
function processJSONData(data, videoBin, slideBin, sequenceBin) {
    try {
        if (!data.sections || !(data.sections instanceof Array)) {
            log("Invalid JSON structure: 'sections' array is missing or not an array.", 'ERROR');
            return;
        }

        // Collect all video and slide files for batch import
        var videoFilesToImport = [];
        var slideFilesToImport = [];

        for (var i = 0; i < data.sections.length; i++) {
            var section = data.sections[i];
            log("Processing section: " + section.section, 'INFO');

            var sectionBin = createBin(section.section, 13, sequenceBin);
            if (!sectionBin) {
                log("Skipping section '" + section.section + "' due to bin creation failure.", 'WARNING');
                continue;
            }

            if (!section.sequences || !(section.sequences instanceof Array)) {
                log("No sequences found in section '" + section.section + "'.", 'WARNING');
                continue;
            }

            for (var j = 0; j < section.sequences.length; j++) {
                var sequenceData = section.sequences[j];
                videoFilesToImport.push(CONFIG.videoFolderPath + PATH_SEPARATOR + sequenceData.video);
                slideFilesToImport.push(CONFIG.slideFolderPath + PATH_SEPARATOR + sequenceData.startSlide);
                slideFilesToImport.push(CONFIG.slideFolderPath + PATH_SEPARATOR + sequenceData.endSlide);
            }
        }

        // Batch import all video files
        log("Importing all video files in a single batch.", 'INFO');
        importMediaFiles(videoFilesToImport, videoBin);

        // Batch import all slide files
        log("Importing all slide files in a single batch.", 'INFO');
        importMediaFiles(slideFilesToImport, slideBin);

        // Now, iterate again to create sequences and insert slides
        for (var i = 0; i < data.sections.length; i++) {
            var section = data.sections[i];
            log("Processing section: " + section.section, 'INFO');

            var sectionBin = findBinByName(section.section, sequenceBin);
            if (!sectionBin) {
                log("Section bin '" + section.section + "' not found. Skipping.", 'WARNING');
                continue;
            }

            if (!section.sequences || !(section.sequences instanceof Array)) {
                log("No sequences found in section '" + section.section + "'.", 'WARNING');
                continue;
            }

            for (var j = 0; j < section.sequences.length; j++) {
                var sequenceData = section.sequences[j];
                try {
                    var videoPath = CONFIG.videoFolderPath + PATH_SEPARATOR + sequenceData.video;
                    var startSlidePath = CONFIG.slideFolderPath + PATH_SEPARATOR + sequenceData.startSlide;
                    var endSlidePath = CONFIG.slideFolderPath + PATH_SEPARATOR + sequenceData.endSlide;
                    var sequenceName = sequenceData.sequenceName;

                    // Create Sequence
                    log("Creating sequence: " + sequenceName, 'INFO');
                    var sequence = createSequenceFromClip(sequenceData.video, sequenceName, sectionBin, videoBin);
                    if (!sequence) {
                        log("Failed to create sequence '" + sequenceName + "'.", 'WARNING');
                        continue;
                    }

                    // Insert Start Slide
                    log("Inserting start slide: " + sequenceData.startSlide, 'INFO');
                    insertSlideClipInSequence(sequenceData.startSlide, sequence, 0, "before", slideBin, 0, 0);

                    // Insert End Slide
                    log("Inserting end slide: " + sequenceData.endSlide, 'INFO');
                    insertSlideClipInSequence(sequenceData.endSlide, sequence, 0, "end", slideBin, 0, 0);

                    log("Sequence '" + sequenceName + "' created successfully.", 'SUCCESS');
                } catch (seqError) {
                    log("Error processing sequence '" + sequenceData.sequenceName + "': " + seqError.message, 'ERROR');
                }
            }
        }
    } catch (e) {
        log("Error processing JSON data: " + e.message, 'ERROR');
    }
}

/**
 * Finds a bin by its name within a specified parent bin.
 * @param {string} binName - The name of the bin to find.
 * @param {Bin} parentBin - The parent bin to search within.
 * @returns {Bin|null} - The found bin or null if not found.
 */
function findBinByName(binName, parentBin) {
    try {
        for (var i = 0; i < parentBin.children.numItems; i++) {
            var bin = parentBin.children[i];
            if (bin.name === binName && bin.type === ProjectItemType.BIN) {
                return bin;
            }
        }
        log("Bin '" + binName + "' not found within '" + parentBin.name + "'.", 'WARNING');
        return null;
    } catch (e) {
        log("Error finding bin '" + binName + "': " + e.message, 'ERROR');
        return null;
    }
}

// ---------------------------- Polyfill ----------------------------

// JSON Polyfill for ExtendScript (if not natively supported)
if (typeof JSON === 'undefined') {
    JSON = {
        parse: function (sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: function (vContent) {
            if (vContent instanceof Object) {
                var sOutput = '';
                if (vContent.constructor === Array) {
                    for (var nId = 0; nId < vContent.length; nId++) {
                        sOutput += this.stringify(vContent[nId]) + ',';
                    }
                    return '[' + sOutput.slice(0, -1) + ']';
                }
                if (vContent.toString !== Object.prototype.toString) {
                    return '"' + vContent.toString().replace(/"/g, '\\$&') + '"';
                }
                for (var sProp in vContent) {
                    if (vContent.hasOwnProperty(sProp)) {
                        sOutput += '"' + sProp.replace(/"/g, '\\$&') + '":' + this.stringify(vContent[sProp]) + ',';
                    }
                }
                return '{' + sOutput.slice(0, -1) + '}';
            }
            return typeof vContent === 'string' ? '"' + vContent.replace(/"/g, '\\$&') + '"' : String(vContent);
        }
    };
}

// ---------------------------- Main Execution ----------------------------

(function main() {
    log("=== Premiere Pro Automation Script Started ===", 'INFO');

    // Initialize Project
    initializeProject();

    // Setup Bins
    var bins = setupBins();
    if (!bins) {
        log("Bin setup failed. Exiting script.", 'ERROR');
        return;
    }

    // Parse JSON Configuration
    var jsonData = parseJSONFile(CONFIG.jsonFilePath);
    if (!jsonData) {
        log("Failed to load JSON configuration. Exiting script.", 'ERROR');
        return;
    }

    // Process JSON Data
    processJSONData(jsonData, bins.videoBin, bins.slideBin, bins.sequenceBin);

    log("=== Premiere Pro Automation Script Completed ===", 'INFO');
})();
