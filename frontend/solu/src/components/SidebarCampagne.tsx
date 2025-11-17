// src/components/campagne/SidebarCampagne.tsx
import  solutravo  from "../assets/images/solutravo.png"

const SidebarCampagne = () => {
  return (
    <aside className="sidebar-campagne">
      <div className="logo-container-campagne">
        <img 
          src={solutravo} 
          alt="Solutravo" 
          className="logo-campagne"
        />
      </div>

      <nav className="nav-campagne">
        <a href="#" className="nav-item-campagne active-campagne">
          <i className="fa-solid fa-bullhorn"></i>
          <span>Campagnes</span>
        </a>
      </nav>
    </aside>
  );
};

export default SidebarCampagne;