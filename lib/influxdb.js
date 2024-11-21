import { InfluxDB } from '@influxdata/influxdb-client';

// Fetch environment variables
const url = process.env.NEXT_PUBLIC_INFLUX_URL;
const token = process.env.NEXT_PUBLIC_INFLUX_TOKEN;
const org = process.env.NEXT_PUBLIC_INFLUX_ORG;
const bucket = process.env.NEXT_PUBLIC_INFLUX_BUCKET;
if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_INFLUX_URL");
}
if (!token) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_INFLUX_TOKEN");
}
if (!org) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_INFLUX_ORG");
}
if (!bucket) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_INFLUX_BUCKET");
}


// console.log("INFLUX_URL:", process.env.NEXT_PUBLIC_INFLUX_URL);
// console.log("INFLUX_TOKEN:", process.env.NEXT_PUBLIC_INFLUX_TOKEN);
// console.log("INFLUX_ORG:", process.env.NEXT_PUBLIC_INFLUX_ORG);
// console.log("INFLUX_BUCKET:", process.env.NEXT_PUBLIC_INFLUX_BUCKET);

const influxDB = new InfluxDB({ url, token });
const timeRangeStart = '2024-11-21T00:00:00Z'; // Example start time
const timeRangeStop = '2024-11-21T23:59:59Z'; // Example stop time
export async function queryInfluxDB() {
    try {
        const queryApi = influxDB.getQueryApi(org);

        // const query = `from(bucket: "${bucket}") |> range(start: -1h) |> limit(n: 1)`;
        const query = `from(bucket: "${bucket}")
  // |>  range(start: -1h)
      |> range(start: ${timeRangeStart}, stop: ${timeRangeStop})

  |> filter(fn: (r) => r["_measurement"] == "docker_container_net")

  |> filter(fn: (r) => r["_field"] == "rx_bytes")
  `;

        console.log("Starting InfluxDB query...");

        let queryResult = [];
        await queryApi.queryRows(query, {
            next(row, tableMeta) {
                const data = tableMeta.toObject(row);
                queryResult.push(data);
            },
            error(error) {
                console.error("Query Error:", error);
                throw error;
            },
            complete() {
                console.log("Query completed successfully.");
            },
        });

        console.log("Query Result:", queryResult);
        return queryResult;
    } catch (error) {
        console.error("Error querying InfluxDB:", error);
    }
}
