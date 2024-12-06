// Declare global variables for serial port, reader stream, logging state, and data arrays
let port;
let readerStream = null;
let startTime = null;
let isLogging = false;
let scalingFactor = 1;
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
        title: 'Voltage (V)',
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

    if (!('serial' in navigator)) {
        notSupported.style.display = 'block'; // Show the box
    }

    const selectProductButton = document.getElementById("selectProductButton");
    const productMenu = document.getElementById("productMenu");
    const closeProductMenu = document.getElementById("closeProductMenu");

    // Open modal
    selectProductButton.addEventListener("click", () => {
        productMenu.style.display = "block";
    });

    // Close modal
    closeProductMenu.addEventListener("click", () => {
        productMenu.style.display = "none";
    });

    // Close modal when clicking outside of the modal content
    window.addEventListener("click", (event) => {
        if (event.target === productMenu) {
            productMenu.style.display = "none";
        }
    });

    // Attach click listeners to each product tile
    const productTiles = document.querySelectorAll('.product-tile');
    productTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            // Remove the 'active' class from all tiles
            productTiles.forEach(t => t.classList.remove('active'));
            
            // Add the 'active' class to highlight the clicked tile
            tile.classList.add('active');

            // Retrieve unit and scaling factor for the selected product
            const unit = tile.getAttribute('data-unit');
            const tileScalingFactor = parseFloat(tile.getAttribute('data-scaling-factor'));

            // Update plot y-axis title
            updateYAxisTitle(unit);

            // Update the scaling factor for voltage data
            scalingFactor = tileScalingFactor;
            
            // Get the name of the selected product
            const productName = tile.querySelector('h3').textContent;
            // Update the current product display
            document.getElementById('currentProduct').textContent = `Logging: ${productName}`;

            console.log(`Selected product with unit: ${unit}, scale: ${scale}`);
        });
    });
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
    
    // Disable the dropdown menus
    document.getElementById('samplingPeriod').disabled = true;
    document.getElementById('voltageRange').disabled = true;
    
    // Get the selected values from the dropdowns
    const samplingPeriod = document.getElementById('samplingPeriod').value;
    const voltageRange = document.getElementById('voltageRange').value;
    
    // Map the dropdown values to corresponding UART codes
    const samplingCode = {
        "10": "1",
        "100": "2",
        "1000": "3",
        "10000": "4",
        "60000": "5"
    }[samplingPeriod];

    const voltageCode = {
        "auto": "A",
        "200mV": "B",
        "2V": "C",
        "20V": "D"
    }[voltageRange];

    const commandString = `>${samplingCode}${voltageCode}\r\n`;
    console.log(`Sending UART command: ${commandString}`);

    // Send the command string over UART
    if (port && port.writable) {
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode(commandString));
        writer.releaseLock();
    } else {
        console.error('Serial port not writable');
    }

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
    document.getElementById('resetButton').disabled = false;
});

async function readSerialData(readerStream) {
    let buffer = ''; // Temporary buffer to store incoming string data
    try {
        while (true) {
            const { value, done } = await readerStream.read(); // Read incoming data
            if (done) break; // Exit if no more data

            if (value) {
                const text = new TextDecoder().decode(value);
                buffer += text;

                let endIndex;
                while ((endIndex = buffer.indexOf("\n\r")) !== -1) {
                    const dataString = buffer.slice(0, endIndex);
                    buffer = buffer.slice(endIndex + 2);
                    
                    const rawValue = parseFloat(dataString.trim());

                    if (isNaN(rawValue)) {
                        console.error('Invalid data received:', dataString);
                        continue;
                    }

                    const scaledValue = rawValue * scalingFactor; // Apply scaling
                    const currentTime = Date.now();
                    const elapsedSeconds = (currentTime - startTime) / 1000;

                    if (isLogging) {
                        timeData.push(elapsedSeconds);
                        valueData.push(scaledValue);

                        Plotly.extendTraces('plot', {
                            x: [[elapsedSeconds]],
                            y: [[scaledValue]]
                        }, [0]);

                        if (trace.stream.maxpoints && timeData.length > trace.stream.maxpoints) {
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
    // Clear the timeData and valueData arrays
    timeData.length = 0;
    valueData.length = 0;

    // Reinitialize the trace object to clear any old data
    const newTrace = {
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Data',
        stream: {
            token: 'MU/TH/UR', // Same stream token
            maxpoints: 100 // Same max points
        }
    };

    // Clear the plot
    Plotly.purge('plot');
    // Create a new plot with the reinitialized trace
    Plotly.newPlot('plot', [newTrace], layout, config);

    // Enable the start logging button again
    document.getElementById('startLoggingButton').disabled = false;
    // Enable the dropdown menus
    document.getElementById('samplingPeriod').disabled = false;
    document.getElementById('voltageRange').disabled = false;
});

// Save data as CSV when the "Save Data as CSV" button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
    // Create CSV string from timeData and valueData arrays
    const csvContent = "Time (s),Voltage\n" + timeData.map((t, i) => `${t},${valueData[i]}`).join("\n");
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

document.getElementById('zoomButton').addEventListener('click', function() {
    const plotDiv = document.getElementById('plot');
    
    // Trigger Plotly's modebar zoom mode
    Plotly.relayout(plotDiv, {
        'dragmode': 'zoom'  // Set dragmode to 'zoom'
    });
    
    // Add event listener for when zooming is complete
    plotDiv.on('plotly_relayout', function(eventData) {
        // Check if zooming occurred (there will be changes in the xaxis or yaxis ranges)
        if (eventData['xaxis.range[0]'] || eventData['yaxis.range[0]']) {
            // Automatically return to pan mode after zooming
            Plotly.relayout(plotDiv, {
                'dragmode': 'pan'  // Set dragmode back to pan
            });
        }
    });
});

// Function to update the x-axis title dynamically
function updateYAxisTitle(unit) {
    const plotDiv = document.getElementById('plot');
    Plotly.relayout(plotDiv, {
        'yaxis.title.text': `${unit}`
    });
}

// Handle Clear Selection button
document.getElementById('clearSelectionButton').addEventListener('click', function() {
    // Remove the 'active' class from any selected product tile
    const activeProductTiles = document.querySelectorAll('.product-tile.active');
    activeProductTiles.forEach(tile => {
        tile.classList.remove('active');
    });

    // Update plot y-axis title
    updateYAxisTitle('Voltage (V)');

    // Update the scaling factor for voltage data
    scalingFactor = 1;
    
    // Update the current product display
    document.getElementById('currentProduct').textContent = `No product selected`;
    
    console.log(`Cleared product selection`);
});
