
const HeaderCampagne = () => {
  return (
    <header className="header-campagne">
      <div className="header-left-campagne">
        <h1 className="header-title-campagne">Campagnes</h1>
      </div>

      <div className="header-right-campagne">
        <button className="btn-acheter-sms-campagne">
          Acheter des SMS
        </button>

        <div className="sms-restants-campagne">
          <span className="sms-count-campagne">0</span>
          <span className="sms-label-campagne">SMS restants</span>
        </div>

        <div className="user-menu-campagne">
          {/* <img 
            src="https://ui-avatars.com/api/?name=Alexis+Marcel&background=E77131&color=fff" 
            alt="User" 
            className="user-avatar-campagne"
          /> */}
          <div className="user-info-campagne">
            <span className="user-name-campagne">Alexis Marcel</span>
            <span className="user-id-campagne">ID du compte : 51914</span>
          </div>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
};

export default HeaderCampagne;