const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

class SonarQubeApiScraper {
    constructor(baseUrl, token = null, username = null, password = null) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.axios = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000
        });

        // Set authentication
        if (token) {
            this.axios.defaults.auth = {
                username: token,
                password: ''
            };
        } else if (username && password) {
            this.axios.defaults.auth = {
                username: username,
                password: password
            };
        }
    }

    async getProjectData(projectKey) {
        const projectData = {};
        
        try {
            console.log(`Fetching data for project: ${projectKey}`);
            
            // Get project details
            projectData.projectInfo = await this.getProjectInfo(projectKey);
            
            // Get metrics
            projectData.metrics = await this.getProjectMetrics(projectKey);
            
            // Get quality gate status
            projectData.qualityGate = await this.getQualityGateStatus(projectKey);
            
            // Get issues
            projectData.issues = await this.getProjectIssues(projectKey);
            
            // Get measures history (for graphs)
            projectData.measuresHistory = await this.getMeasuresHistory(projectKey);
            
            // Get security hotspots
            projectData.securityHotspots = await this.getSecurityHotspots(projectKey);
            
            return projectData;
        } catch (error) {
            console.error('Error fetching project data:', error.message);
            throw error;
        }
    }

    async getProjectInfo(projectKey) {
        try {
            const response = await this.axios.get('/api/components/show', {
                params: { component: projectKey }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching project info:', error.message);
            return null;
        }
    }

    async getProjectMetrics(projectKey) {
        const metrics = [
            'lines', 'new_lines', 'coverage', 'new_coverage',
            'duplicated_lines_density', 'new_duplicated_lines_density',
            'bugs', 'new_bugs', 'vulnerabilities', 'new_vulnerabilities',
            'code_smells', 'new_code_smells', 'security_hotspots',
            'new_security_hotspots', 'sqale_index', 'new_technical_debt',
            'reliability_rating', 'new_reliability_rating',
            'security_rating', 'new_security_rating',
            'sqale_rating', 'new_maintainability_rating'
        ];

        try {
            const response = await this.axios.get('/api/measures/component', {
                params: {
                    component: projectKey,
                    metricKeys: metrics.join(',')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching project metrics:', error.message);
            return null;
        }
    }

    async getQualityGateStatus(projectKey) {
        try {
            const response = await this.axios.get('/api/qualitygates/project_status', {
                params: { projectKey: projectKey }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching quality gate status:', error.message);
            return null;
        }
    }

    async getProjectIssues(projectKey) {
        const allIssues = [];
        let page = 1;
        const pageSize = 500;

        try {
            while (true) {
                const response = await this.axios.get('/api/issues/search', {
                    params: {
                        componentKeys: projectKey,
                        p: page,
                        ps: pageSize,
                        additionalFields: 'comments,transitions'
                    }
                });

                const issues = response.data.issues || [];
                allIssues.push(...issues);

                if (issues.length < pageSize) {
                    break;
                }
                page++;
            }

            return {
                total: allIssues.length,
                issues: allIssues
            };
        } catch (error) {
            console.error('Error fetching project issues:', error.message);
            return { total: 0, issues: [] };
        }
    }

    async getMeasuresHistory(projectKey, metrics = null) {
        if (!metrics) {
            metrics = ['bugs', 'vulnerabilities', 'code_smells', 'coverage', 'duplicated_lines_density'];
        }

        try {
            const response = await this.axios.get('/api/measures/search_history', {
                params: {
                    component: projectKey,
                    metrics: metrics.join(',')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching measures history:', error.message);
            return null;
        }
    }

    async getSecurityHotspots(projectKey) {
        try {
            const response = await this.axios.get('/api/hotspots/search', {
                params: { projectKey: projectKey }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching security hotspots:', error.message);
            return null;
        }
    }

    async exportToCsv(projectData, outputDir = './exports') {
        // Create exports directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        try {
            // Export metrics
            if (projectData.metrics && projectData.metrics.component) {
                const measures = projectData.metrics.component.measures || [];
                const csvWriter = createCsvWriter({
                    path: path.join(outputDir, 'metrics.csv'),
                    header: [
                        { id: 'metric', title: 'Metric' },
                        { id: 'value', title: 'Value' },
                        { id: 'bestValue', title: 'Best Value' }
                    ]
                });
                await csvWriter.writeRecords(measures);
            }

            // Export issues
            if (projectData.issues && projectData.issues.issues) {
                const csvWriter = createCsvWriter({
                    path: path.join(outputDir, 'issues.csv'),
                    header: [
                        { id: 'key', title: 'Key' },
                        { id: 'rule', title: 'Rule' },
                        { id: 'severity', title: 'Severity' },
                        { id: 'component', title: 'Component' },
                        { id: 'line', title: 'Line' },
                        { id: 'message', title: 'Message' },
                        { id: 'type', title: 'Type' }
                    ]
                });
                await csvWriter.writeRecords(projectData.issues.issues);
            }

            // Export measures history
            if (projectData.measuresHistory && projectData.measuresHistory.measures) {
                const historyData = [];
                projectData.measuresHistory.measures.forEach(measure => {
                    const metric = measure.metric;
                    measure.history.forEach(history => {
                        historyData.push({
                            metric: metric,
                            date: history.date,
                            value: history.value
                        });
                    });
                });

                if (historyData.length > 0) {
                    const csvWriter = createCsvWriter({
                        path: path.join(outputDir, 'measures_history.csv'),
                        header: [
                            { id: 'metric', title: 'Metric' },
                            { id: 'date', title: 'Date' },
                            { id: 'value', title: 'Value' }
                        ]
                    });
                    await csvWriter.writeRecords(historyData);
                }
            }

            console.log(`Data exported to ${outputDir}`);
        } catch (error) {
            console.error('Error exporting to CSV:', error.message);
        }
    }
}

// API Routes
app.get('/api/scrape/:projectKey', async (req, res) => {
    const { projectKey } = req.params;
    const { baseUrl, token, username, password } = req.query;

    if (!baseUrl) {
        return res.status(400).json({ error: 'baseUrl is required' });
    }

    try {
        const scraper = new SonarQubeApiScraper(baseUrl, token, username, password);
        const projectData = await scraper.getProjectData(projectKey);
        
        // Save to JSON file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `project_data_${projectKey}_${timestamp}.json`;
        const filepath = path.join('./exports', filename);
        
        if (!fs.existsSync('./exports')) {
            fs.mkdirSync('./exports', { recursive: true });
        }
        
        fs.writeFileSync(filepath, JSON.stringify(projectData, null, 2));
        
        // Export to CSV
        await scraper.exportToCsv(projectData);
        
        res.json({
            success: true,
            data: projectData,
            exportFile: filename
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to scrape project data',
            message: error.message 
        });
    }
});

app.get('/api/project-summary/:projectKey', async (req, res) => {
    const { projectKey } = req.params;
    const { baseUrl, token, username, password } = req.query;

    if (!baseUrl) {
        return res.status(400).json({ error: 'baseUrl is required' });
    }

    try {
        const scraper = new SonarQubeApiScraper(baseUrl, token, username, password);
        const projectData = await scraper.getProjectData(projectKey);
        
        // Create summary
        const summary = {
            projectInfo: projectData.projectInfo?.component || {},
            qualityGate: projectData.qualityGate?.projectStatus?.status || 'Unknown',
            totalIssues: projectData.issues?.total || 0,
            metrics: {},
            lastAnalysis: projectData.projectInfo?.component?.analysisDate || null
        };

        // Extract key metrics
        if (projectData.metrics && projectData.metrics.component) {
            const measures = projectData.metrics.component.measures || [];
            measures.forEach(measure => {
                summary.metrics[measure.metric] = measure.value;
            });
        }

        res.json(summary);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get project summary',
            message: error.message 
        });
    }
});

app.get('/api/project-graph/:projectKey', async (req, res) => {
    const { projectKey } = req.params;
    const { baseUrl, token, username, password, metrics } = req.query;

    if (!baseUrl) {
        return res.status(400).json({ error: 'baseUrl is required' });
    }

    try {
        const scraper = new SonarQubeApiScraper(baseUrl, token, username, password);
        const metricsArray = metrics ? metrics.split(',') : ['bugs', 'vulnerabilities', 'code_smells', 'coverage'];
        const historyData = await scraper.getMeasuresHistory(projectKey, metricsArray);
        
        // Format data for charting
        const chartData = {};
        if (historyData && historyData.measures) {
            historyData.measures.forEach(measure => {
                chartData[measure.metric] = measure.history.map(h => ({
                    date: h.date,
                    value: parseFloat(h.value) || 0
                }));
            });
        }

        res.json({
            success: true,
            data: chartData,
            metrics: metricsArray
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get graph data',
            message: error.message 
        });
    }
});

// Serve HTML dashboard
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>SonarQube Data Scraper</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 8px; margin-bottom: 10px; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            button:hover { background: #005a8b; }
            .result { margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 5px; }
            .loading { display: none; color: #007cba; }
            pre { background: #f8f8f8; padding: 15px; border-radius: 3px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>SonarQube Data Scraper</h1>
            
            <form id="scrapeForm">
                <div class="form-group">
                    <label for="baseUrl">SonarQube Base URL:</label>
                    <input type="url" id="baseUrl" placeholder="https://sonarqube.example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="projectKey">Project Key:</label>
                    <input type="text" id="projectKey" placeholder="buzz-api-main_new" required>
                </div>
                
                <div class="form-group">
                    <label for="token">API Token (optional):</label>
                    <input type="password" id="token" placeholder="API Token">
                </div>
                
                <div class="form-group">
                    <label for="username">Username (if no token):</label>
                    <input type="text" id="username" placeholder="Username">
                </div>
                
                <div class="form-group">
                    <label for="password">Password (if no token):</label>
                    <input type="password" id="password" placeholder="Password">
                </div>
                
                <button type="submit">Scrape Project Data</button>
                <button type="button" onclick="getSummary()">Get Summary Only</button>
                <button type="button" onclick="getGraphData()">Get Graph Data</button>
            </form>
            
            <div class="loading" id="loading">Loading...</div>
            <div class="result" id="result" style="display: none;"></div>
        </div>

        <script>
            document.getElementById('scrapeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await scrapeData();
            });

            async function scrapeData() {
                const loading = document.getElementById('loading');
                const result = document.getElementById('result');
                
                loading.style.display = 'block';
                result.style.display = 'none';
                
                const params = new URLSearchParams({
                    baseUrl: document.getElementById('baseUrl').value,
                    token: document.getElementById('token').value,
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                });
                
                const projectKey = document.getElementById('projectKey').value;
                
                try {
                    const response = await fetch(\`/api/scrape/\${projectKey}?\${params}\`);
                    const data = await response.json();
                    
                    result.innerHTML = \`
                        <h3>Scraping Complete!</h3>
                        <p><strong>Export File:</strong> \${data.exportFile}</p>
                        <p><strong>Total Issues:</strong> \${data.data.issues?.total || 0}</p>
                        <p><strong>Quality Gate:</strong> \${data.data.qualityGate?.projectStatus?.status || 'Unknown'}</p>
                        <details>
                            <summary>Raw Data (Click to expand)</summary>
                            <pre>\${JSON.stringify(data.data, null, 2)}</pre>
                        </details>
                    \`;
                    result.style.display = 'block';
                } catch (error) {
                    result.innerHTML = \`<h3>Error:</h3><p>\${error.message}</p>\`;
                    result.style.display = 'block';
                } finally {
                    loading.style.display = 'none';
                }
            }

            async function getSummary() {
                const loading = document.getElementById('loading');
                const result = document.getElementById('result');
                
                loading.style.display = 'block';
                result.style.display = 'none';
                
                const params = new URLSearchParams({
                    baseUrl: document.getElementById('baseUrl').value,
                    token: document.getElementById('token').value,
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                });
                
                const projectKey = document.getElementById('projectKey').value;
                
                try {
                    const response = await fetch(\`/api/project-summary/\${projectKey}?\${params}\`);
                    const data = await response.json();
                    
                    result.innerHTML = \`
                        <h3>Project Summary</h3>
                        <p><strong>Project Name:</strong> \${data.projectInfo.name || 'N/A'}</p>
                        <p><strong>Quality Gate:</strong> \${data.qualityGate}</p>
                        <p><strong>Total Issues:</strong> \${data.totalIssues}</p>
                        <p><strong>Last Analysis:</strong> \${data.lastAnalysis || 'N/A'}</p>
                        <h4>Key Metrics:</h4>
                        <ul>
                            \${Object.entries(data.metrics).map(([key, value]) => \`<li><strong>\${key}:</strong> \${value}</li>\`).join('')}
                        </ul>
                    \`;
                    result.style.display = 'block';
                } catch (error) {
                    result.innerHTML = \`<h3>Error:</h3><p>\${error.message}</p>\`;
                    result.style.display = 'block';
                } finally {
                    loading.style.display = 'none';
                }
            }

            async function getGraphData() {
                const loading = document.getElementById('loading');
                const result = document.getElementById('result');
                
                loading.style.display = 'block';
                result.style.display = 'none';
                
                const params = new URLSearchParams({
                    baseUrl: document.getElementById('baseUrl').value,
                    token: document.getElementById('token').value,
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value,
                    metrics: 'bugs,vulnerabilities,code_smells,coverage'
                });
                
                const projectKey = document.getElementById('projectKey').value;
                
                try {
                    const response = await fetch(\`/api/project-graph/\${projectKey}?\${params}\`);
                    const data = await response.json();
                    
                    result.innerHTML = \`
                        <h3>Graph Data</h3>
                        <pre>\${JSON.stringify(data.data, null, 2)}</pre>
                    \`;
                    result.style.display = 'block';
                } catch (error) {
                    result.innerHTML = \`<h3>Error:</h3><p>\${error.message}</p>\`;
                    result.style.display = 'block';
                } finally {
                    loading.style.display = 'none';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`SonarQube scraper server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to use the web interface`);
});

module.exports = app;