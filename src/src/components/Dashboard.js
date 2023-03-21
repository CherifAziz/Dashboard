import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { auth, db } from "./Firebase";
import { query, collection, getDocs, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import Temperature from "./Temperature";
import CryptoPrice from "./CryptoPrice";
import EmailWidget from "./Gmail";
import YoutubeWidget from "./Youtube";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user] = useAuthState(auth);
  const [services, setServices] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [namesAssociated, setName] = useState([]);
  const [refreshRates, setRefreshRates] = useState({});
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    console.log(widgets);
    const foundObjects = widgets?.filter((obj) => obj?.state == true);
    setName(foundObjects?.map((obj) => obj?.name));
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
      const rates = {};
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
          const data = doc.data();
          widgetsData.push(data);
          rates[data.name] = 5000;
        });
      }
      if (widgetsData.length > 0) {
        setWidgets(widgetsData);
        setRefreshRates(rates);
      }
    };
    fetchWidgets();
  }, [user, services]);

  const updateWidgets = () => {
    const foundObjects = widgets?.filter((obj) => obj?.state == true);
    const names = foundObjects?.map((obj) => obj?.name);

    for (const name of names) {
      const refreshRate = refreshRates[name];
      if (refreshRate) {
        setRefresh(refresh + 1);
      }
    }
  };

  const Timer = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        updateWidgets();
      }, 5000);

      return () => clearInterval(interval);
    }, []);

    return null;
  };

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
            DASHBOARD
          </Typography>
          <Typography variant="h5" color={colors.neutral[300]}>
            Welcome to your dashboard
          </Typography>
        </Box>
      </Box>
      <Timer />
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        marginBottom="2vw"
      >
        {services?.map((service, index) => {
          if (service.state === true) {
            switch (service?.name) {
              case "Weather":
                if (namesAssociated.includes("Temperature"))
                  return <Temperature refresh={refresh} />;
                break;

              case "Cryptocurrency":
                if (namesAssociated.includes("CryptoPrice"))
                  return <CryptoPrice refresh={refresh} />;
                break;
              case "Google":
                if (namesAssociated.includes("Youtube"))
                  return <YoutubeWidget refresh={refresh} />;
                break;

              default:
                return null;
            }
          } else return null;
        })}
      </Box>
      {namesAssociated.includes("Gmail") &&
      services?.find((obj) => obj?.state == true && obj?.name == "Google") !=
        undefined ? (
        <EmailWidget refresh={refresh} />
      ) : null}
    </Box>
  );
};

export default Dashboard;
