document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const currentUrlKey = params.get('url');
    populateURLSelector(currentUrlKey);

    const urlSelector = document.getElementById("urlSelector");
    urlSelector.addEventListener("change", function () {
        const selectedURL = urlSelector.value;
        if (selectedURL) {
            window.location.search = `?url=${encodeURIComponent(selectedURL)}`;
        }
    });

    // Add event listener to the filter checkbox
    const imageFilter = document.getElementById("imageFilter");
    imageFilter.addEventListener("change", function () {
        if (currentUrlKey) {
            loadDataIntoList(currentUrlKey);
        }
    });

    if (currentUrlKey) {
        loadDataIntoList(currentUrlKey);
    }
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

function loadDataIntoList(urlKey) {
    const key = `growth-tools-youtube-videos-${urlKey}`;
    chrome.storage.local.get([key], function (result) {
        if (result[key]) {
            const dataListDiv = document.getElementById("youtube-data-explorer");
            dataListDiv.innerHTML = ""; // Clear previous content

            // Create a table to display the data
            const table = document.createElement("table");
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            // Create the header row
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["Title", "Impressions", "Image", "Link"].forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                th.style.padding = '5px';
                th.style.borderBottom = '1px solid #ddd';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create the body of the table
            const tbody = document.createElement("tbody");

            // Filter logic
            const filterImages = document.getElementById("imageFilter").checked;
            result[key].forEach(item => {
                if (filterImages && !item.image) {
                    return; // Skip items without images if filter is active
                }

                const tr = document.createElement("tr");

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
                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.title;
                tdImage.appendChild(img);
                tr.appendChild(tdImage);

                // Link
                const tdLink = document.createElement("td");
                const link = document.createElement("a");
                link.href = item.link;
                link.textContent = "View";
                link.target = "_blank"; // Open in new tab
                tdLink.appendChild(link);
                tr.appendChild(tdLink);

                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            dataListDiv.appendChild(table);
        }
    });
}
