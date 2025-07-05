# YankoviC CLI - UHF Broadcasting System

## 🎵 Overview

The YankoviC CLI has been enhanced with a complete UHF (Ultra High Frequency) broadcasting system that supports multiple display modes for running YankoviC programs. Each "UHF Channel" provides a different way to visualize and interact with YankoviC graphics programs.

## 📺 UHF Channels

### UHF Channel 1 - API Mode (Headless)
- **Command**: `--headless` or `--channel=1`
- **Description**: Runs programs without any visual output
- **Use Case**: Testing, automation, and server-side execution
- **Example**: `node cli.js examples/calculator.yc --headless`

### UHF Channel 3 - Terminal ASCII Display
- **Command**: `--ascii` or `--channel=3` (default)
- **Description**: Displays graphics as ASCII art in the terminal
- **Use Case**: Quick previews, debugging, and retro-style output
- **Features**: Real-time frame counter, optimized performance
- **Example**: `node cli.js examples/calculator.yc --ascii`

### UHF Channel 13 - PNG File Output
- **Command**: `--png` or `--channel=13`
- **Description**: Saves each frame as a PNG image file
- **Use Case**: Creating animations, high-quality output, sharing results
- **Output**: Files saved to `./cli_output/frame_NNNN.png`
- **Features**: Automatic image viewer launch, animation guide
- **Example**: `node cli.js examples/EYKIW_os.yc --png`

### UHF Channel 62 - Standard Display Mode (Electron)
- **Command**: `--electron` or `--channel=62`
- **Description**: Opens an Electron window to display graphics
- **Use Case**: Full-featured GUI display, interactive programs
- **Features**: Real-time frame updates, window management
- **Fallback**: Automatically falls back to PNG mode if Electron is unavailable
- **Example**: `node cli.js examples/calculator.yc --electron`

## 🎸 Working Examples

All examples have been tested and work correctly:

1. **Calculator** - Interactive calculator interface (21 draw commands/frame)
2. **EYKIW_os** - Complete desktop operating system (154 draw commands/frame)
3. **Bouncing Spatula** - Animated graphics demo (5 draw commands/frame)
4. **Drive Thru** - Interactive drive-through simulation
5. **Pokemon Battle** - Turn-based battle system
6. **Spinning Circles** - Animated geometry demo
7. **Weasel Stomping Day** - Holiday-themed program

## 🛠️ Technical Implementation

### CLI Graphics Renderer (`cli-graphics.js`)
- Canvas-based rendering system using HTML5 Canvas API
- Multi-channel output support with channel-specific optimizations
- ASCII art conversion using luminance-based character mapping
- PNG file output with automatic numbering and organization
- Electron window integration with file system watching

### YankoviC Interpreter Integration
- Enhanced UHF library with fallback implementations
- Draw command buffer system for frame-based rendering
- Proper polka loop execution with frame counting
- CLI-specific adaptations for non-interactive environments

### Frame Management
- Automatic frame counting and limiting
- Performance optimizations for ASCII rendering
- Real-time feedback with command counts
- Clean exit handling and resource cleanup

## 🎬 Demo Script

Run `./demo-uhf-channels.sh` to see all channels in action with the calculator example.

## 📊 Performance Notes

- **ASCII Mode**: Optimized for speed with reduced resolution (80x20 characters)
- **PNG Mode**: Full resolution output with automatic file management
- **Electron Mode**: Real-time updates with file system watching
- **Frame Limiting**: Default 60 frames max, configurable with `--max-frames=N`

## 🚀 Usage Tips

1. **Start with ASCII mode** for quick testing and debugging
2. **Use PNG mode** for creating animations or sharing results
3. **Try Electron mode** for full interactive experience
4. **Use headless mode** for automated testing or server deployment
5. **Adjust frame limits** for longer or shorter runs

## 🎉 Status

✅ **COMPLETED**: All UHF channels are fully functional
✅ **TESTED**: All examples work correctly across all channels
✅ **OPTIMIZED**: Performance tuned for each display mode
✅ **DOCUMENTED**: Complete usage guides and examples
✅ **POLISHED**: User-friendly interface and error handling

The YankoviC CLI now provides a complete, professional-grade interface for running and displaying YankoviC programs with multiple output modes to suit any use case!