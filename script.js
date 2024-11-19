// Declare global variables for serial port, reader stream, logging state, and data arrays
let port;
let readerStream = null;
let startTime = null;
let isLogging = false;
const timeData = [];  // Stores time data for x-axis
const valueData = []; // Stores sensor data for y-axis

// Set up the streaming trace for Plotly
const trace = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Data',
    stream: {
        token: 'MU/TH/UR',  // You can define the stream token (This should be a unique value)
        maxpoints: 100               // The number of points to keep in the plot
    }
};

// Define layout of the plot
const layout = {
    // title: 'Live Data Plot',
    xaxis: {
        title: 'Time (s)',
        color: 'black',
        range: [0, 10],
        fixedrange: false,
        tick0: 0,
        showgrid: true,
    },
    yaxis: {
        title: 'Value',
        color: 'black'
    },
    dragmode: 'pan',
    font: {
        family: 'Open Sans',
        color: 'black',
        size: 18
    },
    margin: {
        t: 20,
        r: 20,
        pad: 5
    },
    title: false
};

// Define config of the plot
const config = {
    displaylogo: false,
    reponsive: true,
    displayModeBar: false,
    modeBarButtonsToRemove: ['zoom'],
    scrollZoom: true,
};

// Hide unsupported browser version message if WebSerial is supported
document.addEventListener('DOMContentLoaded', () => {
    const notSupported = document.getElementById('notSupported');

    if ('serial' in navigator) {
        notSupported.style.display = 'none'; // Hide the box
    }
});

// Create an initial empty plot
Plotly.newPlot('plot', [trace], layout, config);

// Connect to the serial port when the connect button is clicked
document.getElementById('connectButton').addEventListener('click', async () => {
    const connectButton = document.getElementById('connectButton');
    try {
        // Request a serial port and open it
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        // Update UI for successful connection
        connectButton.style.backgroundColor = 'green';
        connectButton.disabled = true;

        // Enable logging controls
        document.getElementById('startLoggingButton').disabled = false;

        console.log('Serial port connected.');

        // Start monitoring the connection
        monitorPortConnection();
    } catch (error) {
        console.error('Error connecting to the serial port:', error);
        alert('Failed to connect to the serial port. Please try again.');
    }
});

// Periodically monitor the port connection status
function monitorPortConnection() {
    // Run monitoring every 5 seconds
    const monitoringInterval = setInterval(() => {
        if (port && port.readable && port.writable) {
            console.log('Port is still connected.');
        } else {
            console.log('Port disconnected.');
            clearInterval(monitoringInterval); // Stop further checks
            handleDisconnect(); // Handle the disconnection
        }
    }, 5000); // Check every 5 seconds
}

// Handle port disconnection
function handleDisconnect() {
    const connectButton = document.getElementById('connectButton');
    connectButton.style.backgroundColor = 'red';
    connectButton.disabled = false;

    document.getElementById('startLoggingButton').disabled = true;
    document.getElementById('stopLoggingButton').disabled = true;

    console.log('Serial port disconnected.');
}

// Start logging data when the "Start Logging" button is clicked
document.getElementById('startLoggingButton').addEventListener('click', async () => {
    // Clear previous data and initialize start time
    startTime = Date.now();
    isLogging = true;
    
    // Disable the start button and enable stop button
    document.getElementById('startLoggingButton').disabled = true;
    document.getElementById('stopLoggingButton').disabled = false;

    // If the port is connected and data is not already being read, start reading
    if (port && !readerStream) {
        readerStream = port.readable.getReader();
        readSerialData(readerStream);
    }
});

// Stop logging when the "Stop Logging" button is clicked
document.getElementById('stopLoggingButton').addEventListener('click', () => {
    isLogging = false;
    // Disable both start and stop buttons after stopping
    document.getElementById('startLoggingButton').disabled = true;
    document.getElementById('stopLoggingButton').disabled = true;
});

let bufferSize = 100;
const bufferSizeInput = document.getElementById('bufferSize');

bufferSizeInput.addEventListener('input', (event) => {
    const value = parseInt(event.target.value, 10);

    // Ensure the entered value is within the valid range
    if (value >= 10 && value <= 1000) {
        bufferSize = value;
        console.log(`Buffer size set to: ${bufferSize}`);
    } else {
        // If out of range, reset to the previous valid buffer size
        alert('Buffer size must be between 10 and 1000.');
        bufferSizeInput.value = bufferSize;
    }
});

// Function to read data from the serial port and update the plot
async function readSerialData(readerStream) {
    const buffer = []; // Temporary buffer to store incoming data
    try {
        // Keep reading data while logging is enabled
        while (true) {
            const { value, done } = await readerStream.read(); // Read incoming data
            if (done) break; // Exit if no more data

            if (value) {
                // Convert the incoming value to a Uint8Array
                const rawBytes = new Uint8Array(value);
                buffer.push(...rawBytes);

                // Process data when there are at least 2 bytes (16-bit value)
                while (buffer.length >= 2) {
                    // Convert the first 2 bytes to an integer (little-endian)
                    const int16Value = new DataView(new Uint8Array(buffer.splice(0, 2)).buffer).getInt16(0, true);
                    // Calculate elapsed time in seconds
                    const currentTime = Date.now();
                    const elapsedSeconds = (currentTime - startTime) / 1000;

                    // Only add data to the plot if logging is active
                    if (isLogging) {
                        // Send the new data to the Plotly stream
                        Plotly.extendTraces('plot', {
                            x: [[elapsedSeconds]],
                            y: [[int16Value]]
                        }, [0]);

                        // Limit the number of points in the stream (for performance)
                        if (trace.stream.maxpoints && timeData.length > trace.stream.maxpoints) {
                            // Ensure the stream only keeps the max number of points
                            Plotly.relayout('plot', { 'xaxis.range': [elapsedSeconds - 10, elapsedSeconds] });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error reading data from serial port:', error);
    }
}

// Reset data when the "Reset Data" button is clicked
document.getElementById('resetButton').addEventListener('click', () => {
    Plotly.purge('plot');  // Clear the plot
    // Create a new plot with an empty stream
    Plotly.newPlot('plot', [trace], layout, config);
    document.getElementById('startLoggingButton').disabled = false;
});

// Save data as CSV when the "Save Data as CSV" button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
    // Create CSV string from timeData and valueData arrays
    const csvContent = "Time (s),Value\n" + timeData.map((t, i) => `${t},${valueData[i]}`).join("\n");
    // Create a Blob object with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    // Create a temporary URL for downloading the Blob as a file
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv"); // Set default file name
    link.click(); // Trigger the download
});

// Function to save the plot as a PNG image
document.getElementById('savePlotButton').addEventListener('click', function() {
    var plotDiv = document.getElementById('plot');
    Plotly.downloadImage(plotDiv, {
        format: 'png',
        width: 1200,
        height: 800,
        filename: 'datalogger_plot'
    });
});

// Function to auto-scale the plot
document.getElementById('autoScaleButton').addEventListener('click', function() {
    var plotDiv = document.getElementById('plot');

    var currentLayout = plotDiv.layout;

    // Reset the axis ranges to auto-scale based on current data
    Plotly.relayout(plotDiv, {
        xaxis: {
            autorange: true,
            title: currentLayout.xaxis.title
        },
        yaxis: {
            autorange: true,
            title: currentLayout.yaxis.title
        }
    });
});