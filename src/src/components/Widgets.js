import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { query, collection, getDocs, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Box, Typography, useTheme } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

const Widgets = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user] = useAuthState(auth);
  const [services, setServices] = useState([]);
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    console.log(widgets);
  }, [widgets]);

  useEffect(() => {
    const fetchServices = async () => {
      const userDocRef = doc(db, "Users", user?.uid);
      const servicesRef = collection(userDocRef, "Services");

      const servicesQuery = query(servicesRef);

      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesData = [];

      servicesSnapshot.forEach((doc) => {
        servicesData.push(doc.data());
      });
      setServices(servicesData);
    };
    fetchServices();
  }, [user]);

  useEffect(() => {
    const fetchWidgets = async () => {
      const userDocRef = doc(db, "Users", user?.uid);
      const widgetsData = [];
      for (const service of services) {
        const widgetsRef = collection(
          userDocRef,
          "Services",
          service.name,
          "Widgets"
        );
        const widgetsQuery = query(widgetsRef);
        const widgetsSnapshot = await getDocs(widgetsQuery);
        widgetsSnapshot.forEach((doc) => {
          widgetsData.push(doc.data());
        });
      }
      if (widgetsData.length > 0) {
        setWidgets(widgetsData);
      }
    };
    fetchWidgets();
  }, [user, services]);

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
            Widgets
          </Typography>
          <Typography variant="h5" color={colors.neutral[300]}>
            Select your widgets
          </Typography>
        </Box>
      </Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {services?.map((service, index) => {
          if (service.state === true) {
            const foundObjects = widgets?.filter(
              (obj) => obj?.service == service.name
            );
            console.log(foundObjects);
            return foundObjects.map((widget, index) => (
              <Box
                key={index}
                gridColumn="span 3"
                backgroundColor={colors.neutral[500]}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <h1>{widget.name}</h1>
                <SettingsIcon
                  onClick={() =>
                    navigate("/widget/" + widget.name, { state: "Nickel" })
                  }
                  fontSize="large"
                  sx={{ cursor: "pointer", color: colors.neutral[100] }}
                />
              </Box>
            ));
          } else {
            return null;
          }
        })}
      </Box>
    </Box>
  );
};

export default Widgets;
