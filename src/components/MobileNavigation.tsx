import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "@/lib/api-client";
import { InteractiveMenu, InteractiveMenuItem } from "./InteractiveMenu";
import { Home, ClipboardList, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Detectar página atual para destacar item correto
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/auth") {
      setCurrentIndex(0);
    } else if (location.pathname === "/orders" || location.pathname.startsWith("/order")) {
      setCurrentIndex(1);
    } else if (location.pathname === "/clients") {
      setCurrentIndex(2);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    authAPI.logout();
    navigate("/auth");
  };

  const menuItems: InteractiveMenuItem[] = [
    { 
      label: 'Início', 
      icon: Home,
      onClick: () => navigate("/")
    },
    { 
      label: 'OS', 
      icon: ClipboardList,
      onClick: () => navigate("/orders")
    },
    { 
      label: 'Clientes', 
      icon: Users,
      onClick: () => navigate("/clients")
    },
    { 
      label: 'Sair', 
      icon: LogOut,
      onClick: handleLogout
    },
  ];

  return (
    <div className="mobile-nav">
      <InteractiveMenu 
        items={menuItems}
        accentColor="hsl(var(--primary))"
        initialIndex={currentIndex}
      />
    </div>
  );
};

export default MobileNavigation;

