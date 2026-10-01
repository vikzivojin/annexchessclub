import "./PageLoading.scss";

export function PageLoading() {
  return (
    <div className="page-loading">
      <span className="page-loading__spinner" aria-hidden="true" />
      <span>Loading</span>
    </div>
  );
}
