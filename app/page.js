'use client';
import { useEffect } from 'react';
import { queryInfluxDB } from '@/lib/influxdb';

export default function Home() {
  useEffect(() => {
    async function fetchData() {
      const data = await queryInfluxDB();
      console.log("Fetched Data:", data);
    }
    fetchData();
  }, []);

  return <div>Check the console for InfluxDB connection and query status.</div>;
}
