import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "./Firebase";
import { collection, getDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

const Temperature = ({ refresh }) => {
  const { state } = useLocation();
  const [user] = useAuthState(auth);
  const [data, setData] = useState([]);
  const [city, setCity] = useState();
  const [isTemperature, setTemperature] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const disableWidget = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Weather",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Temperature");
    updateDoc(docRef, { state: false })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setTemperature(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  const enableWidget = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Weather",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Temperature");
    updateDoc(docRef, { state: true })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setTemperature(true);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  useEffect(() => {
    axios
      .get(
        "http://api.weatherapi.com/v1/current.json?key=dd2eea8f2e5441ef91d141320231003&q=" +
          city +
          "&aqi=no"
      )
      .then(function (res) {
        setData(res.data);
      });
  }, [city, refresh]);

  useEffect(() => {
    const getCity = async () => {
      const servicesRef = collection(
        db,
        "Users",
        user?.uid,
        "Services",
        "Weather",
        "Widgets"
      );
      const docRef = doc(servicesRef, "Temperature");
      const docSnapshot = await getDoc(docRef);
      const data = docSnapshot.data();
      setCity(data.city);
      setTemperature(data.state);
    };
    getCity();
  }, [user]);

  const setcity = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Weather",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Temperature");
    updateDoc(docRef, { city: city })
      .then(() => {
        console.log("Document mis à jour avec succès!");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  return (
    <div class="widget-box">
      {state ? (
        <div className="center">
          <input
            type="text"
            placeholder="City"
            className="city"
            onChange={(e) => setCity(e.target.value)}
          />
          <div className="infos">
            {isTemperature === false ? (
              <ToggleOffIcon
                onClick={() => enableWidget()}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.neutral[100] }}
              />
            ) : (
              <ToggleOnIcon
                onClick={() => disableWidget()}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.primary[100] }}
              />
            )}
            <a
              style={{ fontSize: 17 + "px", cursor: "pointer" }}
              class="select"
              onClick={setcity}
            >
              Set City
            </a>
          </div>
        </div>
      ) : (
        <div>
          <h1>{data?.location?.name}</h1>
          <div class="widget-container">
            <img src={data?.current?.condition?.icon} alt="icon" />
            <p class="temperature">{data?.current?.temp_c}°C</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Temperature;
