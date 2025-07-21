const FullPageSpinner: React.FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="spinner-border text-primary"
        style={{ width: 64, height: 64 }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : null;

export default FullPageSpinner;
