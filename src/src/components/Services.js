import { Box, Typography, useTheme } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import GoogleIcon from "@mui/icons-material/Google";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { query, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Google from "./Google";

const Services = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isWeather, setWeather] = useState(false);
  const [isGoogle, setGoogle] = useState(false);
  const [isCrypto, setCrypto] = useState(false);
  const [user] = useAuthState(auth);
  const [services, setServices] = useState([]);

  const disableService = (Service) => {
    const servicesRef = collection(db, "Users", user?.uid, "Services");
    const docRef = doc(servicesRef, Service);
    updateDoc(docRef, { state: false })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        switch (Service) {
          case "Weather":
            setWeather(false);
            break;
          case "Google":
            setGoogle(false);
          case "Cryptocurrency":
            setCrypto(false);
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  const enableService = (Service) => {
    const servicesRef = collection(db, "Users", user?.uid, "Services");
    const docRef = doc(servicesRef, Service);
    updateDoc(docRef, { state: true })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        switch (Service) {
          case "Weather":
            setWeather(true);
            break;
          case "Google":
            setGoogle(true);
          case "Cryptocurrency":
            setCrypto(true);
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  useEffect(() => {
    services?.forEach((service) => {
      switch (service?.name) {
        case "Weather":
          setWeather(service?.state);
          break;
        case "Google":
          setGoogle(service?.state);
          break;
        case "Cryptocurrency":
          setCrypto(service?.state);
          break;
        default:
          break;
      }
    });
  }, [services]);

  useEffect(() => {
    const fetchServices = async () => {
      const userDocRef = doc(db, "Users", user?.uid);
      const servicesRef = collection(userDocRef, "Services");

      const servicesQuery = query(servicesRef);

      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesData = [];
      console.log(servicesSnapshot.size);

      servicesSnapshot.forEach((doc) => {
        servicesData.push(doc.data());
      });
      setServices(servicesData);
    };
    fetchServices();
  }, [user]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box mb="30px">
          <Typography
            variant="h2"
            color={colors.neutral[100]}
            fontWeight="bold"
            sx={{ m: "0 0 5px 0" }}
          >
            Services
          </Typography>
          <Typography variant="h5" color={colors.neutral[300]}>
            Select your services
          </Typography>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
          gridColumn="span 3"
          backgroundColor={colors.neutral[500]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box width="100%" m="0 30px">
            <Box display="flex" justifyContent="space-between">
              <Box>
                <ThermostatIcon fontSize="large" />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: colors.primary[100] }}
                >
                  Weather
                </Typography>
              </Box>
            </Box>
            {isWeather === false ? (
              <ToggleOffIcon
                onClick={() => enableService("Weather")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.neutral[100] }}
              />
            ) : (
              <ToggleOnIcon
                onClick={() => disableService("Weather")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.primary[100] }}
              />
            )}
          </Box>
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.neutral[500]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box width="100%" m="0 30px">
            <Box display="flex" justifyContent="space-between">
              <Box>
                <CurrencyBitcoinIcon fontSize="large" />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: colors.primary[100] }}
                >
                  Cryptocurrency
                </Typography>
              </Box>
            </Box>
            {isCrypto === false ? (
              <ToggleOffIcon
                onClick={() => enableService("Cryptocurrency")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.neutral[100] }}
              />
            ) : (
              <ToggleOnIcon
                onClick={() => disableService("Cryptocurrency")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.primary[100] }}
              />
            )}
          </Box>
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.neutral[500]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box width="100%" m="0 30px">
            <Box display="flex" justifyContent="space-between">
              <Box>
                <GoogleIcon fontSize="large" />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: colors.primary[100] }}
                >
                  Google
                </Typography>
              </Box>
            </Box>
            {isGoogle === false ? (
              <ToggleOffIcon
                onClick={() => enableService("Google")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.neutral[100] }}
              />
            ) : (
              <ToggleOnIcon
                onClick={() => disableService("Google")}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.primary[100] }}
              />
            )}
            <Google />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Services;
