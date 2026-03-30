function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="loading-wrap" role="status" aria-label={label}>
      <div className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
