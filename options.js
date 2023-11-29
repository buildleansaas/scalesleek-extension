document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const currentUrlKey = params.get('url');
    populateURLSelector(currentUrlKey);

    const research = document.createElement("button");
    research.textContent = "Research Keywords";
    research.addEventListener("click", function () {
        const selectedCheckboxes = document.querySelectorAll('.rowCheckbox:checked');
        const selectedVideos = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.videoId);

        // Send the selected videos to the popup
        if (selectedVideos.length > 0) {
            chrome.runtime.sendMessage({ action: "researchKeywords", videos: selectedVideos });
        }
    });

    const buttonContainer = document.getElementById("youtube-data-actions");
    buttonContainer.appendChild(research);

    const urlSelector = document.getElementById("urlSelector");
    urlSelector.addEventListener("change", function () {
        const selectedURL = urlSelector.value;
        if (selectedURL) {
            window.location.search = `?url=${encodeURIComponent(selectedURL)}`;
        }
    });

    const imageFilter = document.getElementById("imageFilter");
    imageFilter.addEventListener("change", function () {
        if (currentUrlKey) {
            loadDataIntoList(currentUrlKey);
        }
    });

    // Add event listener to the impression filter input with debounce
    const impressionFilterInput = document.getElementById("viewFilter"); // Ensure this ID matches your HTML
    impressionFilterInput.addEventListener("input", debounce(function () {
        if (currentUrlKey) {
            loadDataIntoList(currentUrlKey);
        }
    }, 500)); // 500ms debounce

    if (currentUrlKey) {
        loadDataIntoList(currentUrlKey);
    }
});

function updateResearchButtonState() {
    const selectedCheckboxes = document.querySelectorAll('.rowCheckbox:checked');
    const researchButton = document.getElementById("researchButton"); // make sure to assign this id to your button
    researchButton.disabled = selectedCheckboxes.length === 0;
}

// Call this function whenever a checkbox state changes
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("rowCheckbox")) {
        updateResearchButtonState();
    }
});

// Initial state update
document.addEventListener("DOMContentLoaded", function () {
    updateResearchButtonState();
});

function populateURLSelector(currentUrlKey) {
    const selector = document.getElementById("urlSelector");
    chrome.storage.local.get(null, function (items) {
        for (let key in items) {
            if (key.startsWith("growth-tools-youtube-videos-")) {
                const url = key.replace("growth-tools-youtube-videos-", "");
                const option = document.createElement("option");
                option.value = url;
                option.textContent = url.replaceAll("https://www.youtube.com/", "");

                if (url === currentUrlKey) {
                    option.selected = true;
                }

                selector.appendChild(option);
            }
        }
    });
}

function parseImpressions(impressions) {
    let multiplier = 1;
    let numericalPart = 0;

    if (impressions.includes("B")) {
        multiplier = 1000000000;
    } else if (impressions.includes("M")) {
        multiplier = 1000000;
    } else if (impressions.includes("K")) {
        multiplier = 1000;
    }

    // Extracting the numerical part, considering decimal points
    const matches = impressions.match(/(\d+(\.\d+)?)/);
    if (matches) {
        numericalPart = parseFloat(matches[0]);
    }

    return numericalPart * multiplier;
}



function sortData(urlKey, ascending) {
    const key = `growth-tools-youtube-videos-${urlKey}`;
    chrome.storage.local.get([key], function (result) {
        if (result[key]) {
            const sortedData = result[key].sort((a, b) => {
                const numA = parseImpressions(a.impressions);
                const numB = parseImpressions(b.impressions);
                return ascending ? numA - numB : numB - numA;
            });
            displayData(sortedData);
        }
    });
}

function displayData(data) {
    const YTVideosListDiv = document.getElementById("youtube-data-explorer");
    YTVideosListDiv.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Add a header for the toggle all checkbox
    const thToggleAll = document.createElement("th");
    const toggleAllCheckbox = document.createElement("input");
    toggleAllCheckbox.type = "checkbox";
    toggleAllCheckbox.id = "toggleAll";
    toggleAllCheckbox.addEventListener("change", function () {
        const allCheckboxes = document.querySelectorAll('.rowCheckbox');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = toggleAllCheckbox.checked;
        });
    });
    thToggleAll.appendChild(toggleAllCheckbox);
    headerRow.appendChild(thToggleAll);

    ["Title", "Impressions", "Image", "Link"].forEach((headerText, index) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.padding = '5px';
        th.style.borderBottom = '1px solid #ddd';

        if (headerText === "Impressions") {
            const sortAscButton = createSortButton("\u25B2", true);
            const sortDescButton = createSortButton("\u25BC", false);
            th.appendChild(sortAscButton);
            th.appendChild(sortDescButton);
        }

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const filterImages = document.getElementById("imageFilter").checked;
    data.forEach(item => {
        if (filterImages && !item.image) {
            return; // Skip items without images if filter is active
        }

        const tr = document.createElement("tr");
        tr.classList.add("fade-in"); // Apply fade-in class for animation

        // Checkbox for each row
        const tdCheckbox = document.createElement("td");
        const rowCheckbox = document.createElement("input");
        rowCheckbox.type = "checkbox";
        rowCheckbox.classList.add("rowCheckbox");
        rowCheckbox.dataset.videoId = item.link;
        tdCheckbox.appendChild(rowCheckbox);
        tr.appendChild(tdCheckbox);

        // Title
        const tdTitle = document.createElement("td");
        tdTitle.textContent = item.title;
        tr.appendChild(tdTitle);

        // Impressions
        const tdImpressions = document.createElement("td");
        tdImpressions.textContent = item.impressions;
        tr.appendChild(tdImpressions);

        // Image
        const tdImage = document.createElement("td");
        if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title;
            img.style.maxWidth = '100px'; // Set max width for images
            tdImage.appendChild(img);
        } else {
            tdImage.textContent = 'No Image';
        }
        tr.appendChild(tdImage);

        // Link
        const tdLink = document.createElement("td");
        const link = document.createElement("a");
        link.href = item.link;
        link.textContent = "View";
        link.target = "_blank";
        tdLink.appendChild(link);
        tr.appendChild(tdLink);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    YTVideosListDiv.appendChild(table);
}

function createSortButton(text, ascending) {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", function () {
        console.log("hello?")
        const currentUrlKey = new URLSearchParams(window.location.search).get('url');
        if (currentUrlKey) {
            console.log(currentUrlKey)
            sortData(currentUrlKey, ascending);
        }
    });
    return button;
}

function loadDataIntoList(urlKey) {
    const key = `growth-tools-youtube-videos-${urlKey}`;
    chrome.storage.local.get([key], function (result) {
        if (result[key]) {
            const originalDataLength = result[key].length;
            const uniqueData = removeDuplicates(result[key]);

            if (uniqueData.length < originalDataLength) {
                // Update storage if duplicates were removed
                chrome.storage.local.set({ [key]: uniqueData }, function () {
                    console.log(`Duplicates removed, updated data for ${key}.`);
                });
            }

            // Sort the data by impressions
            uniqueData.sort((a, b) => parseImpressions(b.impressions) - parseImpressions(a.impressions));

            // Filter logic for greater than or equal to impressions
            const minImpressions = document.getElementById("viewFilter").value;
            const parsedMinImpressions = minImpressions ? parseImpressions(minImpressions + 'K') : 0;

            const filteredData = uniqueData.filter(item => parseImpressions(item.impressions) >= parsedMinImpressions);
            displayData(filteredData);
        }
    });
}

function removeDuplicates(data) {
    const uniqueByLink = new Map();
    data.forEach(item => {
        if (!uniqueByLink.has(item.link)) {
            uniqueByLink.set(item.link, item);
        }
    });
    return Array.from(uniqueByLink.values());
}


// Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}