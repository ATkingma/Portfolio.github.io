class UnityStats extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.charts = { left: null, right: null };
    }

    async connectedCallback() {
        // Load required scripts
        await this.loadDependencies();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .container {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }                .chart-section {
                    flex: 1;
                    min-width: 300px;
                    background: #1b1f2431;
                    border: 1px solid #ffffff25;
                    border-radius: 10px;
                    padding: 20px;
                    backdrop-filter: blur(15px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                .chart-container {
                    position: relative;
                    height: 400px;
                    background: #0d1117;
                    border: 1px solid #ffffff25;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 15px;
                }
                .controls {
                    margin-bottom: 15px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                select, input[type="month"] {
                    padding: 8px 16px;
                    border: 1px solid #ffffff25;
                    border-radius: 8px;
                    background: #21262D;
                    color: #ffffffa1;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                select:hover, input[type="month"]:hover {
                    background: #282c34;
                    border-color: #ffffff40;
                }
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 1.2em;
                    color: #ffffffa1;
                }
                .date-range {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .date-range span {
                    color: #ffffffa1;
                }
                button {
                    background-color: var(--header);
                    color: #fff;
                    padding: 8px 16px;
                    border: 2px solid var(--header);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 14px;
                }
                button:hover {
                    background-color: #0065db;
                    transform: translateY(-2px);
                }
                .chart-title {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 15px;
                    color: #ffffffce;
                }
                .error-message {
                    color: #ff6b6b;
                    text-align: center;
                    padding: 10px;
                    display: none;
                }
                @media (max-width: 768px) {
                    .chart-section {
                        flex: 100%;
                    }
                    .date-range {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .date-range span {
                        text-align: center;
                    }
                }
            </style>
            <div class="container">
                <div class="chart-section">
                    <div class="chart-title">Daily Statistics</div>
                    <div class="controls">
                        <select id="leftMetric">
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="year">Last Year</option>
                            <option value="total">All Time</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="leftChart"></canvas>
                        <div id="leftLoading" class="loading">Loading data...</div>
                        <div id="leftError" class="error-message"></div>
                    </div>
                </div>
                <div class="chart-section">
                    <div class="chart-title">Monthly Sales</div>
                    <div class="controls">
                        <div class="date-range">
                            <input type="month" id="startMonth" aria-label="Start month">
                            <span>to</span>
                            <input type="month" id="endMonth" aria-label="End month">
                            <button id="fetchRange">Update</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="rightChart"></canvas>
                        <div id="rightLoading" class="loading">Loading data...</div>
                        <div id="rightError" class="error-message"></div>
                    </div>
                </div>
            </div>
        `;

        this.initializeCharts();
    }

    async loadDependencies() {
        // Load Chart.js and its dependencies
        await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/luxon');
        await this.loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon');
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (window[src]) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                window[src] = true;
                resolve();
            };
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        });
    }

    async initializeCharts() {
        const leftSelect = this.shadowRoot.getElementById('leftMetric');
        const fetchRangeBtn = this.shadowRoot.getElementById('fetchRange');
        const startMonth = this.shadowRoot.getElementById('startMonth');
        const endMonth = this.shadowRoot.getElementById('endMonth');

        // Set initial month values
        const today = new Date();
        const lastYear = new Date();
        lastYear.setMonth(today.getMonth() - 11);
        
        endMonth.value = today.toISOString().slice(0, 7);
        startMonth.value = lastYear.toISOString().slice(0, 7);

        // Set min/max dates
        const minDate = '2023-02';
        const maxDate = today.toISOString().slice(0, 7);
        startMonth.min = minDate;
        startMonth.max = maxDate;
        endMonth.min = minDate;
        endMonth.max = maxDate;

        leftSelect.addEventListener('change', () => this.updateDailyChart());
        fetchRangeBtn.addEventListener('click', () => this.updateMonthlyChart());

        // Initialize both charts
        await this.updateDailyChart();
        await this.updateMonthlyChart();
    }

    getDateRange(range) {
        const endDate = new Date();
        let startDate = new Date();

        switch (range) {
            case '7days':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '2days':
                startDate.setDate(endDate.getDate() - 2);
                endDate.setDate(endDate.getDate() - 2);
                break;
            case 'year':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            case 'total':
                startDate = new Date('2023-02-27T00:00:00Z');
                break;
        }

        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(0, 0, 0, 0);

        return { startDate, endDate };
    }

    async fetchDailyData(startDate, endDate) {
        const response = await fetch('https://unity-proxy.onrender.com/api/unity-daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch daily data');
        }
        
        return await response.json();
    }

    async fetchMonthlyRangeData(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().slice(0, 10));
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        const response = await fetch('https://unity-proxy.onrender.com/api/unity-monthly-sales-multi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dates })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch monthly data');
        }

        return await response.json();
    }

    processDailyData(data) {
        const dates = Object.keys(data).sort();
        const datasets = {
            page_views: [],
            wishlisted: [],
            downloads: [],
            free_obtained: [],
            sales: []
        };

        dates.forEach(date => {
            const dayData = data[date] || {};
            Object.keys(datasets).forEach(metric => {
                datasets[metric].push({
                    x: new Date(date),
                    y: dayData[metric] || 0
                });
            });
        });

        return datasets;
    }

    processMonthlyData(data) {
        const salesByMonth = {};

        data.forEach(month => {
            if (month.data && month.data.length > 0) {
                const totalSales = month.data.reduce((sum, item) => sum + parseInt(item.sales), 0);
                salesByMonth[month.date] = totalSales;
            }
        });

        return salesByMonth;
    }

    async updateDailyChart() {
        const dateRange = this.shadowRoot.getElementById('leftMetric').value;
        const loadingEl = this.shadowRoot.getElementById('leftLoading');
        const chartEl = this.shadowRoot.getElementById('leftChart');
        const errorEl = this.shadowRoot.getElementById('leftError');

        loadingEl.style.display = 'flex';
        chartEl.style.display = 'none';
        errorEl.style.display = 'none';

        try {
            const { startDate, endDate } = this.getDateRange(dateRange);
            const data = await this.fetchDailyData(startDate, endDate);
            const datasets = this.processDailyData(data);
            this.createDailyChart(datasets);
        } catch (error) {
            console.error('Error updating daily chart:', error);
            errorEl.textContent = 'Failed to load daily statistics. Please try again.';
            errorEl.style.display = 'block';
        }

        loadingEl.style.display = 'none';
        chartEl.style.display = 'block';
    }

    async updateMonthlyChart() {
        const loadingEl = this.shadowRoot.getElementById('rightLoading');
        const chartEl = this.shadowRoot.getElementById('rightChart');
        const errorEl = this.shadowRoot.getElementById('rightError');
        const startMonth = this.shadowRoot.getElementById('startMonth');
        const endMonth = this.shadowRoot.getElementById('endMonth');

        if (!startMonth.value || !endMonth.value) {
            errorEl.textContent = 'Please select both start and end months';
            errorEl.style.display = 'block';
            return;
        }

        const startDate = new Date(startMonth.value + '-01');
        const endDate = new Date(endMonth.value + '-01');

        if (startDate > endDate) {
            errorEl.textContent = 'Start month must be before end month';
            errorEl.style.display = 'block';
            return;
        }

        loadingEl.style.display = 'flex';
        chartEl.style.display = 'none';
        errorEl.style.display = 'none';

        try {
            const data = await this.fetchMonthlyRangeData(startDate, endDate);
            const salesByMonth = this.processMonthlyData(data);
            this.createMonthlyChart(salesByMonth);
        } catch (error) {
            console.error('Error updating monthly chart:', error);
            errorEl.textContent = 'Failed to load monthly sales. Please try again.';
            errorEl.style.display = 'block';
        }

        loadingEl.style.display = 'none';
        chartEl.style.display = 'block';
    }

    createDailyChart(datasets) {
        const ctx = this.shadowRoot.getElementById('leftChart').getContext('2d');
        
        if (this.charts.left) {
            this.charts.left.destroy();
        }

        this.charts.left = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Page Views',
                        data: datasets.page_views,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: 'Wishlisted',
                        data: datasets.wishlisted,
                        borderColor: 'rgb(255, 205, 86)',
                        tension: 0.1
                    },
                    {
                        label: 'Downloads',
                        data: datasets.downloads,
                        borderColor: 'rgb(153, 51, 255)',
                        tension: 0.1
                    },
                    {
                        label: 'Free Obtained',
                        data: datasets.free_obtained,
                        borderColor: 'rgb(153, 102, 255)',
                        tension: 0.1
                    },
                    {
                        label: 'Sales',
                        data: datasets.sales,
                        borderColor: 'rgb(51, 204, 51)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        title: { 
                            display: true, 
                            text: 'Date',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: { 
                            display: true, 
                            text: 'Count',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    createMonthlyChart(salesByMonth) {
        const ctx = this.shadowRoot.getElementById('rightChart').getContext('2d');
        
        if (this.charts.right) {
            this.charts.right.destroy();
        }

        const months = Object.keys(salesByMonth).sort();
        const values = months.map(month => salesByMonth[month]);

        this.charts.right = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: months.map(month => {
                const date = new Date(month);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            }),
            datasets: [{
                label: 'Number of Sales',
                data: values,
                backgroundColor: 'rgb(51, 204, 51)',
                borderColor: 'rgb(51, 204, 51)',
                borderWidth: 1
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Sales'
                },
                grid: {
                    color: 'rgba(200,200,200,0.2)'
                }
                },
                x: {
                title: {
                    display: true,
                    text: 'Month'
                },
                grid: {
                    color: 'rgba(200,200,200,0.2)'
                }
                },
            },
            plugins: {
                tooltip: {
                mode: 'index',
                intersect: false
                },
                legend: {
                position: 'top'
                },
                title: {
                display: true,
                text: 'Monthly Sales Overview'
                }
            }
            }
        });
    }
}

customElements.define('unity-stats', UnityStats);
