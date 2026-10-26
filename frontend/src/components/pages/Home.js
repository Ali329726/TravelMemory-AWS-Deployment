import React, { useEffect, useState } from "react";
import Card from "../UIC/Card";
import FeaturedCard from "../UIC/FeaturedCard";
import axios from "axios";
import { baseUrl } from "../../url";

export default function Home() {
  const [data, setData] = useState();

  useEffect(() => {
    axios
      .get(`${baseUrl}/trip/`)
      .then((res) => setData(res.data))
      .catch((error) => {
        console.error("Error loading trips:", error);
        setData([]);
      });
  }, []);

  if (!data) {
    return <div style={{ margin: "2%" }}>Loading...</div>;
  }

  return (
    <main className="tm-page">
      <div className="tm-content">
        {data.map((e) =>
          e.featured ? (
            <FeaturedCard
              key={e._id}
              title={e.tripName}
              tripType={e.tripType}
              description={e.shortDescription}
              id={e._id}
            />
          ) : (
            <Card
              key={e._id}
              title={e.tripName}
              tripType={e.tripType}
              description={e.shortDescription}
              id={e._id}
            />
          ),
        )}
      </div>
    </main>
  );
}
