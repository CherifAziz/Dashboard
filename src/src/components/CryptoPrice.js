import { Box, useTheme } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { tokens } from "../theme";
import { useLocation } from "react-router-dom";
import { auth, db } from "./Firebase";
import { collection, getDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

const CryptoPrice = ({ refresh }) => {
  const { state } = useLocation();
  const [data, setData] = useState([]);
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [crypto, setCrypto] = useState();
  const [isCryptoPrice, setCryptoPrice] = useState(false);

  const disableWidget = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Cryptocurrency",
      "Widgets"
    );
    const docRef = doc(servicesRef, "CryptoPrice");
    updateDoc(docRef, { state: false })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setCryptoPrice(false);
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
      "Cryptocurrency",
      "Widgets"
    );
    const docRef = doc(servicesRef, "CryptoPrice");
    updateDoc(docRef, { state: true })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setCryptoPrice(true);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  useEffect(() => {
    axios
      .get("https://api.coincap.io/v2/assets", {
        headers: {
          Authorization: `Bearer 40f6a481-8bb0-4141-8b52-c68ef328d8c6`,
        },
      })
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [refresh]);

  useEffect(() => {
    const getCrypto = async () => {
      const servicesRef = collection(
        db,
        "Users",
        user?.uid,
        "Services",
        "Cryptocurrency",
        "Widgets"
      );
      const docRef = doc(servicesRef, "CryptoPrice");
      const docSnapshot = await getDoc(docRef);
      const data = docSnapshot.data();
      setCrypto(data.crypto);
      setCryptoPrice(data?.state);
    };
    getCrypto();
  }, [user]);

  const setcrypto = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Cryptocurrency",
      "Widgets"
    );
    const docRef = doc(servicesRef, "CryptoPrice");
    updateDoc(docRef, { crypto: crypto })
      .then(() => {
        console.log("Document mis à jour avec succès!");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  return (
    <Box className="btc-widget">
      {state ? (
        <div>
          <label>Crypto :</label>
          <select
            style={{ marginLeft: 10 + "px" }}
            name="idaction"
            id="idaction"
            className="form-control"
            value={crypto}
            onChange={(e) => setCrypto(e.target.value)}
          >
            <option disabled selected>
              -- Select Crypto --
            </option>
            {data.map((item, index) => (
              <option value={index}>{item.name}</option>
            ))}
          </select>
          <div className="infos">
            {isCryptoPrice === false ? (
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
              onClick={setcrypto}
            >
              Set Crypto
            </a>
          </div>
        </div>
      ) : (
        <Box>
          <h2>Prix du {data[crypto]?.name}</h2>
          <Box className="btc-price">
            {crypto && (
              <span>{data[crypto]?.priceUsd.substring(0, 8)} USD</span>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CryptoPrice;
