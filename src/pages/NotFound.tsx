import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CyberBackground from "@/components/CyberBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",background:"transparent"}}>
      <CyberBackground/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"40px",background:"rgba(0,10,24,0.75)",border:"1px solid rgba(40,185,215,0.25)",borderRadius:16,backdropFilter:"blur(6px)"}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:64,fontWeight:900,color:"hsl(192,68%,55%)",margin:"0 0 8px",textShadow:"0 0 30px rgba(40,185,215,0.6)"}}>404</h1>
        <p style={{fontFamily:"'Exo 2',sans-serif",fontSize:16,color:"rgba(180,230,248,0.7)",marginBottom:24}}>Page not found</p>
        <button onClick={()=>navigate("/")} style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.08em",padding:"10px 28px",borderRadius:10,border:"0",background:"linear-gradient(135deg,hsl(192,68%,40%),hsl(200,68%,52%))",color:"rgba(4,14,24,0.98)",cursor:"pointer"}}>
          RETURN HOME
        </button>
      </div>
    </div>
  );
};

export default NotFound;
