/* * GoSafe Weather Advisor - Client Side Logic
 * Final Stable Version with Full Country Support and JWT Authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_CONFIG = {
        backendBase: 'http://localhost:3000/api'
    };

    // IMPORTANT: Application-level security key, must match the one in your .env
    const BACKEND_API_KEY = 'YOUR_SUPER_SECRET_API_KEY_12345'; 
        
    // =================================================================
    // --- FULL COUNTRY CODE MAPPING (ISO-2 to ISO-3) ---
    // This extended list allows searching all major countries.
    // Data Structure: 'ISO-2 Code': { name: 'Full Name', iso3: 'ISO-3 Code' }
    // =================================================================
    const countryData = {
        "AF": { name: "Afghanistan", iso3: "AFG" }, "AL": { name: "Albania", iso3: "ALB" }, 
        "DZ": { name: "Algeria", iso3: "DZA" }, "AS": { name: "American Samoa", iso3: "ASM" }, 
        "AD": { name: "Andorra", iso3: "AND" }, "AO": { name: "Angola", iso3: "AGO" }, 
        "AR": { name: "Argentina", iso3: "ARG" }, "AM": { name: "Armenia", iso3: "ARM" }, 
        "AU": { name: "Australia", iso3: "AUS" }, "AT": { name: "Austria", iso3: "AUT" }, 
        "AZ": { name: "Azerbaijan", iso3: "AZE" }, "BS": { name: "Bahamas", iso3: "BHS" }, 
        "BH": { name: "Bahrain", iso3: "BHR" }, "BD": { name: "Bangladesh", iso3: "BGD" }, 
        "BB": { name: "Barbados", iso3: "BRB" }, "BY": { name: "Belarus", iso3: "BLR" }, 
        "BE": { name: "Belgium", iso3: "BEL" }, "BZ": { name: "Belize", iso3: "BLZ" }, 
        "BJ": { name: "Benin", iso3: "BEN" }, "BM": { name: "Bermuda", iso3: "BMU" }, 
        "BT": { name: "Bhutan", iso3: "BTN" }, "BO": { name: "Bolivia", iso3: "BOL" }, 
        "BA": { name: "Bosnia and Herzegovina", iso3: "BIH" }, "BW": { name: "Botswana", iso3: "BWA" }, 
        "BR": { name: "Brazil", iso3: "BRA" }, "BN": { name: "Brunei", iso3: "BRN" }, 
        "BG": { name: "Bulgaria", iso3: "BGR" }, "BF": { name: "Burkina Faso", iso3: "BFA" }, 
        "BI": { name: "Burundi", iso3: "BDI" }, "KH": { name: "Cambodia", iso3: "KHM" }, 
        "CM": { name: "Cameroon", iso3: "CMR" }, "CA": { name: "Canada", iso3: "CAN" }, 
        "CV": { name: "Cape Verde", iso3: "CPV" }, "CF": { name: "Central African Republic", iso3: "CAF" }, 
        "TD": { name: "Chad", iso3: "TCD" }, "CL": { name: "Chile", iso3: "CHL" }, 
        "CN": { name: "China", iso3: "CHN" }, "CO": { name: "Colombia", iso3: "COL" }, 
        "KM": { name: "Comoros", iso3: "COM" }, "CR": { name: "Costa Rica", iso3: "CRI" }, 
        "HR": { name: "Croatia", iso3: "HRV" }, "CU": { name: "Cuba", iso3: "CUB" }, 
        "CY": { name: "Cyprus", iso3: "CYP" }, "CZ": { name: "Czech Republic", iso3: "CZE" }, 
        "CD": { name: "Democratic Republic of the Congo", iso3: "COD" }, "DK": { name: "Denmark", iso3: "DNK" }, 
        "DJ": { name: "Djibouti", iso3: "DJI" }, "DO": { name: "Dominican Republic", iso3: "DOM" }, 
        "EC": { name: "Ecuador", iso3: "ECU" }, "EG": { name: "Egypt", iso3: "EGY" }, 
        "SV": { name: "El Salvador", iso3: "SLV" }, "GQ": { name: "Equatorial Guinea", iso3: "GNQ" }, 
        "ER": { name: "Eritrea", iso3: "ERI" }, "EE": { name: "Estonia", iso3: "EST" }, 
        "ET": { name: "Ethiopia", iso3: "ETH" }, "FJ": { name: "Fiji", iso3: "FJI" }, 
        "FI": { name: "Finland", iso3: "FIN" }, "FR": { name: "France", iso3: "FRA" }, 
        "GA": { name: "Gabon", iso3: "GAB" }, "GM": { name: "Gambia", iso3: "GMB" }, 
        "GE": { name: "Georgia", iso3: "GEO" }, "DE": { name: "Germany", iso3: "DEU" }, 
        "GH": { name: "Ghana", iso3: "GHA" }, "GR": { name: "Greece", iso3: "GRC" }, 
        "GT": { name: "Guatemala", iso3: "GTM" }, "GN": { name: "Guinea", iso3: "GIN" }, 
        "GY": { name: "Guyana", iso3: "GUY" }, "HT": { name: "Haiti", iso3: "HTI" }, 
        "HN": { name: "Honduras", iso3: "HND" }, "HU": { name: "Hungary", iso3: "HUN" }, 
        "IS": { name: "Iceland", iso3: "ISL" }, "IN": { name: "India", iso3: "IND" }, 
        "ID": { name: "Indonesia", iso3: "IDN" }, "IR": { name: "Iran", iso3: "IRN" }, 
        "IQ": { name: "Iraq", iso3: "IRQ" }, "IE": { name: "Ireland", iso3: "IRL" }, 
        "IL": { name: "Israel", iso3: "ISR" }, "IT": { name: "Italy", iso3: "ITA" }, 
        "JM": { name: "Jamaica", iso3: "JAM" }, "JP": { name: "Japan", iso3: "JPN" }, 
        "JO": { name: "Jordan", iso3: "JOR" }, "KZ": { name: "Kazakhstan", iso3: "KAZ" }, 
        "KE": { name: "Kenya", iso3: "KEN" }, "KP": { name: "North Korea", iso3: "PRK" }, 
        "KR": { name: "South Korea", iso3: "KOR" }, "KW": { name: "Kuwait", iso3: "KWT" }, 
        "KG": { name: "Kyrgyzstan", iso3: "KGZ" }, "LA": { name: "Laos", iso3: "LAO" }, 
        "LV": { name: "Latvia", iso3: "LVA" }, "LB": { name: "Lebanon", iso3: "LBN" }, 
        "LR": { name: "Liberia", iso3: "LBR" }, "LY": { name: "Libya", iso3: "LBY" }, 
        "LT": { name: "Lithuania", iso3: "LTU" }, "LU": { name: "Luxembourg", iso3: "LUX" }, 
        "MG": { name: "Madagascar", iso3: "MDG" }, "MW": { name: "Malawi", iso3: "MWI" }, 
        "MY": { name: "Malaysia", iso3: "MYS" }, "MV": { name: "Maldives", iso3: "MDV" }, 
        "ML": { name: "Mali", iso3: "MLI" }, "MT": { name: "Malta", iso3: "MLT" }, 
        "MR": { name: "Mauritania", iso3: "MRT" }, "MU": { name: "Mauritius", iso3: "MUS" }, 
        "MX": { name: "Mexico", iso3: "MEX" }, "MD": { name: "Moldova", iso3: "MDA" }, 
        "MN": { name: "Mongolia", iso3: "MNG" }, "ME": { name: "Montenegro", iso3: "MNE" }, 
        "MA": { name: "Morocco", iso3: "MAR" }, "MZ": { name: "Mozambique", iso3: "MOZ" }, 
        "MM": { name: "Myanmar", iso3: "MMR" }, "NA": { name: "Namibia", iso3: "NAM" }, 
        "NP": { name: "Nepal", iso3: "NPL" }, "NL": { name: "Netherlands", iso3: "NLD" }, 
        "NZ": { name: "New Zealand", iso3: "NZL" }, "NI": { name: "Nicaragua", iso3: "NIC" }, 
        "NE": { name: "Niger", iso3: "NER" }, "NG": { name: "Nigeria", iso3: "NGA" }, 
        "NO": { name: "Norway", iso3: "NOR" }, "OM": { name: "Oman", iso3: "OMN" }, 
        "PK": { name: "Pakistan", iso3: "PAK" }, "PA": { name: "Panama", iso3: "PAN" }, 
        "PG": { name: "Papua New Guinea", iso3: "PNG" }, "PY": { name: "Paraguay", iso3: "PRY" }, 
        "PE": { name: "Peru", iso3: "PER" }, "PH": { name: "Philippines", iso3: "PHL" }, 
        "PL": { name: "Poland", iso3: "POL" }, "PT": { name: "Portugal", iso3: "PRT" }, 
        "QA": { name: "Qatar", iso3: "QAT" }, "RO": { name: "Romania", iso3: "ROU" }, 
        "RU": { name: "Russia", iso3: "RUS" }, "RW": { name: "Rwanda", iso3: "RWA" }, 
        "SA": { name: "Saudi Arabia", iso3: "SAU" }, "SN": { name: "Senegal", iso3: "SEN" }, 
        "RS": { name: "Serbia", iso3: "SRB" }, "SG": { name: "Singapore", iso3: "SGP" }, 
        "SK": { name: "Slovakia", iso3: "SVK" }, "SI": { name: "Slovenia", iso3: "SVN" }, 
        "SO": { name: "Somalia", iso3: "SOM" }, "ZA": { name: "South Africa", iso3: "ZAF" }, 
        "ES": { name: "Spain", iso3: "ESP" }, "LK": { name: "Sri Lanka", iso3: "LKA" }, 
        "SD": { name: "Sudan", iso3: "SDN" }, "SE": { name: "Sweden", iso3: "SWE" }, 
        "CH": { name: "Switzerland", iso3: "CHE" }, "SY": { name: "Syria", iso3: "SYR" }, 
        "TW": { name: "Taiwan", iso3: "TWN" }, "TJ": { name: "Tajikistan", iso3: "TJK" }, 
        "TZ": { name: "Tanzania", iso3: "TZA" }, "TH": { name: "Thailand", iso3: "THA" }, 
        "TG": { name: "Togo", iso3: "TGO" }, "TT": { name: "Trinidad and Tobago", iso3: "TTO" }, 
        "TN": { name: "Tunisia", iso3: "TUN" }, "TR": { name: "Turkey", iso3: "TUR" }, 
        "TM": { name: "Turkmenistan", iso3: "TKM" }, "UG": { name: "Uganda", iso3: "UGA" }, 
        "UA": { name: "Ukraine", iso3: "UKR" }, "AE": { name: "United Arab Emirates", iso3: "ARE" }, 
        "GB": { name: "United Kingdom", iso3: "GBR" }, "US": { name: "United States", iso3: "USA" }, 
        "UY": { name: "Uruguay", iso3: "URY" }, "UZ": { name: "Uzbekistan", iso3: "UZB" }, 
        "VE": { name: "Venezuela", iso3: "VEN" }, "VN": { name: "Vietnam", iso3: "VNM" }, 
        "YE": { name: "Yemen", iso3: "YEM" }, "ZM": { name: "Zambia", iso3: "ZMB" }, 
        "ZW": { name: "Zimbabwe", iso3: "ZWE" }
    };
    // =================================================================


    // --- DOM Elements (Updated for new input fields) ---
    const dom = {
        searchForm: document.getElementById('searchForm'),
        countryDisplay: document.getElementById('countryDisplay'), // NEW: Input field for country name
        countryCode: document.getElementById('countryCode'),       // NEW: Hidden field for ISO-2 code
        countryDatalist: document.getElementById('country-list'),  // NEW: Datalist element
        cityInput: document.getElementById('city'),
        searchBtn: document.getElementById('searchBtn'),
        errorMsg: document.getElementById('errorMsg'),
        errorText: document.getElementById('errorText'),
        loading: document.getElementById('loading'),
        dashboard: document.getElementById('dashboard'),
        recentSection: document.getElementById('recentSection'),
        recentList: document.getElementById('recentList'),
        
        // NEW: Authentication UI Elements in Header
        welcomeMessage: document.getElementById('welcomeMessage'),
        logoutButton: document.getElementById('logoutBtn'), 
        
        // Weather Elements
        cityBadge: document.getElementById('cityBadge'),
        weatherIcon: document.getElementById('weatherIcon'),
        temperature: document.getElementById('temperature'),
        description: document.getElementById('description'),
        feelsLike: document.getElementById('feelsLike'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        pressure: document.getElementById('pressure'),

        // Safety Elements
        advisoryCountry: document.getElementById('advisoryCountry'),
        safetyLevel: document.getElementById('safetyLevel'),
        scoreBar: document.getElementById('scoreBar'),
        scoreValue: document.getElementById('scoreValue'),
        advisoryList: document.getElementById('advisoryList'),
        lastUpdated: document.getElementById('lastUpdated')
    };
        
    // --- STATE MANAGEMENT ---
    let userToken = localStorage.getItem('goSafeToken');

    // --- Initialization: Populate Datalist and Attach Listener ---
    function initializeCountryInput() {
        const options = Object.entries(countryData).map(([code, data]) => 
            `<option value="${data.name}" data-code="${code}">`
        ).join('');
        dom.countryDatalist.innerHTML = options;
        
        // Listener to capture the ISO-2 code when the user selects an option
        dom.countryDisplay.addEventListener('input', updateHiddenCountryCode);
    }
    
    function updateHiddenCountryCode() {
        const inputName = dom.countryDisplay.value;
        const selectedEntry = Object.entries(countryData).find(([, data]) => data.name === inputName);

        if (selectedEntry) {
            // Set the ISO-2 code (e.g., "US") in the hidden field
            dom.countryCode.value = selectedEntry[0]; 
        } else {
            dom.countryCode.value = ''; // Clear if the user types something invalid
        }
    }
    
    // Call initialization on load
    initializeCountryInput();


    // --- Event Listeners ---
    dom.searchForm.addEventListener('submit', handleSearch);
    dom.logoutButton.addEventListener('click', handleLogout); 
    
    updateAuthUI(); 
    loadRecentSearches();

    // =========================================================================
    //                             I. AUTHENTICATION LOGIC
    // =========================================================================

    /**
     * Updates the UI based on whether a user is logged in
     */
    function updateAuthUI() {
        userToken = localStorage.getItem('goSafeToken');
        const isLoggedIn = !!userToken;
        const currentUsername = localStorage.getItem('goSafeUsername') || 'Traveler'; 
        const usernameToDisplay = currentUsername.split('@')[0] || currentUsername; 

        console.log(isLoggedIn ? `User is logged in as ${currentUsername}.` : "User is logged out.");

        if (dom.welcomeMessage) {
            dom.welcomeMessage.textContent = `Welcome, ${usernameToDisplay}!`;
        }
        if (dom.logoutButton) {
            dom.logoutButton.style.display = isLoggedIn ? 'block' : 'none';
        }

        if (dom.recentSection) {
            dom.recentSection.style.display = isLoggedIn ? 'block' : 'none'; 
        }
    }

    /**
     * Handles user logout and redirects to the login page.
     */
    function handleLogout() {
        localStorage.removeItem('goSafeToken');
        localStorage.removeItem('goSafeUserId');
        localStorage.removeItem('goSafeUsername'); 
        
        window.location.href = 'login.html'; 
    }


    // =========================================================================
    //                             II. SEARCH AND DATA FLOW
    // =========================================================================

      // --- Main Search Handler (Fetches ALL data from the Backend Proxy) ---
      async function handleSearch(e) {
          e.preventDefault();
          
          // GET ISO-2 CODE FROM HIDDEN FIELD
          const countryCode = dom.countryCode.value; 
          const cityName = dom.cityInput.value.trim();
          
          // Find the corresponding country data
          const countryEntry = countryData[countryCode];
          
          if (!countryCode || !cityName || !countryEntry) {
              showError('Please select a valid country and enter a city name.');
              return;
          }

            // Extract the necessary codes for the backend call
          const countryName = countryEntry.name;
          const safetyCountryCode = countryEntry.iso3; // Use ISO-3 for safety API
          
          // UI Reset
          hideError();
          dom.dashboard.classList.remove('active');
          dom.loading.classList.add('active');
          dom.searchBtn.disabled = true;

          let aggregatedData = null; 

          try {
              // 1. Fetch ALL aggregated data from our own backend proxy endpoint: /api/data
              // Pass ISO-2 (countryCode) for Weather, and ISO-3 (safetyCountryCode) for Safety
              const response = await fetch(`${API_CONFIG.backendBase}/data?city=${cityName}&country=${countryCode}&safetyCode=${safetyCountryCode}`, {
                  headers: {
                      'x-api-key': BACKEND_API_KEY
                  }
              });
              
              if (!response.ok) {
                  const error = await response.json();
                  throw new Error(`Data analysis failed: ${error.message}`);
              }
              
              aggregatedData = await response.json(); 
              
              // 2. Update Dashboard using the data parts
              updateDashboard(aggregatedData.weather, aggregatedData.safety, countryName);
              
              // 3. SECURE STORAGE: Only attempt to save if the user is logged in
              if (localStorage.getItem('goSafeToken')) {
                  await sendToBackend(`${cityName}, ${countryName}`, aggregatedData);
                  loadRecentSearches(); // Reload history after saving
              } else {
                  // Fallback to local storage history if user is not logged in
                  saveToHistory(cityName, countryCode, countryName);
                  showError("Login required to save your searches permanently.");
              }


              dom.loading.classList.remove('active');
              dom.dashboard.classList.add('active');
              
              dom.dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });

          } catch (error) {
              console.error(error);
              dom.loading.classList.remove('active');
              showError(error.message || 'Failed to analyze destination. Please check your inputs and ensure the backend server is running.');
          } finally {
              dom.searchBtn.disabled = false;
          }
      }


    // =========================================================================
    //                             III. SECURE SERVICE CALLS
    // =========================================================================

    /**
     * Send aggregated data to the backend for secure storage (POST request)
     * REQUIRES JWT
     */
    async function sendToBackend(locationName, aggregatedData) {
        const token = localStorage.getItem('goSafeToken');
        if (!token) {
            console.error("Attempt blocked: User token missing.");
            return;
        }
        
        console.log("Attempting to send aggregated data to secure backend...");

        try {
            const response = await fetch(`${API_CONFIG.backendBase}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': BACKEND_API_KEY, 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    locationName: locationName,
                    aggregatedData: aggregatedData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Backend storage failed: ${error.message}`);
            }

            const result = await response.json();
            console.log('Successfully stored record in backend:', result.record._id);

        } catch (error) {
            console.error('Backend Storage Error:', error.message);
            showError("Error saving data. Please check your login status.");
        }
    }


    /**
     * Retrieve stored records from the backend (GET request)
     * REQUIRES JWT
     */
    async function fetchRecentRecords() {
        const token = localStorage.getItem('goSafeToken');
        if (!token) {
            console.log("Not logged in. Skipping secure record fetch.");
            return [];
        }

        console.log("Attempting to fetch stored records from secure backend...");
        
        const url = `${API_CONFIG.backendBase}/records`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': BACKEND_API_KEY, 
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                if (response.status === 401) handleLogout(); 
                throw new Error(`Failed to retrieve records: ${error.message}`);
            }

            const records = await response.json();
            return records;

        } catch (error) {
            console.error('Backend Retrieval Error:', error.message);
            return []; 
        }
    }

    // =========================================================================
    //                             IV. UTILITY FUNCTIONS
    // =========================================================================

    // --- UI Update Functions (Now includes crash guard) ---
    function updateDashboard(weather, safety, countryName) {
        // *** CRASH GUARD: Prevents the TypeError from crashing the app ***
        if (!weather || !safety || !weather.name || !weather.sys || !weather.sys.country || !safety.advisory) {
            console.error("Attempted to update dashboard with incomplete data structure. Skipping DOM manipulation.");
            return; 
        }
        
        // 1. Update Weather Card
        dom.cityBadge.textContent = `${weather.name}, ${weather.sys.country}`;
        dom.temperature.textContent = Math.round(weather.main.temp) + '°';
        dom.description.textContent = weather.weather[0].description;
        dom.feelsLike.textContent = Math.round(weather.main.feels_like) + '°C';
        dom.humidity.textContent = weather.main.humidity + '%';
        dom.windSpeed.textContent = weather.wind.speed + ' m/s';
        dom.pressure.textContent = weather.main.pressure + ' hPa';

        // dynamic weather icon based on ID
        const iconCode = weather.weather[0].icon;
        dom.weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="Weather Icon" class="drop-shadow">`;

        // 2. Update Safety Card
        dom.advisoryCountry.textContent = countryName;
        
        const score = safety.advisory.score; // 0 (Safe) to 5 (Dangerous)
        dom.scoreValue.textContent = `${score}/5`;
        
        // Calculate bar width (score is out of 5, make it a percentage)
        const percentage = (score / 5) * 100;
        dom.scoreBar.style.width = `${percentage}%`;

        // Determine Safety Level & Color
        const badge = dom.safetyLevel;
        badge.className = 'safety-badge'; // reset
        
        if (score < 2.5) {
            badge.classList.add('low');
            badge.innerHTML = '<span class="badge-dot"></span>Safe to Travel';
        } else if (score < 4.0) {
            badge.classList.add('medium');
            badge.innerHTML = '<span class="badge-dot"></span>Exercise Caution';
        } else {
            badge.classList.add('high');
            badge.innerHTML = '<span class="badge-dot"></span>Reconsider Travel';
        }

        // Advisory Details
        dom.advisoryList.innerHTML = `
            <div class="advisory-item">
                <div class="advisory-icon">📢</div>
                <div>${safety.advisory.message}</div>
            </div>
            <div class="advisory-item">
                <div class="advisory-icon">🌐</div>
                <div><a href="${safety.advisory.source}" target="_blank" style="color:var(--primary);text-decoration:none;">Read full official report source</a></div>
            </div>
        `;
        
        // >>> DATE FIX: Handle Invalid Date error robustly <<<
        let updateDate = safety.advisory.updated;
        let displayDate = '--';

        if (updateDate) {
            const dateObj = new Date(updateDate);

            // Check if the Date object is valid (i.e., not 'Invalid Date')
            if (!isNaN(dateObj) && dateObj.toString() !== 'Invalid Date') {
                displayDate = dateObj.toLocaleDateString();
            } else {
                // Fallback: Use the raw string if JavaScript can't parse it
                displayDate = updateDate.split('T')[0] || updateDate;
            }
        }
        
        dom.lastUpdated.textContent = displayDate;
        // >>> DATE FIX ENDS HERE <<<
    }

    // --- Utility Functions (unchanged logic) ---
    function showError(message) {
        dom.errorText.textContent = message;
        dom.errorMsg.classList.add('active');
        setTimeout(() => dom.errorMsg.classList.remove('active'), 5000); 
    }

    function hideError() {
        dom.errorMsg.classList.remove('active');
    }

    // --- Local Storage History (Used as Fallback) ---
    function saveToHistory(city, countryCode, countryName) {
        let history = JSON.parse(localStorage.getItem('goSafeHistory')) || [];
        
        // FIX: Use the full country name for the history entry
        const entry = { city: city, code: countryCode, country: countryName, date: new Date().toLocaleDateString() };

        history = history.filter(item => item.city.toLowerCase() !== city.toLowerCase());
        history.unshift(entry);
        if (history.length > 3) history.pop();

        localStorage.setItem('goSafeHistory', JSON.stringify(history));
    }

    // --- MODIFIED HISTORY & RETRIEVAL FUNCTION ---

    async function loadRecentSearches() {
        let recentData = [];
        
        // 1. Attempt to fetch data from the SECURE backend (GET request, REQUIRES TOKEN)
        const backendRecords = await fetchRecentRecords();
        
        if (backendRecords.length > 0) {
            // Use data retrieved from MongoDB
            recentData = backendRecords.map(record => ({
                city: record.aggregatedData.city,
                code: record.aggregatedData.weather.sys.country, 
                country: record.aggregatedData.country,
                date: new Date(record.createdAt).toLocaleDateString()
            }));
            
            // Display only the top 3 most recent entries
            recentData = recentData.slice(0, 3); 
            console.log("Using records retrieved from MongoDB (Personalized).");
            
        } else {
            // 2. Fallback to local storage
            recentData = JSON.parse(localStorage.getItem('goSafeHistory')) || [];
            console.log("Falling back to local storage for recent searches.");
        }
        
        
        // --- Display Logic ---
        if (recentData.length > 0) {
            dom.recentSection.classList.add('active');
            dom.recentList.innerHTML = recentData.map(item => `
                <div class="recent-item" onclick="rerunSearch('${item.city}', '${item.code}')">
                    <div style="font-weight:700; color:var(--primary)">${item.city}</div>
                    <div style="font-size:0.85rem; color:var(--gray-600)">${item.country}</div>
                </div>
            `).join('');
        } else {
            dom.recentSection.classList.remove('active');
            dom.recentList.innerHTML = '';
        }
    }


    // Expose this to global scope for the onclick event in HTML string
    window.rerunSearch = (city, code) => {
        // Find the country name based on the ISO-2 code from the saved history
        const countryName = countryData[code] ? countryData[code].name : '';

        dom.cityInput.value = city;
        dom.countryDisplay.value = countryName; // Set the display name
        dom.countryCode.value = code;          // Set the hidden ISO-2 code

        dom.searchBtn.click();
    };
    // End of DOMContentLoaded listener
});