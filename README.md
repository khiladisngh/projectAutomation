# Adobe Premiere Pro Project Automation

This project automates the setup of Adobe Premiere Pro projects, including media import, sequence creation, and slide insertion based on a JSON configuration file.

## Project Structure

```
├── .gitignore
├── .vscode/ 
│ └── launch.json 
├── LICENSE 
├── project/ 
│ └── project.prproj 
├── README.md 
├── scripts/ 
│ ├── createProject.jsx 
│ ├── fixVideoNames.py 
│ ├── script_log.txt 
│ └── sequence_mapping.json 
├── source/ 
│ ├── pfSense Network Security and Firewall Management.pptx 
│ ├── slides/ 
│ └── videos/
```

## Scripts

### `createProject.jsx`

This ExtendScript automates the following tasks in Adobe Premiere Pro:

- Initializes the Premiere Pro project.
- Sets up the project bin structure.
- Creates sequences from specified clips.
- Inserts slide clips into sequences.
- Processes a JSON configuration to set up sequences and insert slides.

#### Key Functions

- `initializeProject()`: Initializes the Premiere Pro project.
- `setupBins()`: Sets up the project bin structure.
- `createSequenceFromClip(clipName, sequenceName, bin, sourceBin)`: Creates a new sequence from a specified clip.
- `findClipByName(clipName, bin)`: Finds a clip by its name within a specified bin.
- `insertSlideClipInSequence(clipName, sequence, insertAt, position, bin, vTrackIndex, aTrackIndex)`: Inserts a slide clip into a sequence at a specified position.
- `processJSONData(data, videoBin, slideBin, sequenceBin)`: Processes the JSON configuration to set up sequences and insert slides.
- `findBinByName(binName, parentBin)`: Finds a bin by its name within a specified parent bin.

### `fixVideoNames.py`

This Python script renames video files in the `source/videos` directory based on a predefined mapping.

#### Usage

1. Define the directory where the video files are located.
2. Rename the files according to the mapping.

## Configuration

The configuration for the project is defined in the `CONFIG` object in `createProject.jsx`:

```jsx
var CONFIG = {
    projectDirPath: "D:\\ResearchAndDevelopment\\Development\\adobeExtendedScripting\\projectAutomation",
    projectFilePath: PROJECT_DIR_PATH + "\\project\\project.prproj",
    videoFolderPath: PROJECT_DIR_PATH + "\\source\\videos",
    slideFolderPath: PROJECT_DIR_PATH + "\\source\\slides",
    jsonFilePath: PROJECT_DIR_PATH + "\\scripts\\sequence_mapping.json",
    logFilePath: PROJECT_DIR_PATH + "\\scripts\\script_log.txt"
};
```

### JSON Configuration
The JSON configuration file sequence_mapping.json defines the structure for sequences and slides. It should follow this format:

```json
{
    "sections": [
        {
            "section": "Section Name",
            "sequences": [
                {
                    "video": "videoFileName.mp4",
                    "startSlide": "startSlideFileName.png",
                    "endSlide": "endSlideFileName.png",
                    "sequenceName": "Sequence Name"
                }
            ]
        }
    ]
}
```

## Logging
Logs are recorded in `script_log.txt` with different log types: INFO, SUCCESS, WARNING, and ERROR.

## License
This project is licensed under the MIT License. See the LICENSE file for details


This [README.md]() provides an overview of the project, its structure, key scripts, configuration, and usage instructions. Adjust the content as needed to fit your specific project details.