"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

import React, { useState, useEffect } from "react";
import Head from "next/head";

type Coordinates = { lat: number | null; lng: number | null };

export default function Home() {
  const [spacer, setSpacer] = useState<number>(0);

  const currentUrl = window.location.href;
  const regex = /latitude=([-+]?\d*\.\d+|\d+)&longitude=([-+]?\d*\.\d+|\d+)/;
  const match = currentUrl.match(regex);
  const latParam = match ? match[1] : null;
  const lonParam = match ? match[2] : null;

  useEffect(() => {
    /*if (latParam == '1.31181' && lonParam == '103.75911'){
    console.log("Setting nationalwide view")
    setSpacer(0.2);
  } else {*/

    setSpacer(0.003);
    /*}*/
  }, []);

  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (latParam !== null && lonParam !== null) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        console.log("Setting coordinates of " + lat + " and " + lon);
        setCoordinates({ lat: lat, lng: lon });
      }
    }
  }, [latParam, lonParam]);

  return (
    <div>
      <Head>
        <title>Location Map</title>
        <meta
          name="description"
          content="Map showing the location of Changi Airport, Singapore"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Location Map</h1>
        <div style={{ height: "800px" }}>
          {coordinates.lat !== null && coordinates.lng !== null && (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                coordinates.lng
              },${coordinates.lat},${coordinates.lng + spacer},${
                coordinates.lat + spacer
              }&amp;layer=mapnik`}
            ></iframe>
          )}
        </div>
      </main>

      <footer>
        <p>Powered by OpenStreetMap</p>
      </footer>
    </div>
  );
}
