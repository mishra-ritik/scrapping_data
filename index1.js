// import express from "express";
import axios from "axios";
// import { config } from "dotenv";

// config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // const SONARQUBE_URL = process.env.SONARQUBE_URL || "http://localhost:9000";
// // const API_TOKEN = process.env.API_TOKEN?.trim();
// // const PROJECT_KEY = process.env.PROJECT_KEY;

// // const SONARQUBE_URL = "https://sonarqube.paltechops.org";
// // const PROJECT_KEY = "buzz-api-main_new";
// // const API_TOKEN = "sqa_c09925edac9e079b7aad5d0710ed473e7cf36b2b";

// // async function fetchFromSonarQube(endpoint, params) {
// //     const query = new URLSearchParams(params).toString();
// //     const url = `${SONARQUBE_URL}${endpoint}?${query}`;

// //     const headers = API_TOKEN
// //         ? { Authorization: 'Basic ' + Buffer.from(`${API_TOKEN}:`).toString('base64') }
// //         : {};

// //     const response = await fetch(url, { headers });
// //     if (!response.ok) {
// //         throw new Error(`SonarQube API error: ${response.status} ${response.statusText}`);
// //     }
// //     return response.json();
// // }

// // async function fetchFromSonarQube(endpoint, params) {
// //     const query = new URLSearchParams(params).toString();
// //     const url = `${SONARQUBE_URL}${endpoint}?${query}`;

// //     const headers = {
// //         Authorization: 'Basic ' + Buffer.from(`${API_TOKEN}:`).toString('base64')
// //     };

// //     const response = await fetch(url, { headers });
// //     if (!response.ok) {
// //         throw new Error(`SonarQube API error: ${response.status} ${response.statusText}`);
// //     }
// //     return response.json();
// // }

// async function fetchFromSonarQube(endpoint, params) {
//   const url = `${SONARQUBE_URL}${endpoint}`;

//   const auth = Buffer.from(`${API_TOKEN}:`).toString("base64").trim();

//   const headers = {
//     Authorization: `Basic ${auth}`,
//   };
//   try {
//     const response = await axios.get(url, {
//       headers: {
//         Authorization: `Basic ${auth}`,
//       },
//       params: params,
//     });
//     console.log("SonarQube API Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error fetching from SonarQube:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }

// // app.get("/overview", async (req, res) => {
// //   try {
// //     const measures = await fetchFromSonarQube("/api/measures/component", {
// //       component: PROJECT_KEY,
// //       metricKeys:
// //         "alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc",
// //     });

// //     const qualityGate = await fetchFromSonarQube(
// //       "/api/qualitygates/project_status",
// //       {
// //         projectKey: PROJECT_KEY,
// //       }
// //     );

// //     res.json({
// //       qualityGate: qualityGate.projectStatus,
// //       measures: measures.component.measures,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Failed to fetch Overview data" });
// //   }
// // });

// app.get("/overview", async (req, res) => {
//   try {
//     const measures = await fetchFromSonarQube("/api/measures/component", {
//       component: PROJECT_KEY,
//       metricKeys:
//         "alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc",
//     });

//     const qualityGate = await fetchFromSonarQube(
//       "/api/qualitygates/project_status",
//       {
//         projectKey: PROJECT_KEY,
//       }
//     );

//     res.json({
//       qualityGate: qualityGate.projectStatus,
//       measures: measures.component.measures,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch Overview data" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(
//     `SonarQube Overview API running at http://localhost:${PORT}/overview`
//   );
// });


const API_URL = 'https://sonarqube.paltechops.org/api/measures/component';
const API_TOKEN = 'sqp_3e13d26da6aa356b62a799f210e4697605e5e082';
const encodedToken = Buffer.from(`${API_TOKEN}:`).toString('base64');

// async function fetchMeasures() {
//     try {
//         const response = await axios.get(API_URL, {
//             headers: {
//                 Authorization: "Basic c3FwXzNlMTNkMjZkYTZhYTM1NmI2MmE3OTlmMjEwZTQ2OTc2MDVlNWUwODI6",
//                 Host: 'sonarqube.paltechops.org'
//             },
//             params: {
//                 component: 'buzz-api-main_new',
//                 metricKeys: 'alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc'
//             }
//         });

//         console.log(response.data);
//     } catch (err) {
//         console.error('Error:', err);
//     }
// }

async function fetchMeasures() {
    try {
        const url = new URL(API_URL);
        url.search = new URLSearchParams({
            component: 'buzz-api-main_new',
            metricKeys: 'alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc'
        }).toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic c3FwXzNlMTNkMjZkYTZhYTM1NmI2MmE3OTlmMjEwZTQ2OTc2MDVlNWUwODI6',
                'Host': 'sonarqube.paltechops.org',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.error('Error:', err);
    }
}


fetchMeasures();