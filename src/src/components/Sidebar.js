import { useEffect, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import WidgetsIcon from "@mui/icons-material/Widgets";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth, db, logout } from "./Firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const Item = ({ title, to, icon, selected, setSelected, margin }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette);
  return (
    <MenuItem
      active={selected === title}
      style={{
        display: "flex",
        width: "100%",
        marginTop: margin,
        color: colors.primary[500],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      {console.log(title)}
      {title === "Logout Account" ? (
        <Link to={to} onClick={logout} />
      ) : (
        <Link to={to} />
      )}
    </MenuItem>
  );
};

const Sidebar = () => {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const fetchUserName = async () => {
    const q = query(collection(db, "Users"), where("uid", "==", user?.uid));
    const doc = await getDocs(q);
    const data = doc?.docs[0]?.data();
    console.log(user?.uid);
    setName(data?.name);
  };
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
    console.log(name);
  }, [user, loading]);

  const theme = useTheme();
  const colors = tokens(theme.palette);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.neutral[100]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#3CBEA9 !important",
        },
        "& .pro-menu-item.active": {
          color: "#3CBEA9 !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{ height: "100vh" }}>
        <Menu iconShape="square" style={{ height: "100vh" }}>
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.primary[500],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.primary[500]}>
                  DASHBOARD
                </Typography>
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  style={{ color: colors.primary[500] }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <AccountCircleIcon
                  style={{
                    borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.primary[500]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {name}
                </Typography>
                <Typography variant="h5" color={colors.primary[500]}>
                  Admin
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            paddingLeft={isCollapsed ? undefined : "10%"}
            style={{
              // height: "65vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px",
            }}
          >
            <Item
              title="Dashboard"
              to="/home"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              margin="10px"
            />
            <Item
              title="Services"
              to="/services"
              icon={<HomeRepairServiceIcon />}
              selected={selected}
              setSelected={setSelected}
              margin="10px"
            />
            <Item
              title="Widgets"
              to="/widgets"
              icon={<WidgetsIcon />}
              selected={selected}
              setSelected={setSelected}
              margin="10px"
            />
            <Item
              title="Logout Account"
              to="/login"
              icon={<LogoutIcon />}
              selected={selected}
              setSelected={setSelected}
              margin="400px"
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
