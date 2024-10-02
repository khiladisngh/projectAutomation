var projectDirPath = "D:/ResearchAndDevelopment/Development/adobeExtendedScripting/sarthak"
var projectFilePath = projectPath + "/project/project.prproj";
var videoFolderPath = projectPath + "/source/videos";
var slideFolderPath = projectPath + "/sarthak/source/slides";
var jsonFilePath = projectPath + "/scripts/sequence_mapping.json";  // Path to the JSON file with sequences


// 1. Read and Parse the JSON File
function readJSONFile(filePath) {
    var jsonFile = new File(filePath);
    if (jsonFile.exists) {
        jsonFile.open('r');
        var content = jsonFile.read();
        jsonFile.close();
        try {
            return JSON.parse(content);  // Return the parsed JSON content
        } catch (e) {
            logStatus("Error: Failed to parse JSON file.");
            return null;
        }
    } else {
        logStatus("Error: JSON file not found - " + filePath);
        return null;
    }
}

// 2. Check if File Exists
function fileExists(filePath) {
    var file = new File(filePath);
    return file.exists;
}

// 3. Log Status (for user feedback)
function logStatus(message) {
    $.writeln(message);  // Write to console for debugging
    alert(message);      // Optional: Pop-up alert for feedback in Premiere Pro
}

// 4. Check for Existing Project
function checkForExistingProject(projectFilePath) {
    var projectFile = new File(projectFilePath);
    if (projectFile.exists) {
        var overwrite = confirm("Project already exists. Do you want to overwrite it?");
        if (overwrite) {
            projectFile.remove();  // Overwrite the project
            app.newProject();
            app.project.saveAs(projectFilePath);
            logStatus("Project overwritten and new project created.");
        } else {
            app.openDocument(projectFilePath);
            logStatus("Opened existing project.");
            return;
        }
    } else {
        app.newProject(projectFilePath);
        app.project.saveAs(projectFilePath);
        logStatus("New project created.");
        app.openDocument(projectFilePath);
    }
}

// Utility function to pause for a set amount of time (milliseconds)
function sleep(milliseconds) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + milliseconds);
}

// Check for Existing Project and Handle Creation/Overwriting
function checkForExistingProject(projectFilePath) {
    var projectFile = new File(projectFilePath);
    
    // Check if the project file exists
    if (projectFile.exists) {
        var overwrite = confirm("Project already exists. Do you want to overwrite it?");
        if (overwrite) {
            logStatus("Overwriting the project...");
            projectFile.remove();  // Remove the old project file
            app.newProject();  // Create a new project
            app.project.saveAs(projectFilePath);  // Save the project
            logStatus("Project overwritten and new project created.");
        } else {
            logStatus("Opening existing project...");
            app.openDocument(projectFilePath);  // Open the existing project
            return;  // Stop further execution as we have opened an existing project
        }
    } else {
        logStatus("Creating a new project...");
        app.newProject(projectFilePath);  // Create a new project if it doesn't exist
        app.project.saveAs(projectFilePath);  // Save the new project
        logStatus("New project created.");
    }

    // Adding a delay to allow the project to fully initialize
    logStatus("Waiting for project to initialize...");
    sleep(2000);  // Wait for 2 seconds (adjust as necessary)
    
    // Now attempt to access the rootItem and create master bins
    if (app.project.rootItem) {
        logStatus("Root item available, creating master bins...");
        createMasterBins();  // Now create bins after the project is initialized
    } else {
        logStatus("Error: rootItem is not available.");
    }
}


// 6. Import Media into Premiere Pro
function importMedia(filePath, bin) {
    if (fileExists(filePath)) {
        bin.importFiles([filePath]);
        logStatus("Imported: " + filePath);
    } else {
        logStatus("Error: Media file not found - " + filePath);
    }
}

// 7. Create a Sequence and Add Media
function createSequence(sequenceName, videoPath, startSlidePath, endSlidePath, videoBin, slideBin, sequenceBin) {
    // Check if the video, start slide, and end slide exist
    if (!fileExists(videoPath) || !fileExists(startSlidePath) || !fileExists(endSlidePath)) {
        logStatus("Error: Missing media for sequence " + sequenceName);
        return;
    }

    // Import the media into their respective bins
    importMedia(videoPath, videoBin);
    importMedia(startSlidePath, slideBin);
    importMedia(endSlidePath, slideBin);

    // Create a new sequence in Premiere Pro
    logStatus("Creating sequence: " + sequenceName);
    var sequence = app.project.createNewSequence(sequenceName, "sequencePreset");  // Use a valid sequence preset
    sequenceBin.append(sequence);  // Add the sequence to the sequence bin

    // Insert start slide at the beginning
    logStatus("Inserting start slide: " + startSlidePath);
    sequence.videoTracks[0].insertClip(new File(startSlidePath), 0);

    // Insert video in the sequence after the start slide
    logStatus("Inserting video: " + videoPath);
    var videoClip = sequence.videoTracks[0].insertClip(new File(videoPath), sequence.videoTracks[0].clips[0].end.seconds);

    // Insert end slide after the video
    logStatus("Inserting end slide: " + endSlidePath);
    sequence.videoTracks[0].insertClip(new File(endSlidePath), videoClip.end.seconds);

    // Apply dissolve transitions between start slide, video, and end slide
    logStatus("Applying dissolve transitions...");
    sequence.videoTracks[0].applyTransition("Dissolve");
    
    logStatus("Sequence created successfully: " + sequenceName);
}

// 8. Process JSON Data and Create Sequences
function createSequencesFromJSON(jsonFilePath, bins) {
    var data = readJSONFile(jsonFilePath);
    if (!data) {
        logStatus("Error: Unable to read JSON file.");
        return;
    }

    // Iterate through sections in JSON data
    for (var i = 0; i < data.sections.length; i++) {
        var section = data.sections[i];
        logStatus("Processing section: " + section.section);

        // Iterate through sequences in each section
        for (var j = 0; j < section.sequences.length; j++) {
            var sequenceData = section.sequences[j];

            // Get the paths for video, start slide, and end slide
            var videoPath = videoFolderPath + "/" + sequenceData.video;
            var startSlidePath = slideFolderPath + "/" + sequenceData.startSlide;
            var endSlidePath = slideFolderPath + "/" + sequenceData.endSlide;

            // Create the sequence
            createSequence(sequenceData.sequenceName, videoPath, startSlidePath, endSlidePath, bins.videoBin, bins.slideBin, bins.sequenceBin);
        }
    }

    logStatus("All sequences processed successfully.");
}

// 9. Main function to initiate the process
function main() {
    // Check for existing project and handle project creation
    checkForExistingProject(projectFilePath);

    // Create Master Bins for organization
    var bins = createMasterBins();

    // Create sequences from the JSON file
    createSequencesFromJSON(jsonFilePath, bins);
}

// Start the process
main();
