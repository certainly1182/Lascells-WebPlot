// Declare global variables for serial port, reader stream, logging state, and data arrays
let port;
let readerStream = null;
let startTime = null;
let isLogging = false;
const timeData = [];  // Stores time data for x-axis
const valueData = []; // Stores sensor data for y-axis

// Define the trace for the Plotly plot
const trace = {
    x: timeData,
    y: valueData,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Data'
};

// Define layout of the plot
const layout = {
    // title: 'Live Data Plot',
    xaxis: {
        title: 'Time (s)',
        color: 'black',
        range: [0, 10],
        dtick: 1,
        tickmode: 'linear',
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
};

// Define config of the plot
const config = {
    displaylogo: false,
    reponsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom'],
    scrollZoom: true,
};

// Create an initial empty plot
Plotly.newPlot('plot', [trace], layout, config);

// Connect to the serial port when the connect button is clicked
document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        // Request a serial port and open it with a baud rate of 115200
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        // Enable the start logging button once the port is open
        document.getElementById('startLoggingButton').disabled = false;
    } catch (error) {
        console.error('Error opening serial port:', error); // Handle any errors that occur
    }
});

// Start logging data when the "Start Logging" button is clicked
document.getElementById('startLoggingButton').addEventListener('click', async () => {
    // Clear previous data and initialize start time
    timeData.length = 0;
    valueData.length = 0;
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

    // Release the reader stream lock to stop reading from the serial port
    if (readerStream) {
        readerStream.releaseLock();
        readerStream = null;
    }
});

// Function to read data from the serial port and update the plot
async function readSerialData(readerStream) {
    const buffer = []; // Temporary buffer to store incoming data
    try {
        // Keep reading data while logging is enabled
        while (isLogging) {
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

                    // Add the new time and value to the respective arrays
                    timeData.push(elapsedSeconds);
                    valueData.push(int16Value);

                    // Limit the data array to the last 100 points for performance
                    if (timeData.length > 100) {
                        timeData.shift();
                        valueData.shift();
                    }

                    // Update the plot with the new data
                    Plotly.update('plot', { x: [timeData], y: [valueData] });

                    // Automatically scroll by letting Plotly handle the x-axis range dynamically
                    // Plotly will now automatically adjust the range for the x-axis
                    Plotly.relayout('plot', {
                        'xaxis.autorange': true // Keep autorange enabled for smooth scrolling
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error reading data from serial port:', error);
    } finally {
        // Ensure that the reader stream is released when done
        if (readerStream) {
            readerStream.releaseLock();
            readerStream = null;
        }
    }
}

// Reset data when the "Reset Data" button is clicked
document.getElementById('resetButton').addEventListener('click', () => {
    timeData.length = 0;
    valueData.length = 0;
    startTime = null;
    // Update the plot with the empty data arrays
    Plotly.update('plot', { x: [timeData], y: [valueData] });
    // Enable the start logging button for future use
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